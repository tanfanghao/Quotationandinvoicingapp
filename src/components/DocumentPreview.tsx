import { DocumentData } from '../App';
import { generatePDFFromElement } from '../utils/pdf-generator';

interface DocumentPreviewProps {
  documentData: DocumentData;
  onSave?: () => void;
  onNew?: () => void;
  isEditing?: boolean;
  onClose?: () => void;
}

export function DocumentPreview({ documentData, onSave, onNew, isEditing, onClose }: DocumentPreviewProps) {
  const calculateSubtotal = () => {
    return documentData.lineItems.reduce((sum, item) => {
      let areaTotal;
      
      // Use calculationType if available, otherwise fallback to old balcony logic
      const calcType = item.calculationType || (item.type === 'balcony' ? 'perMeterWidth' : 'perSqm');
      
      if (calcType === 'perMeterWidth') {
        // Per Meter (Width): (width / 1000) * pricePerSqm * quantity
        const widthInMeters = item.width / 1000;
        areaTotal = widthInMeters * item.pricePerSqm * item.quantity;
      } else if (calcType === 'perItem') {
        // Per Item: pricePerSqm * quantity
        areaTotal = item.pricePerSqm * item.quantity;
      } else {
        // Per Sqm: area * pricePerSqm * quantity
        const area = (item.width * item.height) / 1000000;
        areaTotal = area * item.pricePerSqm * item.quantity;
      }
      
      const accessoryTotal = item.accessoryPrice || 0;
      return sum + areaTotal + accessoryTotal;
    }, 0);
  };

  const itemsTotal = calculateSubtotal();
  const discountAmount = documentData.discount;
  const totalWithTax = itemsTotal - discountAmount;
  const subtotal = totalWithTax / 1.15;
  const taxAmount = totalWithTax - subtotal;

  let status = documentData.documentType === 'quotation' ? 'Pending' : documentData.documentType === 'invoice' ? 'Sent' : 'Completed';
  if (documentData.documentType === 'receipt' && documentData.paymentStatus) {
    status = documentData.paymentStatus;
  }

  const getStatusColor = (statusValue: string) => {
    if (statusValue === 'Paid' || statusValue === 'Completed') {
      return 'bg-emerald-600';
    } else if (statusValue === 'Pending') {
      return 'bg-amber-600';
    } else if (statusValue === 'Deposit Made' || statusValue === 'Accepted') {
      return 'bg-blue-600';
    } else {
      return 'bg-red-600';
    }
  };

  const getDocumentTitle = () => {
    switch (documentData.documentType) {
      case 'quotation':
        return 'QUOTATION';
      case 'invoice':
        return 'INVOICE';
      case 'receipt':
        return 'RECEIPT';
    }
  };

  return (
    <div className="bg-slate-100 overflow-auto flex justify-center p-8 min-h-screen">
      {/* A4 Page Container */}
      <div 
        id="document-preview-pdf" 
        className="p-6 bg-white shadow-lg"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          boxSizing: 'border-box'
        }}
      >
        
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-slate-900 text-2xl font-bold mb-1">HT Aluminium & Granite</h1>
              <p className="text-slate-600 text-xs">Windows and Doors Manufacturer</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white px-6 py-2 inline-block mb-3">
                <span className="text-xs font-bold tracking-widest">{getDocumentTitle()}</span>
              </div>
              <div className="text-slate-900 font-semibold text-base">#{documentData.documentNumber}</div>
              <div className="text-slate-600 text-xs mt-1">
                {new Date(documentData.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Company & Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-3">From</div>
            <div className="text-slate-700 text-xs space-y-1">
              <div>Seychelles, Mahe</div>
              <div>Providence District</div>
              <div>Phone: +(248) 2714555/4373398</div>
              <div>Email: h.taluminium123@gmail.com</div>
            </div>
          </div>
          
          <div>
            <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-3">Bill To</div>
            <div className="text-slate-900 font-semibold mb-2 text-sm">{documentData.customer.name || 'Customer Name'}</div>
            <div className="text-slate-700 text-xs space-y-1">
              {documentData.customer.email && <div>{documentData.customer.email}</div>}
              {documentData.customer.phone && <div>{documentData.customer.phone}</div>}
              {documentData.customer.address && (
                <div className="whitespace-pre-line">{documentData.customer.address}</div>
              )}
            </div>
          </div>
        </div>

        {/* Document Details Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded px-6 py-3 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-600">Status: </span>
              <span className={`${getStatusColor(status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                {status}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Tax Rate: </span>
              <span className="text-slate-900 font-semibold">{documentData.taxRate}%</span>
            </div>
            {documentData.documentType === 'quotation' && (
              <div>
                <span className="text-slate-600">Valid Until: </span>
                <span className="text-slate-900 font-semibold">
                  {new Date(new Date(documentData.date).setDate(new Date(documentData.date).getDate() + 30))
                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left py-3 px-2 text-slate-900 text-[10px] font-semibold uppercase tracking-wide">Description</th>
                <th className="text-center py-3 px-2 text-slate-900 text-[10px] font-semibold uppercase tracking-wide">Dimensions</th>
                <th className="text-center py-3 px-2 text-slate-900 text-[10px] font-semibold uppercase tracking-wide">Area</th>
                <th className="text-center py-3 px-2 text-slate-900 text-[10px] font-semibold uppercase tracking-wide">Qty</th>
                <th className="text-right py-3 px-2 text-slate-900 text-[10px] font-semibold uppercase tracking-wide">Price/m²</th>
                <th className="text-right py-3 px-2 text-slate-900 text-[10px] font-semibold uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {documentData.lineItems.map((item, index) => {
                const area = item.width * item.height / 1000000;
                let areaTotal;
                
                // Use calculationType if available, otherwise fallback to old balcony logic
                const calcType = item.calculationType || (item.type === 'balcony' ? 'perMeterWidth' : 'perSqm');
                
                if (calcType === 'perMeterWidth') {
                  // Per Meter (Width): (width / 1000) * pricePerSqm * quantity
                  const widthInMeters = item.width / 1000;
                  areaTotal = widthInMeters * item.pricePerSqm * item.quantity;
                } else if (calcType === 'perItem') {
                  // Per Item: pricePerSqm * quantity
                  areaTotal = item.pricePerSqm * item.quantity;
                } else {
                  // Per Sqm: area * pricePerSqm * quantity
                  areaTotal = area * item.pricePerSqm * item.quantity;
                }
                
                const accessoryTotal = item.accessoryPrice || 0;
                const lineTotal = areaTotal + accessoryTotal;
                
                return (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-4 px-2">
                      <div className="text-slate-900 font-medium text-xs mb-1">
                        {item.type === 'window' ? 'Window' : item.type === 'door' ? 'Door' : 'Balcony'}
                      </div>
                      {item.description && (
                        <div className="text-slate-600 text-[10px] leading-relaxed">{item.description}</div>
                      )}
                      {item.accessoryPrice && item.accessoryPrice > 0 && (
                        <div className="text-blue-700 text-[10px] mt-2 font-medium">
                          Includes Accessories: SCR {item.accessoryPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2 text-center text-slate-700 text-xs">
                      {item.width.toFixed(0)} × {item.height.toFixed(0)} mm
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="text-slate-900 font-medium text-xs">{area.toFixed(2)} m²</span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="text-slate-900 font-semibold text-xs">{item.quantity}</span>
                    </td>
                    <td className="py-4 px-2 text-right text-slate-700 text-xs">
                      SCR {item.pricePerSqm.toFixed(2)}
                    </td>
                    <td className="py-4 px-2 text-right text-slate-900 font-semibold text-xs">
                      SCR {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {documentData.lineItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-xs">
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            {/* Calculations */}
            <div className="space-y-2 mb-4">
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs py-2">
                    <span className="text-slate-600">Items Total</span>
                    <span className="text-slate-900 font-medium">SCR {itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-2">
                    <span className="text-slate-600">Discount</span>
                    <span className="text-red-600 font-medium">- SCR {discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 my-2"></div>
                </>
              )}
              <div className="flex justify-between text-xs py-2">
                <span className="text-slate-600">Subtotal (pre-tax)</span>
                <span className="text-slate-900 font-medium">SCR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs py-2">
                <span className="text-slate-600">Tax ({documentData.taxRate}%)</span>
                <span className="text-slate-900 font-medium">SCR {taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-slate-900 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wide">Total Amount</span>
                <span className="text-xl font-bold">SCR {totalWithTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details - For Receipts */}
        {documentData.documentType === 'receipt' && (
          <div className="mb-8 border-t-2 border-slate-200 pt-8">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="text-slate-900 font-semibold mb-4 text-xs uppercase tracking-wide">Payment Details</h3>
              
              {(() => {
                const paymentMethods = new Set<string>();
                const cardNumbers: string[] = [];
                const chequeNumbers: string[] = [];

                if (documentData.paymentMethod) {
                  paymentMethods.add(documentData.paymentMethod);
                  if (documentData.paymentMethod === 'VISA' && documentData.paymentReference) {
                    cardNumbers.push(documentData.paymentReference);
                  } else if (documentData.paymentMethod === 'CHEQUE' && documentData.paymentReference) {
                    chequeNumbers.push(documentData.paymentReference);
                  }
                }

                if (documentData.additionalPayments && documentData.additionalPayments.length > 0) {
                  documentData.additionalPayments.forEach(payment => {
                    paymentMethods.add(payment.method);
                    if (payment.method === 'VISA' && payment.reference) {
                      cardNumbers.push(payment.reference);
                    } else if (payment.method === 'CHEQUE' && payment.reference) {
                      chequeNumbers.push(payment.reference);
                    }
                  });
                }
                
                const paidAmount = documentData.paymentAmount || 0;
                const remainingBalance = totalWithTax - paidAmount;
                const methodsArray = Array.from(paymentMethods);

                return (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs py-2 border-b border-slate-200">
                      <span className="text-slate-600">Payment Method(s)</span>
                      <span className="text-slate-900 font-medium">
                        {methodsArray.length > 0 ? methodsArray.join(', ') : 'N/A'}
                      </span>
                    </div>
                    
                    {cardNumbers.length > 0 && (
                      <div className="flex justify-between text-xs py-2 border-b border-slate-200">
                        <span className="text-slate-600">Card Number(s)</span>
                        <span className="text-slate-900 font-medium">{cardNumbers.join(', ')}</span>
                      </div>
                    )}
                    
                    {chequeNumbers.length > 0 && (
                      <div className="flex justify-between text-xs py-2 border-b border-slate-200">
                        <span className="text-slate-600">Cheque Number(s)</span>
                        <span className="text-slate-900 font-medium">{chequeNumbers.join(', ')}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs py-2 border-b border-slate-200">
                      <span className="text-slate-600">Payment Amount</span>
                      <span className="text-green-600 font-semibold">SCR {paidAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs py-2">
                      <span className="text-slate-600">Remaining Balance</span>
                      <span className={`font-semibold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        SCR {remainingBalance.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t-2 border-slate-300 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium text-xs">Payment Status</span>
                        <span className={`px-4 py-2 rounded font-semibold text-xs ${
                          remainingBalance <= 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {remainingBalance <= 0 ? 'PAID IN FULL' : 'PARTIAL PAYMENT'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Notes */}
        {documentData.notes && (
          <div className="mb-8 border-l-4 border-slate-900 bg-slate-50 p-6">
            <h3 className="text-slate-900 font-semibold mb-3 text-xs uppercase tracking-wide">Notes & Terms</h3>
            <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
              {documentData.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-slate-200 pt-6 text-center">
          <div className="mb-4">
            <p className="text-slate-900 font-semibold mb-2 text-xs">Thank you for your business!</p>
            {documentData.documentType === 'quotation' && (
              <p className="text-slate-600 text-[10px]">
                This quotation is valid for 30 days from the date of issue.
              </p>
            )}
            {documentData.documentType === 'invoice' && (
              <p className="text-slate-600 text-[10px]">
                Payment is due within 30 days. Please reference invoice number when making payment.
              </p>
            )}
            {documentData.documentType === 'receipt' && (
              <p className="text-slate-600 text-[10px]">
                This receipt confirms payment has been received.
              </p>
            )}
          </div>
          <div className="text-slate-400 text-[10px]">
            <p>Aluminum Windows & Doors - Professional Quality Guaranteed</p>
            <p className="mt-1">All specifications and prices are subject to our standard terms and conditions.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
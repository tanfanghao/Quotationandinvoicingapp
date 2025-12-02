import { DocumentData } from '../App';
import { Printer, Download, Save, X } from 'lucide-react';

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
      const area = (item.width * item.height) / 1000000; // Area in m²
      const priceForOne = area * item.pricePerSqm; // Price for one item
      const areaTotal = priceForOne * item.quantity; // Total for all items
      const accessoryTotal = item.accessoryPrice || 0;
      return sum + areaTotal + accessoryTotal;
    }, 0);
  };

  const itemsTotal = calculateSubtotal();
  const discountAmount = documentData.discount;
  const totalWithTax = itemsTotal - discountAmount; // This is the tax-inclusive total
  const subtotal = totalWithTax / 1.15; // Back-calculate subtotal (pre-tax amount)
  const taxAmount = totalWithTax - subtotal; // Tax is the difference

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // Dynamically import jsPDF and html2canvas
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    // Get document title
    const docTitle = getDocumentTitle();
    
    // Create a clean HTML structure with inline styles (no Tailwind classes)
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      background: #ffffff;
      padding: 40px;
      width: 794px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #000000;
    `;

    const area = (item: any) => item.width * item.height / 1000000;
    const lineTotal = (item: any) => {
      const areaTotal = area(item) * item.quantity * item.pricePerSqm;
      const accessoryTotal = item.accessoryPrice || 0;
      return areaTotal + accessoryTotal;
    };

    wrapper.innerHTML = `
      <div style="background: white; padding: 20px;">
        <!-- Header -->
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h1 style="color: #2563eb; margin: 0 0 12px 0; font-size: 28px;">Aluminum Windows & Doors</h1>
              <div>
                <p style="margin: 4px 0; color: #374151;">Professional Installation & Manufacturing</p>
                <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">123 Industry Street, Business District</p>
                <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Phone: +1 (555) 123-4567</p>
                <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">Email: info@aluminumwd.com</p>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; margin-bottom: 12px;">
                <div style="letter-spacing: 2px; font-weight: bold; font-size: 16px;">${docTitle}</div>
              </div>
              <p style="margin: 4px 0; color: #111827;">${documentData.documentNumber}</p>
              <p style="margin: 4px 0; color: #6b7280;">Date: ${new Date(documentData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
          <div style="margin-bottom: 12px; color: #111827;">Bill To:</div>
          <div style="color: #374151;">
            <p style="margin: 4px 0; color: #111827;">${documentData.customer.name || 'Customer Name'}</p>
            ${documentData.customer.email ? `<p style="margin: 4px 0; font-size: 14px;">${documentData.customer.email}</p>` : ''}
            ${documentData.customer.phone ? `<p style="margin: 4px 0; font-size: 14px;">${documentData.customer.phone}</p>` : ''}
            ${documentData.customer.address ? `<p style="margin: 4px 0; font-size: 14px; white-space: pre-line;">${documentData.customer.address}</p>` : ''}
          </div>
        </div>

        <!-- Line Items -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #eff6ff; border-bottom: 2px solid #2563eb;">
              <th style="padding: 12px 16px; text-align: left; color: #111827;">Item</th>
              <th style="padding: 12px 16px; text-align: center; color: #111827;">Dimensions</th>
              <th style="padding: 12px 16px; text-align: center; color: #111827;">Area</th>
              <th style="padding: 12px 16px; text-align: center; color: #111827;">Qty</th>
              <th style="padding: 12px 16px; text-align: right; color: #111827;">Price/m²</th>
              <th style="padding: 12px 16px; text-align: right; color: #111827;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${documentData.lineItems.map((item, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 16px;">
                  <div style="color: #111827;">${item.type === 'window' ? 'Window' : 'Door'}</div>
                  ${item.description ? `<div style="color: #6b7280; font-size: 14px; margin-top: 4px;">${item.description}</div>` : ''}
                </td>
                <td style="padding: 16px; text-align: center; color: #374151;">${item.width.toFixed(0)}mm × ${item.height.toFixed(0)}mm</td>
                <td style="padding: 16px; text-align: center; color: #374151;">${area(item).toFixed(2)} m²</td>
                <td style="padding: 16px; text-align: center; color: #374151;">${item.quantity}</td>
                <td style="padding: 16px; text-align: right; color: #374151;">SCR ${item.pricePerSqm.toFixed(2)}</td>
                <td style="padding: 16px; text-align: right; color: #111827;">SCR ${lineTotal(item).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
          <div style="width: 384px;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              ${discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #374151;">Items Total:</span>
                  <span style="color: #111827;">SCR ${itemsTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #374151;">Discount:</span>
                  <span style="color: #dc2626;">-SCR ${discountAmount.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #d1d5db;">
                  <span style="color: #374151;">Subtotal:</span>
                  <span style="color: #111827;">SCR ${subtotal.toFixed(2)}</span>
                </div>
              ` : `
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #374151;">Subtotal:</span>
                  <span style="color: #111827;">SCR ${subtotal.toFixed(2)}</span>
                </div>
              `}
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #d1d5db;">
                <span style="color: #374151;">Tax (${documentData.taxRate}%):</span>
                <span style="color: #111827;">SCR ${taxAmount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #2563eb;">
                <span style="color: #111827;">Total Amount:</span>
                <span style="color: #2563eb; font-weight: 600;">SCR ${totalWithTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        ${documentData.notes ? `
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border: 1px solid #fde68a; margin-bottom: 24px;">
            <div style="color: #111827; margin-bottom: 8px;">Notes & Terms:</div>
            <p style="color: #374151; font-size: 14px; white-space: pre-line; margin: 0;">${documentData.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding-top: 24px; border-top: 2px solid #d1d5db; text-align: center;">
          <p style="color: #111827; margin: 8px 0;">Thank you for your business!</p>
          ${documentData.documentType === 'quotation' ? `<p style="color: #6b7280; font-size: 14px; margin: 8px 0;">This quotation is valid for 30 days from the date of issue.</p>` : ''}
          ${documentData.documentType === 'invoice' ? `<p style="color: #6b7280; font-size: 14px; margin: 8px 0;">Payment is due within 30 days. Please reference invoice number when making payment.</p>` : ''}
          ${documentData.documentType === 'receipt' ? `<p style="color: #6b7280; font-size: 14px; margin: 8px 0;">This receipt confirms payment has been received in full.</p>` : ''}
          <p style="color: #9ca3af; font-size: 12px; margin-top: 12px;">Aluminum Windows & Doors - Professional Quality Guaranteed</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(wrapper);

    try {
      // Create canvas from the element with high quality settings
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${documentData.documentNumber}.pdf`);
    } finally {
      // Clean up
      document.body.removeChild(wrapper);
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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b flex items-center justify-between print:hidden bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <h2 className="text-gray-900">Document Preview</h2>
        <div className="flex gap-2">
          {onSave && onNew && (
            <button
              onClick={() => {
                onSave();
                onNew();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          )}
        </div>
      </div>

      <div id="document-preview-pdf" className="p-16 space-y-12 flex-1 bg-white">
        {/* Header Section - Company Branding */}
        <div className="relative">
          <div className="flex items-start justify-between pb-10 border-b-4 border-blue-600">
            <div className="flex-1 pr-8">
              <div className="mb-8">
                <h1 className="text-blue-700 mb-4 tracking-tight leading-tight" style={{ fontSize: '36px', fontWeight: '700' }}>
                  Aluminum Windows & Doors
                </h1>
                <div className="h-1 w-28 bg-blue-600 rounded-full"></div>
              </div>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-center gap-3 text-base">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Professional Installation & Manufacturing
                </p>
                <p className="flex items-center gap-3 text-sm mt-3">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  123 Industry Street, Business District
                </p>
                <p className="flex items-center gap-3 text-sm mt-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  Phone: +1 (555) 123-4567 | Email: info@aluminumwd.com
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex flex-col items-end">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-10 py-5 rounded-xl shadow-lg mb-6">
                  <div className="tracking-widest uppercase" style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '0.15em' }}>
                    {getDocumentTitle()}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-900" style={{ fontSize: '20px', fontWeight: '600' }}>
                    #{documentData.documentNumber}
                  </p>
                  <p className="text-gray-600">
                    {new Date(documentData.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-10">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-5" style={{ fontWeight: '600' }}>
              Bill To
            </div>
            <div className="space-y-4">
              <p className="text-gray-900" style={{ fontSize: '20px', fontWeight: '600' }}>
                {documentData.customer.name || 'Customer Name'}
              </p>
              {documentData.customer.email && (
                <p className="text-gray-700 flex items-center gap-3 mt-4">
                  <span className="text-gray-400">✉</span>
                  {documentData.customer.email}
                </p>
              )}
              {documentData.customer.phone && (
                <p className="text-gray-700 flex items-center gap-3 mt-3">
                  <span className="text-gray-400">☎</span>
                  {documentData.customer.phone}
                </p>
              )}
              {documentData.customer.address && (
                <p className="text-gray-700 whitespace-pre-line flex items-start gap-3 leading-relaxed mt-3">
                  <span className="text-gray-400 mt-0.5">⌂</span>
                  <span>{documentData.customer.address}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
            <div className="text-blue-700 text-xs uppercase tracking-wider mb-5" style={{ fontWeight: '600' }}>
              Document Details
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-full" style={{ fontWeight: '600' }}>
                  {documentData.documentType === 'quotation' ? 'Pending' : 
                   documentData.documentType === 'invoice' ? 'Sent' : 'Completed'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-600">Tax Rate:</span>
                <span className="text-gray-900" style={{ fontWeight: '600' }}>{documentData.taxRate}%</span>
              </div>
              {documentData.documentType === 'quotation' && (
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="text-gray-900" style={{ fontWeight: '600' }}>
                    {new Date(new Date(documentData.date).setDate(new Date(documentData.date).getDate() + 30))
                      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <th className="py-6 px-6 text-left text-xs uppercase tracking-wider" style={{ fontWeight: '700' }}>
                  Item Description
                </th>
                <th className="py-6 px-6 text-center text-xs uppercase tracking-wider" style={{ fontWeight: '700' }}>
                  Dimensions
                </th>
                <th className="py-6 px-6 text-center text-xs uppercase tracking-wider" style={{ fontWeight: '700' }}>
                  Area
                </th>
                <th className="py-6 px-6 text-center text-xs uppercase tracking-wider" style={{ fontWeight: '700' }}>
                  Qty
                </th>
                <th className="py-6 px-6 text-right text-xs uppercase tracking-wider" style={{ fontWeight: '700' }}>
                  Price/m²
                </th>
                <th className="py-6 px-6 text-right text-xs uppercase tracking-wider" style={{ fontWeight: '700' }}>
                  Line Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {documentData.lineItems.map((item, index) => {
                const area = item.width * item.height / 1000000;
                const areaTotal = area * item.quantity * item.pricePerSqm;
                const accessoryTotal = item.accessoryPrice || 0;
                const lineTotal = areaTotal + accessoryTotal;
                return (
                  <tr key={item.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-white ${item.type === 'window' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                          <span style={{ fontSize: '24px' }}>{item.type === 'window' ? '◱' : '◰'}</span>
                        </div>
                        <div>
                          <div className="text-gray-900 mb-2" style={{ fontWeight: '600', fontSize: '15px' }}>
                            {item.type === 'window' ? 'Window' : 'Door'}
                          </div>
                          {item.description && (
                            <div className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</div>
                          )}
                          {item.accessoryPrice && item.accessoryPrice > 0 && (
                            <div className="text-blue-600 text-xs mt-3 px-3 py-1 bg-blue-50 rounded-full inline-block" style={{ fontWeight: '500' }}>
                              + Accessories: SCR {item.accessoryPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <div className="space-y-2">
                        <div className="text-gray-900" style={{ fontWeight: '500', fontSize: '15px' }}>
                          {item.width.toFixed(0)}mm
                        </div>
                        <div className="text-gray-400 text-xs">×</div>
                        <div className="text-gray-900" style={{ fontWeight: '500', fontSize: '15px' }}>
                          {item.height.toFixed(0)}mm
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <div className="inline-flex items-center gap-1 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full" style={{ fontWeight: '600', fontSize: '15px' }}>
                        {area.toFixed(2)} m²
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-gray-900" style={{ fontWeight: '600', fontSize: '16px' }}>
                        {item.quantity}
                      </div>
                    </td>
                    <td className="py-6 px-6 text-right text-gray-700 text-base">
                      SCR {item.pricePerSqm.toFixed(2)}
                    </td>
                    <td className="py-6 px-6 text-right text-gray-900" style={{ fontWeight: '600', fontSize: '16px' }}>
                      SCR {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {documentData.lineItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="text-gray-400">No items added</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mt-12">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-8 space-y-5">
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-base">Items Total</span>
                      <span className="text-gray-900 text-base" style={{ fontWeight: '600' }}>
                        SCR {itemsTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 text-base">Discount</span>
                      <span className="text-red-600 text-base" style={{ fontWeight: '600' }}>
                        - SCR {discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-300 my-4"></div>
                  </>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 text-base">Subtotal (pre-tax)</span>
                  <span className="text-gray-900" style={{ fontWeight: '600', fontSize: '17px' }}>
                    SCR {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 mt-3">
                  <span className="text-gray-700 text-base">Tax ({documentData.taxRate}%)</span>
                  <span className="text-gray-900 text-base" style={{ fontWeight: '600' }}>
                    SCR {taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 uppercase tracking-wider" style={{ fontWeight: '700' }}>
                    Total Amount
                  </span>
                  <span className="text-white" style={{ fontWeight: '700', fontSize: '32px' }}>
                    SCR {totalWithTax.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {documentData.notes && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-xl border-l-4 border-amber-500 mt-12">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <span style={{ fontSize: '20px' }}>📋</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-900 mb-4" style={{ fontWeight: '600', fontSize: '16px' }}>Notes & Terms</div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {documentData.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-12 border-t-2 border-gray-200 mt-12">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-900" style={{ fontSize: '18px', fontWeight: '600' }}>
                Thank you for your business!
              </p>
              {documentData.documentType === 'quotation' && (
                <p className="text-gray-600 leading-relaxed">
                  This quotation is valid for 30 days from the date of issue.
                </p>
              )}
              {documentData.documentType === 'invoice' && (
                <p className="text-gray-600 leading-relaxed">
                  Payment is due within 30 days. Please reference invoice number when making payment.
                </p>
              )}
              {documentData.documentType === 'receipt' && (
                <p className="text-gray-600 leading-relaxed">
                  This receipt confirms payment has been received in full.
                </p>
              )}
            </div>
            <div className="pt-6 border-t border-gray-200 mt-6">
              <p className="text-gray-500 text-sm">
                Aluminum Windows & Doors - Professional Quality Guaranteed
              </p>
              <p className="text-gray-400 text-xs mt-3">
                All specifications and prices are subject to our standard terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
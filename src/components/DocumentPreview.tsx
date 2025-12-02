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
      padding: 24px;
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
      <div style="background: white; padding: 12px;">
        <!-- Header -->
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h1 style="color: #2563eb; margin: 0 0 6px 0; font-size: 18px;">Aluminum Windows & Doors</h1>
              <div>
                <p style="margin: 2px 0; color: #374151; font-size: 11px;">Professional Installation & Manufacturing</p>
                <p style="margin: 2px 0; color: #6b7280; font-size: 9px;">123 Industry Street, Business District</p>
                <p style="margin: 2px 0; color: #6b7280; font-size: 9px;">Phone: +1 (555) 123-4567</p>
                <p style="margin: 2px 0; color: #6b7280; font-size: 9px;">Email: info@aluminumwd.com</p>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; margin-bottom: 6px;">
                <div style="letter-spacing: 2px; font-weight: 700; font-size: 14px; color: #ffffff;">${docTitle}</div>
              </div>
              <p style="margin: 2px 0; color: #111827; font-size: 11px; font-weight: 600;">${documentData.documentNumber}</p>
              <p style="margin: 2px 0; color: #6b7280; font-size: 9px;">Date: ${new Date(documentData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <!-- Customer Details -->
        <div style="background: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
          <div style="margin-bottom: 6px; color: #111827; font-size: 10px; font-weight: 600;">Bill To:</div>
          <div style="color: #374151;">
            <p style="margin: 2px 0; color: #111827; font-size: 11px;">${documentData.customer.name || 'Customer Name'}</p>
            ${documentData.customer.email ? `<p style="margin: 2px 0; font-size: 9px;">${documentData.customer.email}</p>` : ''}
            ${documentData.customer.phone ? `<p style="margin: 2px 0; font-size: 9px;">${documentData.customer.phone}</p>` : ''}
            ${documentData.customer.address ? `<p style="margin: 2px 0; font-size: 9px; white-space: pre-line;">${documentData.customer.address}</p>` : ''}
          </div>
        </div>

        <!-- Line Items -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
          <thead>
            <tr style="background: #eff6ff; border-bottom: 2px solid #2563eb;">
              <th style="padding: 6px 8px; text-align: left; color: #111827; font-size: 9px;">Item</th>
              <th style="padding: 6px 8px; text-align: center; color: #111827; font-size: 9px;">Dimensions</th>
              <th style="padding: 6px 8px; text-align: center; color: #111827; font-size: 9px;">Area</th>
              <th style="padding: 6px 8px; text-align: center; color: #111827; font-size: 9px;">Qty</th>
              <th style="padding: 6px 8px; text-align: right; color: #111827; font-size: 9px;">Price/m²</th>
              <th style="padding: 6px 8px; text-align: right; color: #111827; font-size: 9px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${documentData.lineItems.map((item, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 8px;">
                  <div style="color: #111827; font-size: 10px;">${item.type === 'window' ? 'Window' : 'Door'}</div>
                  ${item.description ? `<div style="color: #6b7280; font-size: 8px; margin-top: 2px;">${item.description}</div>` : ''}
                </td>
                <td style="padding: 8px; text-align: center; color: #374151; font-size: 9px;">${item.width.toFixed(0)}mm × ${item.height.toFixed(0)}mm</td>
                <td style="padding: 8px; text-align: center; color: #374151; font-size: 9px;">${area(item).toFixed(2)} m²</td>
                <td style="padding: 8px; text-align: center; color: #374151; font-size: 9px;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right; color: #374151; font-size: 9px;">SCR ${item.pricePerSqm.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; color: #111827; font-size: 10px;">SCR ${lineTotal(item).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
          <div style="width: 280px;">
            <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
              ${discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <span style="color: #374151; font-size: 9px;">Items Total:</span>
                  <span style="color: #111827; font-size: 9px;">SCR ${itemsTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <span style="color: #374151; font-size: 9px;">Discount:</span>
                  <span style="color: #dc2626; font-size: 9px;">-SCR ${discountAmount.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid #d1d5db;">
                  <span style="color: #374151; font-size: 9px;">Subtotal:</span>
                  <span style="color: #111827; font-size: 9px;">SCR ${subtotal.toFixed(2)}</span>
                </div>
              ` : `
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <span style="color: #374151; font-size: 9px;">Subtotal:</span>
                  <span style="color: #111827; font-size: 9px;">SCR ${subtotal.toFixed(2)}</span>
                </div>
              `}
              <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid #d1d5db;">
                <span style="color: #374151; font-size: 9px;">Tax (${documentData.taxRate}%):</span>
                <span style="color: #111827; font-size: 9px;">SCR ${taxAmount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 2px solid #2563eb;">
                <span style="color: #111827; font-size: 10px; font-weight: 600;">Total Amount:</span>
                <span style="color: #2563eb; font-weight: 600; font-size: 12px;">SCR ${totalWithTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        ${documentData.notes ? `
          <div style="background: #fffbeb; padding: 12px; border-radius: 6px; border: 1px solid #fde68a; margin-bottom: 12px;">
            <div style="color: #111827; margin-bottom: 4px; font-size: 10px; font-weight: 600;">Notes & Terms:</div>
            <p style="color: #374151; font-size: 9px; white-space: pre-line; margin: 0;">${documentData.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="padding-top: 12px; border-top: 2px solid #d1d5db; text-align: center;">
          <p style="color: #111827; margin: 4px 0; font-size: 10px; font-weight: 600;">Thank you for your business!</p>
          ${documentData.documentType === 'quotation' ? `<p style="color: #6b7280; font-size: 9px; margin: 4px 0;">This quotation is valid for 30 days from the date of issue.</p>` : ''}
          ${documentData.documentType === 'invoice' ? `<p style="color: #6b7280; font-size: 9px; margin: 4px 0;">Payment is due within 30 days. Please reference invoice number when making payment.</p>` : ''}
          ${documentData.documentType === 'receipt' ? `<p style="color: #6b7280; font-size: 9px; margin: 4px 0;">This receipt confirms payment has been received in full.</p>` : ''}
          <p style="color: #9ca3af; font-size: 8px; margin-top: 6px;">Aluminum Windows & Doors - Professional Quality Guaranteed</p>
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

      <div id="document-preview-pdf" className="p-8 space-y-6 flex-1 bg-white">
        {/* Header Section - Company Branding */}
        <div className="relative">
          <div className="flex items-start justify-between pb-4 border-b-2 border-blue-600">
            <div className="flex-1 pr-4">
              <div className="mb-4">
                <h1 className="text-blue-700 mb-2 tracking-tight leading-tight" style={{ fontSize: '20px', fontWeight: '700' }}>
                  Aluminum Windows & Doors
                </h1>
                <div className="h-0.5 w-16 bg-blue-600 rounded-full"></div>
              </div>
              <div className="space-y-1 text-gray-600 text-xs">
                <p className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                  Professional Installation & Manufacturing
                </p>
                <p className="flex items-center gap-2 mt-1.5">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  123 Industry Street, Business District
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Phone: +1 (555) 123-4567 | Email: info@aluminumwd.com
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex flex-col items-end">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md mb-3">
                  <div className="tracking-widest uppercase text-xs" style={{ fontWeight: '700', letterSpacing: '0.1em' }}>
                    {getDocumentTitle()}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-900 text-sm" style={{ fontWeight: '600' }}>
                    #{documentData.documentNumber}
                  </p>
                  <p className="text-gray-600 text-xs">
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
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-2" style={{ fontWeight: '600' }}>
              Bill To
            </div>
            <div className="space-y-1.5">
              <p className="text-gray-900 text-sm" style={{ fontWeight: '600' }}>
                {documentData.customer.name || 'Customer Name'}
              </p>
              {documentData.customer.email && (
                <p className="text-gray-700 flex items-center gap-2 text-xs mt-2">
                  <span className="text-gray-400">✉</span>
                  {documentData.customer.email}
                </p>
              )}
              {documentData.customer.phone && (
                <p className="text-gray-700 flex items-center gap-2 text-xs mt-1.5">
                  <span className="text-gray-400">☎</span>
                  {documentData.customer.phone}
                </p>
              )}
              {documentData.customer.address && (
                <p className="text-gray-700 whitespace-pre-line flex items-start gap-2 leading-relaxed text-xs mt-1.5">
                  <span className="text-gray-400 mt-0.5">⌂</span>
                  <span>{documentData.customer.address}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-700 text-xs uppercase tracking-wider mb-2" style={{ fontWeight: '600' }}>
              Document Details
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs">Status:</span>
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full" style={{ fontWeight: '600', fontSize: '10px' }}>
                  {documentData.documentType === 'quotation' ? 'Pending' : 
                   documentData.documentType === 'invoice' ? 'Sent' : 'Completed'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600 text-xs">Tax Rate:</span>
                <span className="text-gray-900 text-xs" style={{ fontWeight: '600' }}>{documentData.taxRate}%</span>
              </div>
              {documentData.documentType === 'quotation' && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600 text-xs">Valid Until:</span>
                  <span className="text-gray-900 text-xs" style={{ fontWeight: '600' }}>
                    {new Date(new Date(documentData.date).setDate(new Date(documentData.date).getDate() + 30))
                      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <th className="py-2 px-3 text-left text-xs uppercase tracking-wider" style={{ fontWeight: '700', fontSize: '10px' }}>
                  Item Description
                </th>
                <th className="py-2 px-3 text-center text-xs uppercase tracking-wider" style={{ fontWeight: '700', fontSize: '10px' }}>
                  Dimensions
                </th>
                <th className="py-2 px-3 text-center text-xs uppercase tracking-wider" style={{ fontWeight: '700', fontSize: '10px' }}>
                  Area
                </th>
                <th className="py-2 px-3 text-center text-xs uppercase tracking-wider" style={{ fontWeight: '700', fontSize: '10px' }}>
                  Qty
                </th>
                <th className="py-2 px-3 text-right text-xs uppercase tracking-wider" style={{ fontWeight: '700', fontSize: '10px' }}>
                  Price/m²
                </th>
                <th className="py-2 px-3 text-right text-xs uppercase tracking-wider" style={{ fontWeight: '700', fontSize: '10px' }}>
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
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white ${item.type === 'window' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                          <span style={{ fontSize: '14px' }}>{item.type === 'window' ? '◱' : '◰'}</span>
                        </div>
                        <div>
                          <div className="text-gray-900 mb-0.5 text-xs" style={{ fontWeight: '600' }}>
                            {item.type === 'window' ? 'Window' : 'Door'}
                          </div>
                          {item.description && (
                            <div className="text-gray-600 text-xs mt-1 leading-relaxed" style={{ fontSize: '10px' }}>{item.description}</div>
                          )}
                          {item.accessoryPrice && item.accessoryPrice > 0 && (
                            <div className="text-blue-600 text-xs mt-1 px-2 py-0.5 bg-blue-50 rounded-full inline-block" style={{ fontWeight: '500', fontSize: '9px' }}>
                              + Accessories: SCR {item.accessoryPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="space-y-1">
                        <div className="text-gray-900 text-xs" style={{ fontWeight: '500' }}>
                          {item.width.toFixed(0)}mm
                        </div>
                        <div className="text-gray-400" style={{ fontSize: '9px' }}>×</div>
                        <div className="text-gray-900 text-xs" style={{ fontWeight: '500' }}>
                          {item.height.toFixed(0)}mm
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs" style={{ fontWeight: '600', fontSize: '10px' }}>
                        {area.toFixed(2)} m²
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full text-gray-900 text-xs" style={{ fontWeight: '600' }}>
                        {item.quantity}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700 text-xs">
                      SCR {item.pricePerSqm.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-900 text-xs" style={{ fontWeight: '600' }}>
                      SCR {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {documentData.lineItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="text-gray-400 text-sm">No items added</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mt-6">
          <div className="w-full max-w-xs">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 space-y-2">
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 text-xs">Items Total</span>
                      <span className="text-gray-900 text-xs" style={{ fontWeight: '600' }}>
                        SCR {itemsTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600 text-xs">Discount</span>
                      <span className="text-red-600 text-xs" style={{ fontWeight: '600' }}>
                        - SCR {discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-300 my-2"></div>
                  </>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-700 text-xs">Subtotal (pre-tax)</span>
                  <span className="text-gray-900 text-xs" style={{ fontWeight: '600' }}>
                    SCR {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 mt-1">
                  <span className="text-gray-700 text-xs">Tax ({documentData.taxRate}%)</span>
                  <span className="text-gray-900 text-xs" style={{ fontWeight: '600' }}>
                    SCR {taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 uppercase tracking-wider text-xs" style={{ fontWeight: '700', fontSize: '10px' }}>
                    Total Amount
                  </span>
                  <span className="text-white" style={{ fontWeight: '700', fontSize: '18px' }}>
                    SCR {totalWithTax.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {documentData.notes && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-500 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center text-white flex-shrink-0">
                <span style={{ fontSize: '14px' }}>📋</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-900 mb-2 text-xs" style={{ fontWeight: '600' }}>Notes & Terms</div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-xs">
                  {documentData.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t-2 border-gray-200 mt-6">
          <div className="text-center space-y-3">
            <div className="space-y-2">
              <p className="text-gray-900 text-sm" style={{ fontWeight: '600' }}>
                Thank you for your business!
              </p>
              {documentData.documentType === 'quotation' && (
                <p className="text-gray-600 leading-relaxed text-xs">
                  This quotation is valid for 30 days from the date of issue.
                </p>
              )}
              {documentData.documentType === 'invoice' && (
                <p className="text-gray-600 leading-relaxed text-xs">
                  Payment is due within 30 days. Please reference invoice number when making payment.
                </p>
              )}
              {documentData.documentType === 'receipt' && (
                <p className="text-gray-600 leading-relaxed text-xs">
                  This receipt confirms payment has been received in full.
                </p>
              )}
            </div>
            <div className="pt-3 border-t border-gray-200 mt-3">
              <p className="text-gray-500 text-xs">
                Aluminum Windows & Doors - Professional Quality Guaranteed
              </p>
              <p className="text-gray-400 text-xs mt-1.5" style={{ fontSize: '10px' }}>
                All specifications and prices are subject to our standard terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
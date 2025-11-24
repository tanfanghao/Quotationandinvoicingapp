import { DocumentData } from '../App';
import { Printer, Download, Save } from 'lucide-react';

interface DocumentPreviewProps {
  documentData: DocumentData;
  onSave?: () => void;
  onNew?: () => void;
  isEditing?: boolean;
}

export function DocumentPreview({ documentData, onSave, onNew, isEditing }: DocumentPreviewProps) {
  const calculateSubtotal = () => {
    return documentData.lineItems.reduce((sum, item) => {
      return sum + (item.width * item.height * item.quantity * item.pricePerSqm);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = documentData.discount;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * documentData.taxRate) / 100;
  const total = subtotalAfterDiscount + taxAmount;

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

    const area = (item: any) => item.width * item.height;
    const lineTotal = (item: any) => area(item) * item.quantity * item.pricePerSqm;

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
                <td style="padding: 16px; text-align: center; color: #374151;">${item.width.toFixed(2)}m × ${item.height.toFixed(2)}m</td>
                <td style="padding: 16px; text-align: center; color: #374151;">${area(item).toFixed(2)} m²</td>
                <td style="padding: 16px; text-align: center; color: #374151;">${item.quantity}</td>
                <td style="padding: 16px; text-align: right; color: #374151;">$${item.pricePerSqm.toFixed(2)}</td>
                <td style="padding: 16px; text-align: right; color: #111827;">$${lineTotal(item).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
          <div style="width: 384px;">
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #374151;">Subtotal:</span>
                <span style="color: #111827;">$${subtotal.toFixed(2)}</span>
              </div>
              ${discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #374151;">Discount:</span>
                  <span style="color: #dc2626;">-$${discountAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #d1d5db;">
                <span style="color: #374151;">Tax (${documentData.taxRate}%):</span>
                <span style="color: #111827;">$${taxAmount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #2563eb;">
                <span style="color: #111827;">Total Amount:</span>
                <span style="color: #2563eb; font-weight: 600;">$${total.toFixed(2)}</span>
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
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center justify-between print:hidden">
        <h2 className="text-gray-900">Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          {onSave && onNew && (
            <button
              onClick={() => {
                onSave();
                onNew();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
        </div>
      </div>

      <div id="document-preview-pdf" className="p-8 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-blue-600 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-blue-600 mb-3 tracking-tight">Aluminum Windows & Doors</h1>
              <div className="space-y-1">
                <p className="text-gray-700">Professional Installation & Manufacturing</p>
                <p className="text-gray-600 text-sm">123 Industry Street, Business District</p>
                <p className="text-gray-600 text-sm">Phone: +1 (555) 123-4567</p>
                <p className="text-gray-600 text-sm">Email: info@aluminumwd.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg mb-3">
                <div className="tracking-wider">{getDocumentTitle()}</div>
              </div>
              <p className="text-gray-900 mb-1">{documentData.documentNumber}</p>
              <p className="text-gray-600">Date: {new Date(documentData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="text-gray-900 mb-3">Bill To:</div>
          <div className="text-gray-700 space-y-1">
            <p className="text-gray-900">{documentData.customer.name || 'Customer Name'}</p>
            {documentData.customer.email && <p className="text-sm">{documentData.customer.email}</p>}
            {documentData.customer.phone && <p className="text-sm">{documentData.customer.phone}</p>}
            {documentData.customer.address && (
              <p className="whitespace-pre-line text-sm">{documentData.customer.address}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 border-b-2 border-blue-600">
                <th className="py-3 px-4 text-left text-gray-900">Item</th>
                <th className="py-3 px-4 text-center text-gray-900">Dimensions</th>
                <th className="py-3 px-4 text-center text-gray-900">Area</th>
                <th className="py-3 px-4 text-center text-gray-900">Qty</th>
                <th className="py-3 px-4 text-right text-gray-900">Price/m²</th>
                <th className="py-3 px-4 text-right text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {documentData.lineItems.map((item, index) => {
                const area = item.width * item.height;
                const lineTotal = area * item.quantity * item.pricePerSqm;
                return (
                  <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">
                        {item.type === 'window' ? 'Window' : 'Door'}
                      </div>
                      {item.description && (
                        <div className="text-gray-600 text-sm mt-1">{item.description}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700">
                      {item.width.toFixed(2)}m × {item.height.toFixed(2)}m
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700">
                      {area.toFixed(2)} m²
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-4 px-4 text-right text-gray-700">
                      ${item.pricePerSqm.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      ${lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
              {documentData.lineItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-96">
            <div className="space-y-2 bg-gray-50 p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Discount:</span>
                  <span className="text-red-600">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-300">
                <span className="text-gray-700">Tax ({documentData.taxRate}%):</span>
                <span className="text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-blue-600">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {documentData.notes && (
          <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
            <div className="text-gray-900 mb-2">Notes & Terms:</div>
            <p className="text-gray-700 whitespace-pre-line text-sm">{documentData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t-2 border-gray-300 text-center space-y-2">
          <p className="text-gray-900">Thank you for your business!</p>
          {documentData.documentType === 'quotation' && (
            <p className="text-gray-600 text-sm">This quotation is valid for 30 days from the date of issue.</p>
          )}
          {documentData.documentType === 'invoice' && (
            <p className="text-gray-600 text-sm">Payment is due within 30 days. Please reference invoice number when making payment.</p>
          )}
          {documentData.documentType === 'receipt' && (
            <p className="text-gray-600 text-sm">This receipt confirms payment has been received in full.</p>
          )}
          <p className="text-gray-500 text-xs mt-3">
            Aluminum Windows & Doors - Professional Quality Guaranteed
          </p>
        </div>
      </div>
    </div>
  );
}
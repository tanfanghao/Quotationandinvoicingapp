import { DocumentData } from '../App';

export function generatePDFHTML(viewingDocument: DocumentData): string {
  const getDocumentTitle = () => {
    if (viewingDocument.documentType === 'quotation') return 'QUOTATION';
    if (viewingDocument.documentType === 'invoice') return 'INVOICE';
    return 'RECEIPT';
  };

  const area = (item: any) => item.width * item.height / 1000000;
  const lineTotal = (item: any) => {
    const areaTotal = area(item) * item.quantity * item.pricePerSqm;
    const accessoryTotal = item.accessoryPrice || 0;
    return areaTotal + accessoryTotal;
  };

  const calculateSubtotal = () => {
    return viewingDocument.lineItems.reduce((sum, item) => {
      const area = (item.width * item.height) / 1000000;
      const priceForOne = area * item.pricePerSqm;
      const areaTotal = priceForOne * item.quantity;
      const accessoryTotal = item.accessoryPrice || 0;
      return sum + areaTotal + accessoryTotal;
    }, 0);
  };

  const itemsTotal = calculateSubtotal();
  const discountAmount = viewingDocument.discount;
  const totalWithTax = itemsTotal - discountAmount;
  const subtotal = totalWithTax / 1.15;
  const taxAmount = totalWithTax - subtotal;
  const docTitle = getDocumentTitle();

  return `
    <div style="background: white; padding: 24px;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between;">
          <div style="padding-right: 16px;">
            <h1 style="color: #1d4ed8; margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">Aluminum Windows & Doors</h1>
            <div style="width: 64px; height: 2px; background: #2563eb; border-radius: 2px; margin-bottom: 16px;"></div>
            <div>
              <p style="margin: 6px 0; color: #4b5563; font-size: 11px;">● Professional Installation & Manufacturing</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 9px;">● 123 Industry Street, Business District</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 9px;">● Phone: +1 (555) 123-4567 | Email: info@aluminumwd.com</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 8px; margin-bottom: 12px;">
              <div style="letter-spacing: 2px; font-weight: 700; font-size: 14px; color: #ffffff;">${docTitle}</div>
            </div>
            <p style="margin: 6px 0; color: #111827; font-size: 13px; font-weight: 600;">#${viewingDocument.documentNumber}</p>
            <p style="margin: 6px 0; color: #6b7280; font-size: 10px;">${new Date(viewingDocument.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="color: #6b7280; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-weight: 600;">Bill To</div>
          <div style="color: #111827; font-size: 12px; font-weight: 600; margin-bottom: 8px;">${viewingDocument.customer.name || 'Customer Name'}</div>
          ${viewingDocument.customer.email ? `<p style="margin: 6px 0; color: #374151; font-size: 10px;">✉ ${viewingDocument.customer.email}</p>` : ''}
          ${viewingDocument.customer.phone ? `<p style="margin: 4px 0; color: #374151; font-size: 10px;">☎ ${viewingDocument.customer.phone}</p>` : ''}
          ${viewingDocument.customer.address ? `<p style="margin: 4px 0; color: #374151; white-space: pre-line; line-height: 1.4; font-size: 10px;">⌂ ${viewingDocument.customer.address}</p>` : ''}
        </div>
        <div style="background: #eff6ff; padding: 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
          <div style="color: #1d4ed8; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-weight: 600;">Document Details</div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #6b7280; font-size: 10px;">Status:</span>
            <span style="background: #2563eb; color: white; padding: 4px 10px; border-radius: 8px; font-size: 9px; font-weight: 600;">
              ${viewingDocument.documentType === 'quotation' ? 'Pending' : viewingDocument.documentType === 'invoice' ? 'Sent' : 'Completed'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span style="color: #6b7280; font-size: 10px;">Tax Rate:</span>
            <span style="color: #111827; font-weight: 600; font-size: 10px;">${viewingDocument.taxRate}%</span>
          </div>
        </div>
      </div>

      <!-- Line Items -->
      <div style="border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #111827; color: white;">
              <th style="padding: 8px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Item Description</th>
              <th style="padding: 8px 10px; text-align: center; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Dimensions</th>
              <th style="padding: 8px 10px; text-align: center; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Area</th>
              <th style="padding: 8px 10px; text-align: center; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Qty</th>
              <th style="padding: 8px 10px; text-align: right; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Price/m²</th>
              <th style="padding: 8px 10px; text-align: right; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${viewingDocument.lineItems.map((item, index) => `
              <tr style="border-bottom: 1px solid #f3f4f6; background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 10px;">
                  <div>
                    <div style="color: #111827; font-weight: 600; font-size: 11px; margin-bottom: 4px;">${item.type === 'window' ? 'Window' : 'Door'}</div>
                    ${item.description ? `<div style="color: #6b7280; font-size: 9px; margin-top: 4px; line-height: 1.3;">${item.description}</div>` : ''}
                    ${item.accessoryPrice && item.accessoryPrice > 0 ? `<div style="color: #2563eb; font-size: 8px; margin-top: 6px; background: #eff6ff; padding: 2px 8px; border-radius: 8px; display: inline-block; font-weight: 500;">+ Accessories: SCR ${item.accessoryPrice.toFixed(2)}</div>` : ''}
                  </div>
                </td>
                <td style="padding: 10px; text-align: center;">
                  <div style="color: #111827; font-weight: 500; font-size: 10px; margin-bottom: 4px;">${item.width.toFixed(0)}mm</div>
                  <div style="color: #d1d5db; font-size: 8px; margin: 4px 0;">×</div>
                  <div style="color: #111827; font-weight: 500; font-size: 10px; margin-top: 4px;">${item.height.toFixed(0)}mm</div>
                </td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 8px; font-size: 9px; font-weight: 600;">
                    ${area(item).toFixed(2)} m²
                  </span>
                </td>
                <td style="padding: 10px; text-align: center;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #f3f4f6; border-radius: 50%; color: #111827; font-weight: 600; font-size: 10px;">
                    ${item.quantity}
                  </div>
                </td>
                <td style="padding: 10px; text-align: right; color: #374151; font-size: 10px;">SCR ${item.pricePerSqm.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; color: #111827; font-weight: 600; font-size: 10px;">SCR ${lineTotal(item).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <div style="width: 100%; max-width: 280px;">
          <div style="background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="padding: 16px;">
              ${discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <span style="color: #6b7280; font-size: 10px;">Items Total</span>
                  <span style="color: #111827; font-weight: 600; font-size: 10px;">SCR ${itemsTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                  <span style="color: #6b7280; font-size: 10px;">Discount</span>
                  <span style="color: #dc2626; font-weight: 600; font-size: 10px;">- SCR ${discountAmount.toFixed(2)}</span>
                </div>
                <div style="height: 1px; background: #d1d5db; margin: 10px 0;"></div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="color: #374151; font-size: 10px;">Subtotal (pre-tax)</span>
                <span style="color: #111827; font-weight: 600; font-size: 11px;">SCR ${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0; margin-top: 6px;">
                <span style="color: #374151; font-size: 10px;">Tax (${viewingDocument.taxRate}%)</span>
                <span style="color: #111827; font-weight: 600; font-size: 10px;">SCR ${taxAmount.toFixed(2)}</span>
              </div>
            </div>
            <div style="background: #2563eb; padding: 12px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #dbeafe; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-size: 9px;">Total Amount</span>
                <span style="color: white; font-size: 16px; font-weight: 700;">SCR ${totalWithTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${viewingDocument.notes ? `
        <div style="background: #fffbeb; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
          <div>
            <div style="color: #111827; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Notes & Terms</div>
            <p style="color: #374151; font-size: 9px; white-space: pre-line; margin: 0; line-height: 1.4;">${viewingDocument.notes}</p>
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
        <p style="color: #111827; font-size: 11px; font-weight: 600; margin: 12px 0;">Thank you for your business!</p>
        ${viewingDocument.documentType === 'quotation' ? `<p style="color: #6b7280; margin: 8px 0; line-height: 1.4; font-size: 9px;">This quotation is valid for 30 days from the date of issue.</p>` : ''}
        ${viewingDocument.documentType === 'invoice' ? `<p style="color: #6b7280; margin: 8px 0; line-height: 1.4; font-size: 9px;">Payment is due within 30 days. Please reference invoice number when making payment.</p>` : ''}
        ${viewingDocument.documentType === 'receipt' ? `<p style="color: #6b7280; margin: 8px 0; line-height: 1.4; font-size: 9px;">This receipt confirms payment has been received in full.</p>` : ''}
        <div style="padding-top: 12px; border-top: 1px solid #e5e7eb; margin-top: 12px;">
          <p style="color: #9ca3af; font-size: 9px; margin: 8px 0;">Aluminum Windows & Doors - Professional Quality Guaranteed</p>
          <p style="color: #d1d5db; font-size: 8px; margin-top: 8px;">All specifications and prices are subject to our standard terms and conditions.</p>
        </div>
      </div>
    </div>
  `;
}
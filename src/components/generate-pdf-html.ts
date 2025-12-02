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
    <div style="background: white; padding: 48px;">
      <!-- Header -->
      <div style="border-bottom: 4px solid #2563eb; padding-bottom: 40px; margin-bottom: 48px;">
        <div style="display: flex; justify-content: space-between;">
          <div style="padding-right: 32px;">
            <h1 style="color: #1d4ed8; margin: 0 0 16px 0; font-size: 36px; font-weight: 700;">Aluminum Windows & Doors</h1>
            <div style="width: 112px; height: 4px; background: #2563eb; border-radius: 4px; margin-bottom: 32px;"></div>
            <div>
              <p style="margin: 12px 0; color: #4b5563; font-size: 16px;">● Professional Installation & Manufacturing</p>
              <p style="margin: 12px 0; color: #6b7280; font-size: 14px;">● 123 Industry Street, Business District</p>
              <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">● Phone: +1 (555) 123-4567 | Email: info@aluminumwd.com</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-block; background: #2563eb; color: white; padding: 20px 40px; border-radius: 12px; margin-bottom: 24px;">
              <div style="letter-spacing: 3px; font-weight: 700; font-size: 22px;">${docTitle}</div>
            </div>
            <p style="margin: 12px 0; color: #111827; font-size: 20px; font-weight: 600;">#${viewingDocument.documentNumber}</p>
            <p style="margin: 12px 0; color: #6b7280;">${new Date(viewingDocument.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 48px;">
        <div style="background: #f9fafb; padding: 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; font-weight: 600;">Bill To</div>
          <div style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;">${viewingDocument.customer.name || 'Customer Name'}</div>
          ${viewingDocument.customer.email ? `<p style="margin: 16px 0; color: #374151;">✉ ${viewingDocument.customer.email}</p>` : ''}
          ${viewingDocument.customer.phone ? `<p style="margin: 12px 0; color: #374151;">☎ ${viewingDocument.customer.phone}</p>` : ''}
          ${viewingDocument.customer.address ? `<p style="margin: 12px 0; color: #374151; white-space: pre-line; line-height: 1.6;">⌂ ${viewingDocument.customer.address}</p>` : ''}
        </div>
        <div style="background: #eff6ff; padding: 32px; border-radius: 12px; border: 1px solid #bfdbfe;">
          <div style="color: #1d4ed8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; font-weight: 600;">Document Details</div>
          <div style="display: flex; justify-content: space-between; margin: 16px 0;">
            <span style="color: #6b7280;">Status:</span>
            <span style="background: #2563eb; color: white; padding: 6px 16px; border-radius: 12px; font-size: 12px; font-weight: 600;">
              ${viewingDocument.documentType === 'quotation' ? 'Pending' : viewingDocument.documentType === 'invoice' ? 'Sent' : 'Completed'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 16px 0;">
            <span style="color: #6b7280;">Tax Rate:</span>
            <span style="color: #111827; font-weight: 600;">${viewingDocument.taxRate}%</span>
          </div>
        </div>
      </div>

      <!-- Line Items -->
      <div style="border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 48px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #111827; color: white;">
              <th style="padding: 24px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Item Description</th>
              <th style="padding: 24px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Dimensions</th>
              <th style="padding: 24px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Area</th>
              <th style="padding: 24px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Qty</th>
              <th style="padding: 24px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Price/m²</th>
              <th style="padding: 24px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${viewingDocument.lineItems.map((item, index) => `
              <tr style="border-bottom: 1px solid #f3f4f6; background: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 24px;">
                  <div>
                    <div style="color: #111827; font-weight: 600; font-size: 15px; margin-bottom: 8px;">${item.type === 'window' ? 'Window' : 'Door'}</div>
                    ${item.description ? `<div style="color: #6b7280; font-size: 14px; margin-top: 8px; line-height: 1.5;">${item.description}</div>` : ''}
                    ${item.accessoryPrice && item.accessoryPrice > 0 ? `<div style="color: #2563eb; font-size: 12px; margin-top: 12px; background: #eff6ff; padding: 4px 12px; border-radius: 12px; display: inline-block; font-weight: 500;">+ Accessories: SCR ${item.accessoryPrice.toFixed(2)}</div>` : ''}
                  </div>
                </td>
                <td style="padding: 24px; text-align: center;">
                  <div style="color: #111827; font-weight: 500; font-size: 15px; margin-bottom: 8px;">${item.width.toFixed(0)}mm</div>
                  <div style="color: #d1d5db; font-size: 12px; margin: 8px 0;">×</div>
                  <div style="color: #111827; font-weight: 500; font-size: 15px; margin-top: 8px;">${item.height.toFixed(0)}mm</div>
                </td>
                <td style="padding: 24px; text-align: center;">
                  <span style="background: #dbeafe; color: #1d4ed8; padding: 10px 20px; border-radius: 12px; font-size: 15px; font-weight: 600;">
                    ${area(item).toFixed(2)} m²
                  </span>
                </td>
                <td style="padding: 24px; text-align: center;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #f3f4f6; border-radius: 50%; color: #111827; font-weight: 600; font-size: 16px;">
                    ${item.quantity}
                  </div>
                </td>
                <td style="padding: 24px; text-align: right; color: #374151; font-size: 16px;">SCR ${item.pricePerSqm.toFixed(2)}</td>
                <td style="padding: 24px; text-align: right; color: #111827; font-weight: 600; font-size: 16px;">SCR ${lineTotal(item).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 48px;">
        <div style="width: 100%; max-width: 448px;">
          <div style="background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="padding: 32px;">
              ${discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                  <span style="color: #6b7280; font-size: 16px;">Items Total</span>
                  <span style="color: #111827; font-weight: 600; font-size: 16px;">SCR ${itemsTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                  <span style="color: #6b7280; font-size: 16px;">Discount</span>
                  <span style="color: #dc2626; font-weight: 600; font-size: 16px;">- SCR ${discountAmount.toFixed(2)}</span>
                </div>
                <div style="height: 1px; background: #d1d5db; margin: 20px 0;"></div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #374151; font-size: 16px;">Subtotal (pre-tax)</span>
                <span style="color: #111827; font-weight: 600; font-size: 17px;">SCR ${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; margin-top: 12px;">
                <span style="color: #374151; font-size: 16px;">Tax (${viewingDocument.taxRate}%)</span>
                <span style="color: #111827; font-weight: 600; font-size: 16px;">SCR ${taxAmount.toFixed(2)}</span>
              </div>
            </div>
            <div style="background: #2563eb; padding: 28px 32px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #dbeafe; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Total Amount</span>
                <span style="color: white; font-size: 32px; font-weight: 700;">SCR ${totalWithTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${viewingDocument.notes ? `
        <div style="background: #fffbeb; padding: 32px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 48px;">
          <div>
            <div style="color: #111827; font-weight: 600; margin-bottom: 16px; font-size: 16px;">Notes & Terms</div>
            <p style="color: #374151; font-size: 14px; white-space: pre-line; margin: 0; line-height: 1.6;">${viewingDocument.notes}</p>
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="padding-top: 48px; border-top: 2px solid #e5e7eb; text-align: center;">
        <p style="color: #111827; font-size: 18px; font-weight: 600; margin: 24px 0;">Thank you for your business!</p>
        ${viewingDocument.documentType === 'quotation' ? `<p style="color: #6b7280; margin: 16px 0; line-height: 1.6;">This quotation is valid for 30 days from the date of issue.</p>` : ''}
        ${viewingDocument.documentType === 'invoice' ? `<p style="color: #6b7280; margin: 16px 0; line-height: 1.6;">Payment is due within 30 days. Please reference invoice number when making payment.</p>` : ''}
        ${viewingDocument.documentType === 'receipt' ? `<p style="color: #6b7280; margin: 16px 0; line-height: 1.6;">This receipt confirms payment has been received in full.</p>` : ''}
        <div style="padding-top: 24px; border-top: 1px solid #e5e7eb; margin-top: 24px;">
          <p style="color: #9ca3af; font-size: 14px; margin: 12px 0;">Aluminum Windows & Doors - Professional Quality Guaranteed</p>
          <p style="color: #d1d5db; font-size: 12px; margin-top: 12px;">All specifications and prices are subject to our standard terms and conditions.</p>
        </div>
      </div>
    </div>
  `;
}
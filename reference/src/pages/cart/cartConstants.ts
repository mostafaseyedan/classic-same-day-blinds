import { CartItem } from './cartTypes';

export const MXN_RATE = 17.5;
export const TAX_RATE = 0.0825;

export const ADMIN_EMAIL = 'Lukethomas1721@gmail.com';

export const QUOTE_RECIPIENTS = [
  { id: 'main', label: 'Main Office', email: 'Lukethomas1721@gmail.com' },
  { id: 'sales', label: 'Sales Team', email: 'sales@classicsamedayblinds.com' },
];

export const PICKUP_TIME_SLOTS = [
  '9:00 AM \u2013 10:00 AM',
  '10:00 AM \u2013 11:00 AM',
  '11:00 AM \u2013 12:00 PM',
  '12:00 PM \u2013 1:00 PM',
  '1:00 PM \u2013 2:00 PM',
  '2:00 PM \u2013 3:00 PM',
  '3:00 PM \u2013 4:00 PM',
  '4:00 PM \u2013 5:00 PM',
];

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function buildOrderConfirmationEmail(params: {
  orderId: string;
  customerName: string;
  deliveryMethod: 'delivery' | 'pickup';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}): string {
  const { orderId, customerName, deliveryMethod, address, city, state, zip, items, subtotal, tax, total } = params;

  const itemsHTML = items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">${item.name}${item.color ? ` \u00b7 ${item.color}` : ''}${item.width && item.height ? ` \u00b7 ${item.width}" \u00d7 ${item.height}"` : ''}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px;color:#64748b;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;font-weight:600;color:#1e293b;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const deliverySection = deliveryMethod === 'delivery'
    ? `<div style="margin:16px 40px 0;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px;"><p style="font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">Property Address</p><p style="font-size:14px;color:#14532d;font-weight:600;margin:0;line-height:1.7;">${address}<br/>${city}, ${state} ${zip}</p></div>`
    : `<div style="margin:16px 40px 0;background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;"><p style="font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">Warehouse Pickup</p><p style="font-size:14px;color:#92400e;margin:0;line-height:1.7;">Your order will be ready for warehouse pickup. We\'ll send you another email when it\'s ready!</p></div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="background:#064e3b;padding:32px 40px;text-align:center;"><h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 6px;">Order Confirmed!</h1><p style="color:#a7f3d0;font-size:14px;margin:0;">Order <strong style="color:#fff;">${orderId}</strong></p></div><div style="padding:32px 40px 0;"><p style="font-size:16px;color:#1e293b;margin:0 0 8px;">Hi <strong>${customerName}</strong>,</p><p style="font-size:14px;color:#64748b;margin:0;">Thank you for your order! Our team is already working on it.</p></div>${deliverySection}<div style="margin:24px 40px;"><table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"><thead><tr style="background:#f1f5f9;"><th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;">Item</th><th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748b;">Qty</th><th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;">Price</th></tr></thead><tbody>${itemsHTML}</tbody><tfoot><tr style="background:#f8fafc;"><td colspan="2" style="padding:8px 12px;text-align:right;font-size:13px;color:#64748b;">Subtotal</td><td style="padding:8px 12px;text-align:right;font-size:13px;">$${subtotal.toFixed(2)}</td></tr><tr style="background:#f8fafc;"><td colspan="2" style="padding:8px 12px;text-align:right;font-size:13px;color:#64748b;">Tax</td><td style="padding:8px 12px;text-align:right;font-size:13px;">$${tax.toFixed(2)}</td></tr><tr style="background:#f0fdf4;border-top:2px solid #bbf7d0;"><td colspan="2" style="padding:12px;text-align:right;font-size:15px;font-weight:700;">Order Total</td><td style="padding:12px;text-align:right;font-size:18px;font-weight:800;color:#065f46;">$${total.toFixed(2)}</td></tr></tfoot></table></div><div style="padding:24px 40px;background:#f8fafc;text-align:center;"><p style="font-size:13px;font-weight:600;color:#065f46;margin:0;">Classic Same Day Blinds</p></div></div></body></html>`;
}

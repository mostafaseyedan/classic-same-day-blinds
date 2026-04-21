import { opsApiEnv } from "../config.js";

export function buildQuoteCustomerEmail(customerName: string) {
  return {
    subject: "Quote request received",
    html: `<p>Hi ${customerName || "there"},</p><p>We received your quote request and the team will review it shortly.</p>`,
  };
}

export function buildQuoteAdminEmail(customerName: string, email: string, notes?: string) {
  return {
    subject: `New quote request from ${customerName || email}`,
    html: `<p>Customer: ${customerName || "Unknown"}</p><p>Email: ${email}</p><p>Notes: ${notes || "None provided"}</p>`,
  };
}

export function buildInvoiceCustomerEmail(customerName: string) {
  return {
    subject: "Invoice request received",
    html: `<p>Hi ${customerName || "there"},</p><p>We received your invoice request and will follow up with billing details.</p>`,
  };
}

export function buildInvoiceAdminEmail(customerName: string, email: string, notes?: string) {
  return {
    subject: `New invoice request from ${customerName || email}`,
    html: `<p>Customer: ${customerName || "Unknown"}</p><p>Email: ${email}</p><p>Notes: ${notes || "None provided"}</p>`,
  };
}

export interface OrderConfirmationDetails {
  orderId: string;
  displayId?: number;
  customerName: string;
  customerEmail: string;
  total: number;
  shippingTotal?: number;
  currencyCode: string;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
}

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Shared email layout helpers ────────────────────────────────────────────

const BRAND = {
  olive: "#4a5240",
  brass: "#a07c3a",
  slate: "#1e2a35",
  shell: "#f7f5f0",
  divider: "#e3dfd6",
  textMuted: "#6b7c8e",
};

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Classic Same Day Blinds</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0ede8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND.olive};border-radius:8px 8px 0 0;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <!-- Logo bars -->
                <td valign="middle" style="padding-right:14px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr><td style="display:block;width:11px;height:4px;background-color:rgba(247,245,240,0.75);border-radius:99px;margin-bottom:5px;"></td></tr>
                    <tr><td style="display:block;width:17px;height:4px;background-color:rgba(247,245,240,0.75);border-radius:99px;margin-bottom:5px;"></td></tr>
                    <tr><td style="display:block;width:23px;height:4px;background-color:rgba(247,245,240,0.75);border-radius:99px;"></td></tr>
                  </table>
                </td>
                <!-- Logo text -->
                <td valign="middle">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(247,245,240,0.65);">Classic Same Day</p>
                  <p style="margin:3px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;line-height:1;">Blinds</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:40px 40px 32px;border-left:1px solid ${BRAND.divider};border-right:1px solid ${BRAND.divider};">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:${BRAND.shell};border:1px solid ${BRAND.divider};border-top:none;border-radius:0 0 8px 8px;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.6;">
              Classic Same Day Blinds &nbsp;·&nbsp; Bedford, TX<br/>
              Questions? Reply to this email or visit <a href="https://classicsamedayblinds.com" style="color:${BRAND.brass};text-decoration:none;">classicsamedayblinds.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemTableRows(items: OrderConfirmationDetails["items"], currencyCode: string, shippingTotal?: number) {
  let rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.divider};font-size:14px;color:${BRAND.slate};font-weight:600;">${item.title}</td>
          <td style="padding:12px 8px;border-bottom:1px solid ${BRAND.divider};font-size:14px;color:${BRAND.textMuted};text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.divider};font-size:14px;color:${BRAND.slate};text-align:right;font-weight:600;">${formatMoney(item.unitPrice * item.quantity, currencyCode)}</td>
        </tr>`,
    )
    .join("");

  if (shippingTotal && shippingTotal > 0) {
    rows += `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.divider};font-size:14px;color:${BRAND.textMuted};">Shipping</td>
          <td style="padding:12px 8px;border-bottom:1px solid ${BRAND.divider};font-size:14px;color:${BRAND.textMuted};text-align:center;">—</td>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.divider};font-size:14px;color:${BRAND.slate};text-align:right;">${formatMoney(shippingTotal, currencyCode)}</td>
        </tr>`;
  }

  return rows;
}

function labelStyle() {
  return `font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.brass};margin:0 0 4px;`;
}

// ─── Customer order confirmation ─────────────────────────────────────────────

export function buildOrderConfirmationCustomerEmail(order: OrderConfirmationDetails) {
  const content = `
    <!-- Greeting -->
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.brass};">Order Confirmed</p>
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:${BRAND.slate};line-height:1.2;">Thank you, ${order.customerName || "valued customer"}.</h1>
    <p style="margin:0 0 32px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Your order has been received and our team in Bedford, TX is already preparing it.
      We'll send you a shipping notification as soon as your blinds are on their way.
    </p>

    <!-- Order meta -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td width="50%" style="padding-right:12px;vertical-align:top;">
          <p style="${labelStyle()}">Order Reference</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:${BRAND.slate};">${order.displayId ? `#${order.displayId}` : order.orderId}</p>
        </td>
        <td width="50%" style="padding-left:12px;vertical-align:top;">
          <p style="${labelStyle()}">Order Total</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:${BRAND.slate};">${formatMoney(order.total, order.currencyCode)}</p>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid ${BRAND.divider};margin:0 0 24px;" />

    <!-- Items table -->
    <p style="${labelStyle()}margin-bottom:12px;">Items in Your Order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textMuted};text-align:left;border-bottom:2px solid ${BRAND.divider};">Product</th>
          <th style="padding:0 8px 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textMuted};text-align:center;border-bottom:2px solid ${BRAND.divider};">Qty</th>
          <th style="padding:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textMuted};text-align:right;border-bottom:2px solid ${BRAND.divider};">Price</th>
        </tr>
      </thead>
      <tbody>${itemTableRows(order.items, order.currencyCode, order.shippingTotal)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:700;color:${BRAND.slate};">Total</td>
          <td style="padding:14px 0 0;font-size:18px;font-weight:700;color:${BRAND.slate};text-align:right;">${formatMoney(order.total, order.currencyCode)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- View order CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${opsApiEnv.storefrontUrl}/order-confirmation?order_id=${order.orderId}&email=${encodeURIComponent(order.customerEmail)}"
             style="display:inline-block;padding:14px 32px;background-color:${BRAND.olive};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">
            View Your Order
          </a>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid ${BRAND.divider};margin:24px 0;" />

    <!-- What's next -->
    <p style="${labelStyle()}margin-bottom:12px;">What Happens Next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="32" valign="top" style="padding-right:12px;padding-top:2px;">
          <div style="width:24px;height:24px;border-radius:50%;background-color:${BRAND.olive};text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">1</div>
        </td>
        <td style="padding-bottom:12px;font-size:14px;color:${BRAND.textMuted};line-height:1.5;">Our team cuts and prepares your custom-size order in Bedford, TX.</td>
      </tr>
      <tr>
        <td width="32" valign="top" style="padding-right:12px;padding-top:2px;">
          <div style="width:24px;height:24px;border-radius:50%;background-color:${BRAND.olive};text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">2</div>
        </td>
        <td style="padding-bottom:12px;font-size:14px;color:${BRAND.textMuted};line-height:1.5;">You'll receive a shipping confirmation with tracking details.</td>
      </tr>
      <tr>
        <td width="32" valign="top" style="padding-right:12px;padding-top:2px;">
          <div style="width:24px;height:24px;border-radius:50%;background-color:${BRAND.olive};text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">3</div>
        </td>
        <td style="font-size:14px;color:${BRAND.textMuted};line-height:1.5;">Custom orders typically ship within 2–6 business days.</td>
      </tr>
    </table>
  `;

  return {
    subject: `Order confirmed — ${order.displayId ? `#${order.displayId}` : order.orderId}`,
    html: emailWrapper(content),
  };
}

// ─── Admin new order notification ────────────────────────────────────────────

export function buildOrderConfirmationAdminEmail(order: OrderConfirmationDetails) {
  const content = `
    <!-- Alert badge -->
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.brass};">New Order</p>
    <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:${BRAND.slate};line-height:1.2;">A new order has been placed.</h1>

    <!-- Customer + order meta -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.shell};border-radius:6px;padding:20px;margin-bottom:28px;">
      <tr>
        <td width="50%" style="padding-right:16px;vertical-align:top;">
          <p style="${labelStyle()}">Customer</p>
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${BRAND.slate};">${order.customerName || "Guest"}</p>
          <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">${order.customerEmail}</p>
        </td>
        <td width="50%" style="padding-left:16px;vertical-align:top;">
          <p style="${labelStyle()}">Order</p>
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${BRAND.slate};">${order.displayId ? `#${order.displayId}` : order.orderId}</p>
          ${order.displayId ? `<p style="margin:2px 0 0;font-size:11px;color:${BRAND.textMuted};word-break:break-all;">${order.orderId}</p>` : ""}
          <p style="${labelStyle()}margin-top:12px;">Total</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:${BRAND.slate};">${formatMoney(order.total, order.currencyCode)}</p>
        </td>
      </tr>
    </table>

    <!-- Items table -->
    <p style="${labelStyle()}margin-bottom:12px;">Order Items</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textMuted};text-align:left;border-bottom:2px solid ${BRAND.divider};">Product</th>
          <th style="padding:0 8px 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textMuted};text-align:center;border-bottom:2px solid ${BRAND.divider};">Qty</th>
          <th style="padding:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.textMuted};text-align:right;border-bottom:2px solid ${BRAND.divider};">Price</th>
        </tr>
      </thead>
      <tbody>${itemTableRows(order.items, order.currencyCode, order.shippingTotal)}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:700;color:${BRAND.slate};">Total</td>
          <td style="padding:14px 0 0;font-size:18px;font-weight:700;color:${BRAND.slate};text-align:right;">${formatMoney(order.total, order.currencyCode)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid ${BRAND.divider};margin:24px 0;" />

    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">
      View and fulfill this order in the
      <a href="${opsApiEnv.medusaBackendUrl}/app/orders" style="color:${BRAND.brass};text-decoration:none;font-weight:600;">Medusa admin panel</a>.
    </p>
  `;

  return {
    subject: `New order — ${order.displayId ? `#${order.displayId}` : order.orderId} · ${formatMoney(order.total, order.currencyCode)}`,
    html: emailWrapper(content),
  };
}

export function buildRestockAdminEmail(productName: string, customerEmail: string) {
  return {
    subject: `Restock interest: ${productName}`,
    html: `<p>A customer has requested to be notified when <strong>${productName}</strong> is back in stock.</p><p>Customer email: ${customerEmail}</p>`,
  };
}

export function buildAccountDeletionAdminEmail(email: string, customerId: string) {
  return {
    subject: `Account deletion request from ${email}`,
    html: `<p>A customer has requested account deletion.</p><p>Email: <strong>${email}</strong></p><p>Medusa customer ID: <strong>${customerId}</strong></p><p>Please delete this customer from the Medusa admin and confirm with the customer within 48 hours.</p>`,
  };
}

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = "re_72LKy474_AmKtKhvqvDKBLX6QXXTKkjm8";
const ADMIN_EMAIL = "Lukethomas1721@gmail.com";
const FROM_EMAIL = "Classic Same Day Blinds <orders@classicsamedayblinds.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartItem {
  id: number; name: string; price: number; image: string; quantity: number;
  category?: string; color?: string; mount?: string; width?: string; height?: string; size?: string;
}

interface OrderConfirmationPayload {
  type: "order_confirmation";
  orderId: string; customerName: string; customerEmail: string;
  deliveryMethod: "delivery" | "pickup";
  address?: string; city?: string; state?: string; zip?: string;
  items: CartItem[]; subtotal: number; tax: number; shipping: number; total: number;
  stripeSessionId?: string;
}

interface StatusUpdatePayload {
  type: "status_update";
  orderId: string; customerName: string; customerEmail: string;
  newStatus: string; trackingNumber?: string; pickupLocation?: string;
  orderTotal?: number; items?: CartItem[];
}

interface PaymentEventPayload {
  type: "payment_failed" | "payment_refunded";
  orderId?: string; customerName?: string; customerEmail: string;
  amount?: number; reason?: string; refundId?: string;
}

interface ReferralNudgePayload {
  type: "referral_nudge";
  customerName: string;
  customerEmail: string;
  orderId: string;
  referralCode: string;
  referralUrl: string;
  bonusPoints: number;
}

type EmailPayload = OrderConfirmationPayload | StatusUpdatePayload | PaymentEventPayload | ReferralNudgePayload;

const STATUS_CONFIG: Record<string, {icon:string;bgColor:string;accentColor:string;textColor:string;headline:string;subText:string}> = {
  "Working on Order": { icon:"🔧", bgColor:"#0ea5e9", accentColor:"#e0f2fe", textColor:"#0369a1", headline:"We're Working on Your Order!", subText:"Our team has picked up your order and is preparing it now." },
  "Ready for Pickup": { icon:"🏭", bgColor:"#f97316", accentColor:"#fff7ed", textColor:"#c2410c", headline:"Your Order Is Ready for Warehouse Pickup!", subText:"Great news — your order is packaged and waiting at our warehouse. Bring your order ID when you come in." },
  "Fulfilled & Shipped": { icon:"🚚", bgColor:"#14b8a6", accentColor:"#f0fdfa", textColor:"#0f766e", headline:"Your Order Has Shipped!", subText:"Your order is on its way to your property. Use the tracking number below to follow your delivery." },
  "Delivered": { icon:"✅", bgColor:"#10b981", accentColor:"#f0fdf4", textColor:"#065f46", headline:"Your Order Has Been Delivered!", subText:"We hope you love your new window blinds! Reach out anytime if you need help." },
  "Cancelled": { icon:"❌", bgColor:"#ef4444", accentColor:"#fef2f2", textColor:"#991b1b", headline:"Your Order Has Been Cancelled", subText:"If you believe this is a mistake or need to place a new order, please contact us." },
  "Pending": { icon:"⏳", bgColor:"#f59e0b", accentColor:"#fffbeb", textColor:"#92400e", headline:"Your Order Is Pending", subText:"Your order has been received and is queued for processing." },
};

function buildPickupAddressBlock(pickupLocation: string, accentColor: string, textColor: string, bgColor: string): string {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupLocation)}`;
  const lines = pickupLocation.split(/\n|,\s*(?=[A-Z]{2}\s*\d)|(?<=\d{5})\s*/).filter(Boolean);
  const addressHtml = lines.map(l => `<span style="display:block;font-size:14px;color:#92400e;font-weight:600;line-height:1.7;">${l.trim()}</span>`).join('');
  return `
    <div style="margin:20px 0;background:#fff7ed;border:2px solid #fed7aa;border-radius:14px;overflow:hidden;">
      <div style="background:#f97316;padding:12px 20px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:22px;">📍</span>
        <span style="color:#fff;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Warehouse Address</span>
      </div>
      <div style="padding:18px 20px 16px;">
        <div style="margin-bottom:14px;">${addressHtml}</div>
        <a href="${mapsUrl}" target="_blank"
           style="display:inline-flex;align-items:center;gap:8px;background:#f97316;color:#fff;font-size:13px;font-weight:700;padding:10px 20px;border-radius:50px;text-decoration:none;">
          🗺️ Get Directions →
        </a>
      </div>
    </div>
    <div style="margin:0 0 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;">
      <span style="font-size:18px;">🕐</span>
      <span style="font-size:13px;color:#92400e;line-height:1.5;">Please bring a copy of your <strong>order ID</strong> when picking up. Available during regular business hours.</span>
    </div>`;
}

function buildStatusEmail(p: StatusUpdatePayload): string {
  const s = STATUS_CONFIG[p.newStatus] ?? {
    icon: "📦", bgColor: "#6b7280", accentColor: "#f9fafb", textColor: "#374151",
    headline: `Order Update: ${p.newStatus}`, subText: "Your order status has been updated.",
  };

  const tracking = p.trackingNumber && p.newStatus === "Fulfilled & Shipped"
    ? `<div style="margin:20px 0;background:${s.accentColor};border:2px solid ${s.bgColor}50;border-radius:12px;padding:20px;text-align:center;">
        <p style="font-size:11px;font-weight:700;color:${s.textColor};text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">📦 Tracking Number</p>
        <p style="font-family:'Courier New',monospace;font-size:22px;font-weight:800;color:${s.textColor};letter-spacing:3px;margin:0 0 12px;">${p.trackingNumber}</p>
        <a href="https://www.google.com/search?q=${encodeURIComponent(p.trackingNumber)}" style="display:inline-block;background:${s.bgColor};color:#fff;font-size:13px;font-weight:700;padding:10px 22px;border-radius:50px;text-decoration:none;">Track My Package →</a>
      </div>`
    : "";

  const pickupBlock = p.newStatus === "Ready for Pickup" && p.pickupLocation
    ? buildPickupAddressBlock(p.pickupLocation, s.accentColor, s.textColor, s.bgColor)
    : "";

  const total = p.orderTotal != null
    ? `<div style="background:#f8fafc;border-radius:10px;padding:14px 20px;margin:16px 0;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;color:#64748b;">Order Total</span><span style="font-size:18px;font-weight:800;color:#065f46;">$${p.orderTotal.toFixed(2)}</span></div>`
    : "";

  const items = p.items && p.items.length
    ? `<div style="margin:16px 0;"><p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Items</p>${p.items.map(i => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#1e293b;">${i.name}${i.color ? ` · ${i.color}` : ""}${i.size ? ` · ${i.size}` : ""}</span><span style="font-size:13px;font-weight:600;color:#475569;">×${i.quantity}</span></div>`).join("")}</div>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;">
  <div style="background:${s.bgColor};padding:36px 40px 28px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">${s.icon}</div>
    <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">${s.headline}</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Order <strong style="color:#fff;">${p.orderId}</strong></p>
  </div>
  <div style="padding:32px 40px;">
    <p style="font-size:15px;color:#1e293b;margin:0 0 6px;">Hi <strong>${p.customerName}</strong>,</p>
    <p style="font-size:14px;color:#64748b;margin:0 0 20px;line-height:1.6;">${s.subText}</p>
    <div style="text-align:center;margin:0 0 20px;">
      <span style="display:inline-block;background:${s.accentColor};color:${s.textColor};font-size:14px;font-weight:700;padding:10px 24px;border-radius:50px;">${s.icon} ${p.newStatus}</span>
    </div>
    ${pickupBlock}
    ${tracking}
    ${items}
    ${total}
    <p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0 0;">Questions? Reply to this email or call us — we're happy to help.</p>
  </div>
  <div style="background:#064e3b;padding:20px 40px;text-align:center;">
    <p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p>
    <p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas</p>
  </div>
</div>
</body></html>`;
}

function buildPaymentFailedEmail(p: PaymentEventPayload): string {
  const amt = p.amount ? `$${(p.amount / 100).toFixed(2)}` : "";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="background:#ef4444;padding:36px 40px 28px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">⚠️</div><h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Payment Was Unsuccessful</h1>${p.orderId?`<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Order <strong style="color:#fff;">${p.orderId}</strong></p>`:""}</div><div style="padding:32px 40px;"><p style="font-size:15px;color:#1e293b;margin:0 0 6px;">Hi <strong>${p.customerName ?? "Valued Customer"}</strong>,</p><p style="font-size:14px;color:#64748b;margin:0 0 20px;line-height:1.6;">Unfortunately, your payment of <strong>${amt}</strong> could not be processed. This can happen due to insufficient funds, an expired card, or a bank decline.</p><div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;"><p style="font-size:13px;font-weight:700;color:#991b1b;margin:0 0 8px;">What to do next:</p><ul style="font-size:13px;color:#7f1d1d;margin:0;padding-left:18px;line-height:2;"><li>Check your card details and billing address</li><li>Contact your bank to authorize the transaction</li><li>Try a different payment method</li></ul></div><div style="text-align:center;margin:24px 0;"><a href="https://classicsamedayblinds.com/cart" style="display:inline-block;background:#064e3b;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;text-decoration:none;">Retry My Order →</a></div><p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0 0;">Need help? Reply to this email and we'll sort it out immediately.</p></div><div style="background:#064e3b;padding:20px 40px;text-align:center;"><p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p><p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas</p></div></div></body></html>`;
}

function buildRefundEmail(p: PaymentEventPayload): string {
  const amt = p.amount ? `$${(p.amount / 100).toFixed(2)}` : "your payment";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="background:#8b5cf6;padding:36px 40px 28px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">💰</div><h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Your Refund Is Being Processed</h1>${p.orderId?`<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Order <strong style="color:#fff;">${p.orderId}</strong></p>`:""}</div><div style="padding:32px 40px;"><p style="font-size:15px;color:#1e293b;margin:0 0 6px;">Hi <strong>${p.customerName ?? "Valued Customer"}</strong>,</p><p style="font-size:14px;color:#64748b;margin:0 0 20px;line-height:1.6;">We've initiated a refund of <strong>${amt}</strong> to your original payment method. Refunds typically appear within 5–10 business days depending on your bank.</p><div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:12px;padding:20px;margin:20px 0;text-align:center;"><p style="font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Refund Amount</p><p style="font-size:28px;font-weight:800;color:#5b21b6;margin:0;">${amt}</p>${p.refundId?`<p style="font-size:11px;color:#a78bfa;margin:8px 0 0;font-family:'Courier New',monospace;">Ref: ${p.refundId}</p>`:""}</div><p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0 0;">Questions about your refund? Reply to this email and we'll help right away.</p></div><div style="background:#064e3b;padding:20px 40px;text-align:center;"><p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p><p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas</p></div></div></body></html>`;
}

function buildConfirmationEmail(p: OrderConfirmationPayload): string {
  const rows = p.items.map(i=>`<tr><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#1e293b;"><strong>${i.name}</strong>${i.color?`<br/><span style="color:#94a3b8;font-size:11px;">${i.color}</span>`:""}${i.width&&i.height?`<br/><span style="color:#94a3b8;font-size:11px;">${i.width}" × ${i.height}"</span>`:""}</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;">${i.quantity}</td><td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;font-weight:600;">$${(i.price*i.quantity).toFixed(2)}</td></tr>`).join("");
  const addr = p.deliveryMethod==="delivery"
    ? `<div style="margin:18px 0;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:18px;"><p style="font-size:11px;font-weight:700;color:#166534;text-transform:uppercase;margin:0 0 8px;">📦 Property Address</p><p style="font-size:14px;color:#14532d;font-weight:600;margin:0;">${p.address}<br/>${p.city}, ${p.state} ${p.zip}</p></div>`
    : `<div style="margin:18px 0;background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:18px;"><p style="font-size:11px;font-weight:700;color:#c2410c;text-transform:uppercase;margin:0 0 8px;">🏭 Warehouse Pickup</p><p style="font-size:14px;color:#92400e;margin:0;">Your order will be ready for warehouse pickup — we'll send you details as soon as it's ready!</p></div>`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="background:linear-gradient(135deg,#064e3b,#065f46);padding:36px 40px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">✅</div><h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 6px;">Order Confirmed!</h1><p style="color:#a7f3d0;font-size:14px;margin:0;">Order <strong style="color:#fff;">${p.orderId}</strong></p></div><div style="padding:30px 40px;"><p style="font-size:15px;color:#1e293b;margin:0 0 6px;">Hi <strong>${p.customerName}</strong>,</p><p style="font-size:13px;color:#64748b;margin:0 0 18px;">Payment confirmed — our team is already working on your order!</p>${addr}<table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"><thead><tr style="background:#f8fafc;"><th style="padding:10px 14px;text-align:left;font-size:10px;color:#94a3b8;text-transform:uppercase;">Product</th><th style="padding:10px 14px;text-align:center;font-size:10px;color:#94a3b8;text-transform:uppercase;">Qty</th><th style="padding:10px 14px;text-align:right;font-size:10px;color:#94a3b8;text-transform:uppercase;">Price</th></tr></thead><tbody>${rows}</tbody><tfoot><tr style="background:#f8fafc;"><td colspan="2" style="padding:8px 14px;text-align:right;font-size:12px;color:#64748b;">Subtotal</td><td style="padding:8px 14px;text-align:right;font-size:12px;font-weight:600;">$${p.subtotal.toFixed(2)}</td></tr><tr style="background:#f8fafc;"><td colspan="2" style="padding:8px 14px;text-align:right;font-size:12px;color:#64748b;">Tax</td><td style="padding:8px 14px;text-align:right;font-size:12px;font-weight:600;">$${p.tax.toFixed(2)}</td></tr><tr style="background:#f0fdf4;border-top:2px solid #bbf7d0;"><td colspan="2" style="padding:12px 14px;text-align:right;font-size:14px;font-weight:700;color:#065f46;">Total Charged</td><td style="padding:12px 14px;text-align:right;font-size:18px;font-weight:800;color:#065f46;">$${p.total.toFixed(2)}</td></tr></tfoot></table></div><div style="background:#064e3b;padding:20px 40px;text-align:center;"><p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p><p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas</p></div></div></body></html>`;
}

function buildReferralNudgeEmail(p: ReferralNudgePayload): string {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hey! I just ordered custom blinds from Classic Same Day Blinds — same-day delivery in DFW! Use my link to get 10% off your first order: ${p.referralUrl}`)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent("Get 10% off custom blinds — Classic Same Day Blinds")}&body=${encodeURIComponent(`Hey!\n\nI just ordered custom window blinds from Classic Same Day Blinds and they're amazing. Use my referral link to get 10% off your first order:\n\n${p.referralUrl}\n\nThey even do same-day delivery in the DFW area!\n\nEnjoy!`)}`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#064e3b 0%,#065f46 60%,#047857 100%);padding:44px 40px 36px;text-align:center;position:relative;">
    <div style="font-size:52px;margin-bottom:14px;">🎁</div>
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;">You just earned points — now share the love!</h1>
    <p style="color:#a7f3d0;font-size:15px;margin:0;line-height:1.6;">Your order is confirmed. Invite a friend and earn <strong style="color:#6ee7b7;">${p.bonusPoints} bonus points</strong> when they place their first order.</p>
  </div>

  <!-- Body -->
  <div style="padding:36px 40px;">

    <p style="font-size:15px;color:#1e293b;margin:0 0 8px;">Hi <strong>${p.customerName}</strong> 👋</p>
    <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 28px;">Thanks for your order <strong style="color:#065f46;">${p.orderId}</strong>! While your blinds are being made, why not share the deal? Every friend who orders using your link earns you <strong>${p.bonusPoints} points</strong> — that's real money off your next purchase.</p>

    <!-- How it works -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:22px 24px;margin:0 0 28px;">
      <p style="font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 18px;">How it works</p>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="background:#065f46;color:#fff;font-size:12px;font-weight:800;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:26px;text-align:center;">1</div>
          <div><p style="font-size:13px;font-weight:700;color:#14532d;margin:0 0 2px;">Share your referral link</p><p style="font-size:12px;color:#166534;margin:0;">Send it to friends, family, or post it on socials</p></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="background:#065f46;color:#fff;font-size:12px;font-weight:800;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:26px;text-align:center;">2</div>
          <div><p style="font-size:13px;font-weight:700;color:#14532d;margin:0 0 2px;">They get 10% off their first order</p><p style="font-size:12px;color:#166534;margin:0;">Applied automatically when they use your link</p></div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="background:#065f46;color:#fff;font-size:12px;font-weight:800;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:26px;text-align:center;">3</div>
          <div><p style="font-size:13px;font-weight:700;color:#14532d;margin:0 0 2px;">You earn ${p.bonusPoints} bonus points</p><p style="font-size:12px;color:#166534;margin:0;">Instantly credited when their order is confirmed</p></div>
        </div>
      </div>
    </div>

    <!-- Referral code box -->
    <div style="border:2px dashed #6ee7b7;border-radius:14px;padding:22px 24px;margin:0 0 28px;text-align:center;background:#f9fffe;">
      <p style="font-size:11px;font-weight:800;color:#065f46;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px;">Your Unique Referral Code</p>
      <p style="font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:900;color:#064e3b;letter-spacing:4px;margin:0 0 14px;">${p.referralCode}</p>
      <p style="font-size:12px;color:#64748b;margin:0 0 16px;word-break:break-all;">${p.referralUrl}</p>
      <a href="${p.referralUrl}"
         style="display:inline-block;background:#065f46;color:#fff;font-size:14px;font-weight:800;padding:14px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">
        Share My Link →
      </a>
    </div>

    <!-- Share buttons -->
    <div style="display:flex;gap:12px;justify-content:center;margin:0 0 28px;flex-wrap:wrap;">
      <a href="${whatsappUrl}" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#fff;font-size:13px;font-weight:700;padding:12px 22px;border-radius:50px;text-decoration:none;">
        💬 Share on WhatsApp
      </a>
      <a href="${mailtoUrl}" style="display:inline-flex;align-items:center;gap:8px;background:#475569;color:#fff;font-size:13px;font-weight:700;padding:12px 22px;border-radius:50px;text-decoration:none;">
        ✉️ Send via Email
      </a>
    </div>

    <!-- Track referrals CTA -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px 22px;text-align:center;">
      <p style="font-size:13px;color:#92400e;margin:0 0 12px;line-height:1.6;">Track how many friends you've referred and see your bonus points in your account.</p>
      <a href="https://classicsamedayblinds.com/account" style="display:inline-block;background:#d97706;color:#fff;font-size:13px;font-weight:700;padding:10px 24px;border-radius:50px;text-decoration:none;">
        View My Referrals →
      </a>
    </div>

    <p style="font-size:12px;color:#94a3b8;text-align:center;margin:24px 0 0;line-height:1.6;">
      You're receiving this because you opted in to referral reminders.<br/>
      <a href="https://classicsamedayblinds.com/account" style="color:#94a3b8;">Manage email preferences</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#064e3b;padding:22px 40px;text-align:center;">
    <p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p>
    <p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas · classicsamedayblinds.com</p>
  </div>

</div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    return res.ok;
  } catch { return false; }
}

function statusSubject(orderId: string, status: string): string {
  const map: Record<string, string> = {
    "Working on Order": `🔧 We're Working on Your Order — ${orderId}`,
    "Ready for Pickup": `🏭 Your Order Is Ready for Warehouse Pickup — ${orderId}`,
    "Fulfilled & Shipped": `🚚 Your Order Has Shipped — ${orderId}`,
    "Delivered": `✅ Delivered — ${orderId}`,
    "Cancelled": `❌ Order Cancelled — ${orderId}`,
    "Pending": `⏳ Order Received — ${orderId}`,
  };
  return (map[status] ?? `Order Update: ${status} — ${orderId}`) + " | Classic Same Day Blinds";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const payload: EmailPayload = await req.json();

    if (payload.type === "referral_nudge") {
      const html = buildReferralNudgeEmail(payload);
      const ok = await sendEmail(
        payload.customerEmail,
        `🎁 You earned points — now share the deal! | Classic Same Day Blinds`,
        html
      );
      return new Response(JSON.stringify({ success: true, sent: ok }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (payload.type === "status_update") {
      const html = buildStatusEmail(payload);
      const ok = await sendEmail(payload.customerEmail, statusSubject(payload.orderId, payload.newStatus), html);
      const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h3>📋 Status Updated</h3><p><b>Order:</b> ${payload.orderId}</p><p><b>Customer:</b> ${payload.customerName} &lt;${payload.customerEmail}&gt;</p><p><b>New Status:</b> ${payload.newStatus}</p>${payload.trackingNumber ? `<p><b>Tracking:</b> ${payload.trackingNumber}</p>` : ""}${payload.pickupLocation ? `<p><b>Pickup Location:</b> ${payload.pickupLocation}</p>` : ""}</div>`;
      await sendEmail(ADMIN_EMAIL, `[Admin] ${payload.orderId} → ${payload.newStatus}`, adminHtml);
      return new Response(JSON.stringify({ success: true, sent: ok }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (payload.type === "payment_failed") {
      const html = buildPaymentFailedEmail(payload);
      const ok = await sendEmail(payload.customerEmail, `⚠️ Payment Failed${payload.orderId ? ` — ${payload.orderId}` : ""} | Classic Same Day Blinds`, html);
      const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h3>⚠️ Payment Failed</h3><p><b>Customer:</b> ${payload.customerName ?? "Unknown"} &lt;${payload.customerEmail}&gt;</p>${payload.orderId ? `<p><b>Order:</b> ${payload.orderId}</p>` : ""}<p><b>Amount:</b> ${payload.amount ? `$${(payload.amount / 100).toFixed(2)}` : "unknown"}</p>${payload.reason ? `<p><b>Reason:</b> ${payload.reason}</p>` : ""}</div>`;
      await sendEmail(ADMIN_EMAIL, `[Admin] Payment Failed${payload.orderId ? ` — ${payload.orderId}` : ""}`, adminHtml);
      return new Response(JSON.stringify({ success: true, sent: ok }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (payload.type === "payment_refunded") {
      const html = buildRefundEmail(payload);
      const ok = await sendEmail(payload.customerEmail, `💰 Refund Processed${payload.orderId ? ` — ${payload.orderId}` : ""} | Classic Same Day Blinds`, html);
      const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h3>💰 Refund Issued</h3><p><b>Customer:</b> ${payload.customerName ?? "Unknown"} &lt;${payload.customerEmail}&gt;</p>${payload.orderId ? `<p><b>Order:</b> ${payload.orderId}</p>` : ""}<p><b>Amount:</b> ${payload.amount ? `$${(payload.amount / 100).toFixed(2)}` : "unknown"}</p>${payload.refundId ? `<p><b>Refund ID:</b> ${payload.refundId}</p>` : ""}</div>`;
      await sendEmail(ADMIN_EMAIL, `[Admin] Refund Issued${payload.orderId ? ` — ${payload.orderId}` : ""}`, adminHtml);
      return new Response(JSON.stringify({ success: true, sent: ok }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (payload.type === "order_confirmation") {
      const [c, a] = await Promise.all([
        sendEmail(payload.customerEmail, `Order Confirmed — ${payload.orderId} | Classic Same Day Blinds`, buildConfirmationEmail(payload)),
        sendEmail(ADMIN_EMAIL, `✅ New Stripe Payment — ${payload.orderId} | $${payload.total.toFixed(2)}`, `<div style="font-family:sans-serif;padding:20px;"><h3>💰 New Stripe Payment</h3><p><b>Order:</b> ${payload.orderId}</p><p><b>Customer:</b> ${payload.customerName} &lt;${payload.customerEmail}&gt;</p><p><b>Total:</b> $${payload.total.toFixed(2)}</p>${payload.stripeSessionId ? `<p><b>Stripe Session:</b> ${payload.stripeSessionId}</p>` : ""}</div>`),
      ]);
      return new Response(JSON.stringify({ success: true, customer: c, admin: a }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const any = payload as any;
    if (any.orderId && any.customerEmail) {
      const asConf: OrderConfirmationPayload = { type: "order_confirmation", ...any };
      const [c, a] = await Promise.all([
        sendEmail(any.customerEmail, `Order Confirmed — ${any.orderId} | Classic Same Day Blinds`, buildConfirmationEmail(asConf)),
        sendEmail(ADMIN_EMAIL, `✅ New Order — ${any.orderId}`, `<div style="font-family:sans-serif;padding:20px;"><b>Order:</b> ${any.orderId}<br><b>Customer:</b> ${any.customerName}</div>`),
      ]);
      return new Response(JSON.stringify({ success: true, customer: c, admin: a }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

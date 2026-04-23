import Stripe from "https://esm.sh/stripe@14.21.0";

const RESEND_API_KEY = "re_72LKy474_AmKtKhvqvDKBLX6QXXTKkjm8";
const ADMIN_EMAIL = "Lukethomas1721@gmail.com";
const FROM_EMAIL = "Classic Same Day Blinds <orders@classicsamedayblinds.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, stripe-signature, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

function buildPaymentFailedEmail(customerName: string, orderId: string, amount: number, reason: string): string {
  const amtStr = `$${(amount / 100).toFixed(2)}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="background:#ef4444;padding:36px 40px 28px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">⚠️</div><h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Payment Was Unsuccessful</h1><p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Order <strong style="color:#fff;">${orderId}</strong></p></div><div style="padding:32px 40px;"><p style="font-size:15px;color:#1e293b;margin:0 0 6px;">Hi <strong>${customerName}</strong>,</p><p style="font-size:14px;color:#64748b;margin:0 0 20px;line-height:1.6;">Unfortunately, your payment of <strong>${amtStr}</strong> could not be processed.${reason ? ` Reason: <em>${reason}</em>.` : ""} This can happen due to insufficient funds, an expired card, or a bank decline.</p><div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;"><p style="font-size:13px;font-weight:700;color:#991b1b;margin:0 0 8px;">What to do next:</p><ul style="font-size:13px;color:#7f1d1d;margin:0;padding-left:18px;line-height:2;"><li>Check your card details and billing address</li><li>Contact your bank to authorize the transaction</li><li>Try a different payment method</li></ul></div><div style="text-align:center;margin:24px 0;"><a href="https://classicsamedayblinds.com/cart" style="display:inline-block;background:#064e3b;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:50px;text-decoration:none;">Retry My Order →</a></div><p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0 0;">Need help? Reply to this email and we'll sort it out immediately.</p></div><div style="background:#064e3b;padding:20px 40px;text-align:center;"><p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p><p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas</p></div></div></body></html>`;
}

function buildRefundEmail(customerName: string, orderId: string, amount: number, refundId: string): string {
  const amtStr = `$${(amount / 100).toFixed(2)}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;"><div style="background:#8b5cf6;padding:36px 40px 28px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">💰</div><h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;">Your Refund Is Being Processed</h1><p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Order <strong style="color:#fff;">${orderId}</strong></p></div><div style="padding:32px 40px;"><p style="font-size:15px;color:#1e293b;margin:0 0 6px;">Hi <strong>${customerName}</strong>,</p><p style="font-size:14px;color:#64748b;margin:0 0 20px;line-height:1.6;">We've initiated a refund of <strong>${amtStr}</strong> to your original payment method. Refunds typically appear within 5–10 business days depending on your bank.</p><div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:12px;padding:20px;margin:20px 0;text-align:center;"><p style="font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Refund Amount</p><p style="font-size:28px;font-weight:800;color:#5b21b6;margin:0;">${amtStr}</p><p style="font-size:11px;color:#a78bfa;margin:8px 0 0;font-family:'Courier New',monospace;">Ref: ${refundId}</p></div><p style="font-size:13px;color:#94a3b8;text-align:center;margin:20px 0 0;">Questions about your refund? Reply to this email and we'll help right away.</p></div><div style="background:#064e3b;padding:20px 40px;text-align:center;"><p style="font-size:14px;font-weight:700;color:#a7f3d0;margin:0 0 4px;">Classic Same Day Blinds</p><p style="font-size:12px;color:#6ee7b7;margin:0;">DFW Area, Texas</p></div></div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;

  // Verify signature if secret is configured
  if (webhookSecret && signature) {
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) throw new Error("Stripe key not configured");
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }
  } else {
    // No secret configured yet — parse directly (set up secret in Stripe dashboard later)
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }
  }

  try {
    switch (event.type) {
      // ── Payment Failed ──────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const customerEmail = pi.receipt_email ?? (pi.metadata?.customer_email as string | undefined) ?? "";
        const customerName = (pi.metadata?.customer_name as string | undefined) ?? "Valued Customer";
        const orderId = (pi.metadata?.order_id as string | undefined) ?? "";
        const amount = pi.amount ?? 0;
        const reason = pi.last_payment_error?.message ?? "";

        if (customerEmail) {
          await sendEmail(
            customerEmail,
            `⚠️ Payment Failed${orderId ? ` — ${orderId}` : ""} | Classic Same Day Blinds`,
            buildPaymentFailedEmail(customerName, orderId, amount, reason)
          );
          const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h3>⚠️ Payment Failed</h3><p><b>Customer:</b> ${customerName} &lt;${customerEmail}&gt;</p>${orderId ? `<p><b>Order:</b> ${orderId}</p>` : ""}<p><b>Amount:</b> $${(amount / 100).toFixed(2)}</p>${reason ? `<p><b>Reason:</b> ${reason}</p>` : ""}<p><b>PaymentIntent:</b> ${pi.id}</p></div>`;
          await sendEmail(ADMIN_EMAIL, `[Admin] ⚠️ Payment Failed${orderId ? ` — ${orderId}` : ""}`, adminHtml);
        }
        break;
      }

      // ── Checkout Session Expired (payment abandoned) ────────────────────
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_email ?? (session.customer_details?.email ?? "");
        const customerName = session.customer_details?.name ?? "Valued Customer";
        const orderId = (session.metadata?.order_id as string | undefined) ?? "";
        const amount = session.amount_total ?? 0;

        if (customerEmail) {
          await sendEmail(
            customerEmail,
            `⚠️ Your Order Was Not Completed${orderId ? ` — ${orderId}` : ""} | Classic Same Day Blinds`,
            buildPaymentFailedEmail(customerName, orderId, amount, "Checkout session expired")
          );
          const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h3>🕐 Checkout Session Expired</h3><p><b>Customer:</b> ${customerName} &lt;${customerEmail}&gt;</p>${orderId ? `<p><b>Order:</b> ${orderId}</p>` : ""}<p><b>Amount:</b> $${(amount / 100).toFixed(2)}</p><p><b>Session:</b> ${session.id}</p></div>`;
          await sendEmail(ADMIN_EMAIL, `[Admin] Checkout Expired${orderId ? ` — ${orderId}` : ""}`, adminHtml);
        }
        break;
      }

      // ── Refund Issued ────────────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const customerEmail = charge.receipt_email ?? (charge.billing_details?.email ?? "");
        const customerName = charge.billing_details?.name ?? (charge.metadata?.customer_name as string | undefined) ?? "Valued Customer";
        const orderId = (charge.metadata?.order_id as string | undefined) ?? "";

        // Get the most recent refund
        const refund = charge.refunds?.data?.[0];
        const refundAmount = refund?.amount ?? charge.amount_refunded ?? 0;
        const refundId = refund?.id ?? "N/A";

        if (customerEmail && refundAmount > 0) {
          await sendEmail(
            customerEmail,
            `💰 Refund Processed${orderId ? ` — ${orderId}` : ""} | Classic Same Day Blinds`,
            buildRefundEmail(customerName, orderId, refundAmount, refundId)
          );
          const adminHtml = `<div style="font-family:sans-serif;padding:20px;"><h3>💰 Refund Issued</h3><p><b>Customer:</b> ${customerName} &lt;${customerEmail}&gt;</p>${orderId ? `<p><b>Order:</b> ${orderId}</p>` : ""}<p><b>Refund Amount:</b> $${(refundAmount / 100).toFixed(2)}</p><p><b>Refund ID:</b> ${refundId}</p><p><b>Charge:</b> ${charge.id}</p></div>`;
          await sendEmail(ADMIN_EMAIL, `[Admin] Refund Issued${orderId ? ` — ${orderId}` : ""}`, adminHtml);
        }
        break;
      }

      // ── Partial Refund ───────────────────────────────────────────────────
      case "charge.refund.updated": {
        const refund = event.data.object as Stripe.Refund;
        if (refund.status === "succeeded") {
          const charge = typeof refund.charge === "string" ? { id: refund.charge, receipt_email: "", billing_details: { name: "", email: "" }, metadata: {} } : refund.charge as any;
          const customerEmail = charge?.receipt_email ?? "";
          const customerName = charge?.billing_details?.name ?? "Valued Customer";
          const orderId = (charge?.metadata?.order_id as string | undefined) ?? "";

          if (customerEmail && refund.amount) {
            await sendEmail(
              customerEmail,
              `💰 Refund Confirmed${orderId ? ` — ${orderId}` : ""} | Classic Same Day Blinds`,
              buildRefundEmail(customerName, orderId, refund.amount, refund.id)
            );
          }
        }
        break;
      }

      default:
        // Unhandled event type — log and return OK
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

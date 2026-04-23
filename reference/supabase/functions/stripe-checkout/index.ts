import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe key not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const {
      items,
      tax,
      promoDiscount,
      customer,
      orderId,
      successUrl,
      cancelUrl,
    } = await req.json();

    const subtotal: number = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Apply discount factor proportionally to each item
    const discountFactor =
      promoDiscount > 0 ? (subtotal - promoDiscount) / subtotal : 1;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: {
        name: string;
        price: number;
        quantity: number;
        image?: string;
        color?: string;
        mount?: string;
        width?: string;
        height?: string;
      }) => {
        const descParts = [
          item.color,
          item.mount,
          item.width && item.height
            ? `${item.width}" x ${item.height}"`
            : undefined,
        ].filter(Boolean);

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              ...(descParts.length > 0 && {
                description: descParts.join(" · "),
              }),
              ...(item.image && { images: [item.image] }),
            },
            unit_amount: Math.round(item.price * discountFactor * 100),
          },
          quantity: item.quantity,
        };
      }
    );

    // Add tax line item
    const taxCents = Math.round(tax * 100);
    if (taxCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Sales Tax (8.25%)" },
          unit_amount: taxCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: cancelUrl,
      customer_email: customer.email,
      metadata: {
        order_id: orderId,
        customer_name: `${customer.firstName} ${customer.lastName}`,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

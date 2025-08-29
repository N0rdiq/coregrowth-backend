import Stripe from "stripe";

// WICHTIG: Node.js Runtime (nicht Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    currency: "chf",
    line_items: [{ price: process.env.PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.DOMAIN}/roi-analyzer/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/roi-analyzer?canceled=1`,
    locale: "de-CH",
    billing_address_collection: "auto",
    allow_promotion_codes: true
  });

  return Response.json({ id: session.id }, {
    headers: {
      // CORS simpel offen – später auf deine Domain einschränken
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

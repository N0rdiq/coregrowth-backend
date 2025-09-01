import Stripe from "stripe";
// wichtig: Node.js Runtime (nicht Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // KEINE apiVersion angeben → Account-Default wird verwendet
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    currency: "chf",
    line_items: [{ price: process.env.PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.DOMAIN}/roi-analyzer/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/roi-analyzer?canceled=1`,
    locale: "de",
    billing_address_collection: "auto",
    allow_promotion_codes: true
  });
  
  return Response.json({ id: session.id }, {
    headers: {
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

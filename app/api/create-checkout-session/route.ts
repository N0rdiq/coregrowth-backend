import Stripe from "stripe";

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
  return Response.json({ id: session.id });
}

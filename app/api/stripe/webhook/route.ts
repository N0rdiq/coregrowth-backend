import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// WICHTIG: Node.js Runtime (nicht Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  // App Router: rohes ArrayBuffer lesen (kein Body-Parser aktiv)
  const buf = await req.arrayBuffer();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email || "";
    const amount = (session.amount_total ?? 0) / 100;

    if (email) {
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
      await supabase
        .from("purchases")
        .upsert({
          email,
          product: "roi-analyzer",
          stripe_session_id: session.id,
          amount_chf: amount,
          paid_at: new Date().toISOString(),
          source: "checkout"
        }, { onConflict: "stripe_session_id" });
    }
  }

  return new Response(null, { status: 200 });
}

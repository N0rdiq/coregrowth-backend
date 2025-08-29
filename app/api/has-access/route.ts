import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  const { email } = await req.json();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
  const { data } = await supabase
    .from("purchases").select("id").eq("email", email).eq("product", "roi-analyzer").limit(1).maybeSingle();
  return Response.json({ hasAccess: !!data });
}

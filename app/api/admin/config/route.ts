import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase.from("config").select("*").eq("id", 1).single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const scheduled_at_utc = body.scheduled_at_utc ?? null;
  const spins_count = Math.max(1, Number(body.spins_count ?? 1));
  const prize_title = String(body.prize_title ?? "Hadiah");
  const allow_same_winner = Boolean(body.allow_same_winner ?? true);

  const { data, error } = await supabase
    .from("config")
    .update({ scheduled_at_utc, spins_count, prize_title, allow_same_winner })
    .eq("id", 1)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

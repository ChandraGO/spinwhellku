import { supabase } from "@/lib/supabase";
import { pickWinnersWeighted } from "@/lib/logic";
import { requireCron } from "@/lib/auth";

export async function GET(req: Request) {
  if (!requireCron(req)) return new Response("Unauthorized", { status: 401 });

  const { data: cfg, error: cfgErr } = await supabase.from("config").select("*").eq("id", 1).single();
  if (cfgErr) return Response.json({ error: cfgErr.message }, { status: 500 });

  if (!cfg.scheduled_at_utc) return Response.json({ ok: true, skipped: "no schedule" });

  const now = new Date();
  const scheduled = new Date(cfg.scheduled_at_utc);

  if (now < scheduled) {
    return Response.json({ ok: true, skipped: "too early", now: now.toISOString(), scheduled: scheduled.toISOString() });
  }

  const runKey = `schedule:${scheduled.toISOString()}`;

  // Anti double-run: check if we already inserted at least one winner for this runKey
  const { data: existing, error: exErr } = await supabase
    .from("winners")
    .select("id")
    .eq("run_key", runKey)
    .limit(1);

  if (exErr) return Response.json({ error: exErr.message }, { status: 500 });
  if (existing && existing.length > 0) return Response.json({ ok: true, skipped: "already ran", runKey });

  const { data: participants, error: pErr } = await supabase
    .from("participants")
    .select("id,name,points")
    .order("created_at", { ascending: true });

  if (pErr) return Response.json({ error: pErr.message }, { status: 500 });
  if (!participants?.length) return Response.json({ error: "No participants" }, { status: 400 });

  const spins = Math.max(1, Number(cfg.spins_count ?? 1));
  const allowSameWinner = Boolean(cfg.allow_same_winner ?? true);

  const winners = pickWinnersWeighted(participants as any, spins, allowSameWinner);

  const rows = winners.map((w: any) => ({
    participant_id: w.id,
    participant_name: w.name,
    points: w.points,
    prize_title: cfg.prize_title,
    run_key: runKey,
  }));

  const { error: wErr } = await supabase.from("winners").insert(rows);
  if (wErr) return Response.json({ error: wErr.message }, { status: 500 });

  await supabase.from("config").update({ last_run_at: now.toISOString() }).eq("id", 1);

  return Response.json({ ok: true, runKey, winners });
}

import { supabase } from "../../../lib/supabase";
import { pickWinnersWeighted } from "../../../lib/logic";

export async function POST() {
  const { data: cfg, error: cfgErr } = await supabase.from("config").select("*").eq("id", 1).single();
  if (cfgErr) return Response.json({ error: cfgErr.message }, { status: 500 });

  const { data: participants, error: pErr } = await supabase
    .from("participants")
    .select("id,name,points,created_at")
    .order("created_at", { ascending: true });

  if (pErr) return Response.json({ error: pErr.message }, { status: 500 });
  if (!participants?.length) return Response.json({ error: "No participants" }, { status: 400 });

  const spins = Math.max(1, Number(cfg.spins_count ?? 1));
  const allowSameWinner = Boolean(cfg.allow_same_winner ?? true);

  const winners = pickWinnersWeighted(participants as any, spins, allowSameWinner);

  // ✅ simpan winners biar tampil di panel kanan juga
  const runKey = `manual:${new Date().toISOString()}`;
  const rows = winners.map((w: any) => ({
    participant_id: w.id,
    participant_name: w.name,
    points: w.points,
    prize_title: cfg.prize_title,
    run_key: runKey,
  }));

  const { error: wErr } = await supabase.from("winners").insert(rows);
  if (wErr) return Response.json({ error: wErr.message }, { status: 500 });

  return Response.json({
    winners,
    prize_title: cfg.prize_title,
    run_key: runKey,
  });
}

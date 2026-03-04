import { supabase } from "@/lib/supabase";
import WheelClient from "./wheel-client";
import { ParticipantsList } from "@/components/ParticipantsList";
import { WinnersPanel } from "@/components/WinnersPanel";

export default async function Page() {
  const { data: participants } = await supabase
    .from("participants")
    .select("id,name,points,created_at")
    .order("created_at", { ascending: true });

  const { data: cfg } = await supabase.from("config").select("*").eq("id", 1).single();

  const { data: winners } = await supabase
    .from("winners")
    .select("id,participant_name,points,prize_title,run_at")
    .order("run_at", { ascending: false })
    .limit(20);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: "0 0 14px" }}>Spin Wheel</h1>
        <a href="/admin" style={{ color: "var(--muted)", fontWeight: 700 }}>Admin →</a>
      </div>

      <div className="grid">
        <div style={{ display: "grid", gap: 18 }}>
          <WheelClient initialParticipants={participants ?? []} />

          <div className="card">
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Jadwal Undian (WITA)</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>
              {cfg?.scheduled_at_utc
                ? new Date(cfg.scheduled_at_utc).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })
                : "Belum diatur"}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
              Jumlah spin: {cfg?.spins_count ?? 1} • Boleh pemenang sama: {cfg?.allow_same_winner ? "Ya" : "Tidak"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <WinnersPanel winners={winners ?? []} title={cfg?.prize_title ?? "Hadiah"} />
          <ParticipantsList participants={participants ?? []} />
        </div>
      </div>
    </div>
  );
}

export function WinnersPanel({ winners, title }: { winners: any[]; title: string }) {
  return (
    <div className="card">
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {winners.map((w) => (
          <div key={w.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>{w.participant_name ?? "-"}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              {new Date(w.run_at).toLocaleString("id-ID", { timeZone: "Asia/Makassar" })}
            </div>
          </div>
        ))}
        {winners.length === 0 && <div style={{ color: "var(--muted)" }}>Belum ada pemenang.</div>}
      </div>
    </div>
  );
}

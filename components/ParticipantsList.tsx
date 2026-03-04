export function ParticipantsList({ participants }: { participants: any[] }) {
  return (
    <div className="card">
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Daftar Nama & Poin</div>
      <div style={{ display: "grid", gap: 8 }}>
        {participants.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </div>
            <div style={{ color: "var(--muted)" }}>{p.points}</div>
          </div>
        ))}
        {participants.length === 0 && <div style={{ color: "var(--muted)" }}>Belum ada peserta.</div>}
      </div>
    </div>
  );
}

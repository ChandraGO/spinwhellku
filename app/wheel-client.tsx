"use client";

import { useState } from "react";
import { Wheel } from "../components/Wheel";

type Participant = { id: string; name: string; points: number };

export default function WheelClient({ initialParticipants }: { initialParticipants: Participant[] }) {
  const [winners, setWinners] = useState<Participant[]>([]);
  const [prizeTitle, setPrizeTitle] = useState<string>("Hadiah");

  return (
    <>
      <Wheel
        participants={initialParticipants}
        onWinners={(ws, title) => {
          setWinners(ws);
          setPrizeTitle(title);
        }}
      />

      <div className="card">
        <div style={{ fontWeight: 900, marginBottom: 10 }}>{prizeTitle}</div>
        {winners.length ? (
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {winners.map((w, i) => (
              <li key={`${w.id}-${i}`} style={{ fontSize: 18 }}>{w.name}</li>
            ))}
          </ol>
        ) : (
          <div style={{ color: "var(--muted)" }}>Belum ada pemenang (manual). Pemenang auto akan tersimpan di panel kanan.</div>
        )}
      </div>
    </>
  );
}

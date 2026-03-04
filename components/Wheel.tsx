"use client";

import { useMemo, useState } from "react";

type Participant = { id: string; name: string; points: number };

export function Wheel({
  participants,
  onWinners,
  disabled,
}: {
  participants: Participant[];
  onWinners: (winners: Participant[], prizeTitle: string) => void;
  disabled?: boolean;
}) {
  const slices = useMemo(() => {
    const colors = [
      "hsl(197 30% 43%)",
      "hsl(173 58% 39%)",
      "hsl(43 74% 66%)",
      "hsl(27 87% 67%)",
      "hsl(12 76% 61%)",
      "hsl(350 60% 52%)",
      "hsl(91 43% 54%)",
      "hsl(140 36% 74%)",
    ];
    return (participants ?? []).map((p, i) => ({
      ...p,
      color: colors[i % colors.length],
    }));
  }, [participants]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const conic = useMemo(() => {
    if (slices.length === 0) return "conic-gradient(#333 0 100%)";
    const step = 100 / slices.length;
    const stops = slices.map((s, i) => `${s.color} ${i * step}% ${(i + 1) * step}%`);
    return `conic-gradient(from -90deg, ${stops.join(",")})`;
  }, [slices]);

  async function spin() {
    if (disabled || isSpinning || slices.length === 0) return;

    setIsSpinning(true);

    const res = await fetch("/api/spin", { method: "POST" });
    let json: any = null;
    try {
      json = await res.json();
    } catch {}

    if (!res.ok) {
      alert("Spin gagal: " + (json?.error || res.statusText));
      setIsSpinning(false);
      return;
    }

    const winners: Participant[] = json.winners || [];
    const prizeTitle: string = json.prize_title || "Hadiah";

    if (!winners.length) {
      alert("Tidak ada pemenang. Pastikan peserta sudah ada.");
      setIsSpinning(false);
      return;
    }

    // Animasi berhenti menunjuk winner pertama
    const first = winners[0];
    const idx = slices.findIndex((s) => s.id === first.id);
    const sliceDeg = 360 / slices.length;

    // target angle supaya pointer kiri menunjuk tengah slice winner
    const target = 360 - (idx * sliceDeg + sliceDeg / 2);

    // ekstra putaran
    const extra = 360 * (8 + Math.floor(Math.random() * 6));
    const nextRot = extra + target;

    setRotation(nextRot);

    window.setTimeout(() => {
      setIsSpinning(false);
      onWinners(winners, prizeTitle);

      // set ke posisi target final (biar tidak lompat)
      setRotation(target);
    }, 7600);
  }

  const sliceDeg = slices.length ? 360 / slices.length : 0;
  const prizeOffset = slices.length ? Math.floor(180 / slices.length) : 0;

  return (
    <div className="card" style={{ position: "relative" }}>
      <div style={{ display: "grid", gap: 14, placeItems: "center" }}>
        <div style={{ position: "relative", width: "min(520px, 86vw)", aspectRatio: "1/1" }}>
          {/* Pointer */}
          <div
            style={{
              position: "absolute",
              left: -8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 34,
              height: 18,
              clipPath: "polygon(20% 0, 100% 50%, 20% 100%, 0% 50%)",
              background: "linear-gradient(#fff, rgba(255,255,255,.6))",
              zIndex: 10,
              opacity: 0.9,
            }}
          />

          {/* ROTATOR: background + text ikut muter */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "999px",
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? "transform 7.5s cubic-bezier(0.1,-0.01,0,1)"
                : "transform 400ms ease",
              animation: isSpinning ? "none" : "idleSpin 40s linear infinite", // idle pelan
              boxShadow: "0 18px 60px rgba(0,0,0,.35)",
              overflow: "hidden",
            }}
          >
            {/* background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "999px",
                background: conic,
                border: "10px solid rgba(255,255,255,.10)",
                boxShadow: "inset 0 0 0 8px rgba(0,0,0,.25)",
              }}
            />

            {/* labels ala codepen (prize) */}
            {slices.map((s, i) => {
              const r = ((sliceDeg * i) * -1) - prizeOffset;

              return (
                <div
                  key={s.id}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "50%",
                    height: "50%",
                    transformOrigin: "center right",
                    transform: `rotate(${r}deg)`,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14% 0 6%",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    title={`${s.name} (${s.points})`}
                    style={{
                      fontWeight: 900,
                      fontSize: "clamp(10px, 1.6vw, 14px)",
                      color: "rgba(255,255,255,.95)",
                      textShadow: "0 2px 10px rgba(0,0,0,.70)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {s.name} • {s.points}
                  </div>
                </div>
              );
            })}

            {/* center cap */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                width: "26%",
                height: "26%",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), rgba(255,255,255,.08))",
                border: "1px solid rgba(255,255,255,.18)",
                backdropFilter: "blur(10px)",
                zIndex: 12,
              }}
            />
          </div>

          <style jsx global>{`
            @keyframes idleSpin {
              from {
                transform: rotate(${rotation}deg);
              }
              to {
                transform: rotate(${rotation + 360}deg);
              }
            }
          `}</style>
        </div>

        <button
          onClick={spin}
          disabled={disabled || isSpinning || slices.length === 0}
          style={{
            border: "1px solid rgba(255,255,255,.16)",
            background: "rgba(255,255,255,.10)",
            color: "white",
            padding: "12px 18px",
            borderRadius: 12,
            cursor: disabled || isSpinning ? "not-allowed" : "pointer",
            opacity: disabled || isSpinning ? 0.5 : 1,
            fontWeight: 800,
          }}
        >
          {isSpinning ? "Spinning..." : "Spin (Manual)"}
        </button>

        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Wheel idle muter pelan terus. Saat spin, teks ikut berputar bersama warna.
        </div>
      </div>
    </div>
  );
}

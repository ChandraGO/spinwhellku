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
      "hsl(197 30% 43%)","hsl(173 58% 39%)","hsl(43 74% 66%)","hsl(27 87% 67%)",
      "hsl(12 76% 61%)","hsl(350 60% 52%)","hsl(91 43% 54%)","hsl(140 36% 74%)"
    ];
    return participants.map((p, i) => ({ ...p, color: colors[i % colors.length] }));
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
    const json = await res.json();
    const winners: Participant[] = json.winners || [];
    const prizeTitle: string = json.prize_title || "Hadiah";

    // Animate using the first winner to point to
    const first = winners[0] || slices[0];
    const idx = slices.findIndex((s) => s.id === first.id);
    const sliceDeg = 360 / slices.length;

    const target = 360 - (idx * sliceDeg + sliceDeg / 2);
    const extra = 360 * (8 + Math.floor(Math.random() * 6));
    const nextRot = extra + target;

    setRotation(nextRot);

    window.setTimeout(() => {
      setIsSpinning(false);
      onWinners(winners, prizeTitle);
      setRotation(target);
    }, 7600);
  }

  return (
    <div className="card" style={{ position: "relative" }}>
      <div style={{ display: "grid", gap: 14, placeItems: "center" }}>
        <div style={{ position: "relative", width: "min(520px, 86vw)", aspectRatio: "1/1" }}>
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
              zIndex: 3,
              opacity: 0.9,
            }}
          />
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "999px",
              background: conic,
              border: "10px solid rgba(255,255,255,.10)",
              boxShadow: "inset 0 0 0 8px rgba(0,0,0,.25), 0 18px 60px rgba(0,0,0,.35)",
              display: "grid",
              placeItems: "center",
              position: "relative",
              overflow: "hidden",
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 7.5s cubic-bezier(0.1,-0.01,0,1)" : "transform 400ms ease",
              animation: isSpinning ? "none" : "idleSpin 28s linear infinite"
            }}
          >
            <div
              style={{
                width: "26%",
                height: "26%",
                borderRadius: "999px",
                background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), rgba(255,255,255,.08))",
                border: "1px solid rgba(255,255,255,.18)",
                backdropFilter: "blur(10px)",
              }}
            />
          </div>

          {slices.map((s, i) => {
            const angle = (360 / slices.length) * i;
            return (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "10%",
                    top: "50%",
                    transform: "translateY(-50%) rotate(90deg)",
                    width: "40%",
                    color: "rgba(0,0,0,.82)",
                    fontWeight: 800,
                    fontSize: "clamp(10px, 1.8vw, 14px)",
                    textShadow: "0 1px 0 rgba(255,255,255,.25)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "left",
                  }}
                  title={`${s.name} (${s.points})`}
                >
                  {s.name} • {s.points}
                </div>
              </div>
            );
          })}
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
          Auto-spin akan jalan sesuai jadwal. Wheel tetap muter pelan sebelum jadwal.
        </div>
      </div>

      <style jsx global>{`
        @keyframes idleSpin {
          from { transform: rotate(${rotation}deg); }
          to { transform: rotate(${rotation + 360}deg); }
        }
      `}</style>
    </div>
  );
}

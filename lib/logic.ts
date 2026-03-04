export type Participant = { id: string; name: string; points: number };

export function pickWeighted(participants: Participant[]): Participant {
  const pool = participants.filter((p) => (p.points ?? 0) > 0);
  const list = pool.length ? pool : participants;
  const total = list.reduce((s, p) => s + Math.max(0, p.points ?? 0), 0);

  // all zeros fallback random
  if (total <= 0) return list[Math.floor(Math.random() * list.length)];

  let r = Math.random() * total;
  for (const p of list) {
    r -= Math.max(0, p.points ?? 0);
    if (r <= 0) return p;
  }
  return list[list.length - 1];
}

export function pickWinnersWeighted(
  participants: Participant[],
  count: number,
  allowSameWinner: boolean
): Participant[] {
  const winners: Participant[] = [];
  const available = [...participants];

  for (let i = 0; i < count; i++) {
    if (!available.length) break;
    const w = pickWeighted(available);
    winners.push(w);
    if (!allowSameWinner) {
      const idx = available.findIndex((p) => p.id === w.id);
      if (idx >= 0) available.splice(idx, 1);
    }
  }
  return winners;
}

export function toUtcISOStringFromWitaLocalInput(localWita: string) {
  // localWita: "YYYY-MM-DDTHH:mm" (WITA = UTC+8)
  const [datePart, timePart] = localWita.split("T");
  const [Y, M, D] = datePart.split("-").map(Number);
  const [h, m] = timePart.split(":").map(Number);

  const utcMs = Date.UTC(Y, M - 1, D, h - 8, m, 0);
  return new Date(utcMs).toISOString();
}

"use client";

import { useEffect, useState } from "react";
import { toUtcISOStringFromWitaLocalInput } from "@/lib/logic";

function askAuthHeader() {
  const pass = prompt("Admin password:") || "";
  const token = btoa(`admin:${pass}`);
  return `Basic ${token}`;
}

export default function AdminPage() {
  const [auth, setAuth] = useState<string>("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [cfg, setCfg] = useState<any>(null);

  const [name, setName] = useState("");
  const [points, setPoints] = useState(1);

  const [scheduledWita, setScheduledWita] = useState(""); // datetime-local
  const [spinsCount, setSpinsCount] = useState(1);
  const [prizeTitle, setPrizeTitle] = useState("Hadiah");
  const [allowSameWinner, setAllowSameWinner] = useState(true);

  useEffect(() => {
    const a = askAuthHeader();
    setAuth(a);
  }, []);

  async function load() {
    const p = await fetch("/api/admin/participants");
    const pj = await p.json();
    setParticipants(pj.data ?? []);

    const c = await fetch("/api/admin/config");
    const cj = await c.json();
    setCfg(cj.data);
    setSpinsCount(cj.data?.spins_count ?? 1);
    setPrizeTitle(cj.data?.prize_title ?? "Hadiah");
    setAllowSameWinner(cj.data?.allow_same_winner ?? true);
  }

  useEffect(() => {
    load();
  }, [auth]);

  async function addParticipant() {
    await fetch("/api/admin/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: auth },
      body: JSON.stringify({ name, points }),
    });
    setName("");
    setPoints(1);
    await load();
  }

  async function removeParticipant(id: string) {
    await fetch(`/api/admin/participants?id=${id}`, {
      method: "DELETE",
      headers: { authorization: auth },
    });
    await load();
  }

  async function saveConfig() {
    const scheduled_at_utc = scheduledWita ? toUtcISOStringFromWitaLocalInput(scheduledWita) : null;

    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: auth },
      body: JSON.stringify({
        scheduled_at_utc,
        spins_count: spinsCount,
        prize_title: prizeTitle,
        allow_same_winner: allowSameWinner,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      alert("Gagal simpan: " + t);
      return;
    }

    await load();
    alert("Config tersimpan.");
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: "0 0 14px" }}>Admin</h1>
        <a href="/" style={{ color: "var(--muted)", fontWeight: 700 }}>← Kembali</a>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Tambah Peserta</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" style={inp} />
          <input value={points} onChange={(e) => setPoints(Number(e.target.value))} type="number" min={0} style={inp} />
          <button onClick={addParticipant} style={btn}>Tambah</button>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.10)", paddingTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Daftar Peserta</div>
          <div style={{ display: "grid", gap: 8 }}>
            {participants.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>Poin: {p.points}</div>
                </div>
                <button onClick={() => removeParticipant(p.id)} style={btnDanger}>Hapus</button>
              </div>
            ))}
            {participants.length === 0 && <div style={{ color: "rgba(255,255,255,.65)" }}>Belum ada peserta.</div>}
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Pengaturan Undian</div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={lbl}>Judul Hadiah</span>
          <input value={prizeTitle} onChange={(e) => setPrizeTitle(e.target.value)} style={inp} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={lbl}>Jadwal Auto-Spin (WITA)</span>
          <input type="datetime-local" value={scheduledWita} onChange={(e) => setScheduledWita(e.target.value)} style={inp} />
          <span style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}>
            Disimpan sebagai UTC (WITA - 8 jam). Cron akan eksekusi saat waktu terlewati.
          </span>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={lbl}>Jumlah Spin Saat Event</span>
          <input type="number" min={1} value={spinsCount} onChange={(e) => setSpinsCount(Number(e.target.value))} style={inp} />
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={allowSameWinner} onChange={(e) => setAllowSameWinner(e.target.checked)} />
          <span style={lbl}>Boleh orang yang sama menang berkali-kali</span>
        </label>

        <button onClick={saveConfig} style={btn}>Simpan</button>

        <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13, lineHeight: 1.4 }}>
          Auto-spin pakai Vercel Cron (UTC). Untuk presisi per-menit, butuh plan Pro.
        </div>
      </div>
    </div>
  );
}

const inp: any = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.18)",
  color: "white",
  outline: "none",
};

const btn: any = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.18)",
  background: "rgba(255,255,255,.10)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const btnDanger: any = {
  ...btn,
  border: "1px solid rgba(255,80,80,.35)",
  background: "rgba(255,80,80,.12)",
};

const lbl: any = { color: "rgba(255,255,255,.75)", fontSize: 13 };

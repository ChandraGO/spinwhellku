# Spinwheel (Next.js + Supabase + Vercel Cron)

## Fitur
- `/` Wheel + daftar peserta (nama & poin) + panel pemenang
- Wheel idle: berputar pelan terus sebelum jadwal undian
- `/admin` kelola peserta, judul hadiah, jadwal auto-spin (WITA), jumlah spin, dan opsi "boleh pemenang sama" (checkbox)
- Auto-spin via Vercel Cron -> `/api/cron`

## Setup Supabase
1. Buat project Supabase
2. Jalankan SQL di bawah (lihat `supabase/schema.sql`)
3. Ambil `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ENV
Buat `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_PASSWORD=ubah-ini-jadi-kuat
CRON_SECRET=supersecret
```

## Jalankan lokal
```
npm i
npm run dev
```

## Deploy ke Vercel
1. Push repo ke GitHub
2. Import ke Vercel
3. Set env vars di Project Settings
4. Pastikan Cron aktif (butuh plan Pro untuk per-minute; kalau Hobby ubah `vercel.json` jadi 1x/hari)

### Catatan Cron
Vercel Cron timezone UTC. Sistem menyimpan jadwal sebagai UTC (dikonversi dari input WITA di admin).

## Admin
Buka `/admin`, input password (prompt).

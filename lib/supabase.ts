import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // Jangan throw saat build, biar build tetap jalan kalau env belum diset.
  // Tapi runtime API akan balikin error yang jelas.
  console.warn("Supabase env missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url || "http://localhost", key || "public-anon-key");

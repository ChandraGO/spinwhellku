import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("participants")
    .select("id,name,points,created_at")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const name = String(body.name || "").trim();
  const points = Number(body.points ?? 0);

  if (!name) return Response.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("participants")
    .insert({ name, points })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function DELETE(req: Request) {
  if (!requireAdmin(req)) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("participants").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

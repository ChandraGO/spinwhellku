export function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return false;
  const b64 = auth.slice("Basic ".length);
  const decoded = Buffer.from(b64, "base64").toString("utf8");
  const [user, pass] = decoded.split(":");
  return user === "admin" && pass === process.env.ADMIN_PASSWORD;
}

export function requireCron(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  return !!secret && secret === process.env.CRON_SECRET;
}

// src/app/api/blob/delete/route.ts
import { del } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: Request) {
  const { url } = (await req.json()) as { url: string };
  if (!url) return Response.json({ error: "url required" }, { status: 400 });

  await del(url);
  return Response.json({ ok: true });
}

// src/app/api/policies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set() {},
        remove() {},
      },
    }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next.js 15 形式
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

  const supabase = await getSupabase();

  const { data: bill, error: billErr } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single();
  if (billErr) return NextResponse.json({ error: billErr.message }, { status: 404 });

  const { data: comments, error: comErr } = await supabase
    .from("comments")
    .select("*")
    .eq("bill_id", id)
    .order("created_at", { ascending: false });
  if (comErr) return NextResponse.json({ error: comErr.message }, { status: 500 });

  const { data: votes, error: voteErr } = await supabase
    .from("votes")
    .select("value")
    .eq("bill_id", id);
  if (voteErr) return NextResponse.json({ error: voteErr.message }, { status: 500 });

  const up = (votes ?? []).filter(v => v.value === "UP").length;
  const down = (votes ?? []).filter(v => v.value === "DOWN").length;
  const total = up + down || 1;
  const ratio = Math.round((up / total) * 100);

  return NextResponse.json({
    id: bill.id,
    title: bill.title,
    text: bill.text,
    benefit: bill.benefit,
    authorId: bill.author_id,
    createdAt: bill.created_at,
    up,
    down,
    ratio,
    comments: (comments ?? []).map(c => ({
      id: c.id,
      billId: c.bill_id,
      content: c.content,
      createdAt: c.created_at,
      userId: c.user_id,
    })),
  });
}

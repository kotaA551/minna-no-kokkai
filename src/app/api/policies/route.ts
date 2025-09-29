// src/app/api/policies/route.ts
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

// 一覧（= /api/bills GET と同等）
export async function GET() {
  const supabase = await getSupabase();

  const { data: bills, error: billErr } = await supabase
    .from("bills")
    .select("*")
    .order("created_at", { ascending: false });

  if (billErr) {
    return NextResponse.json({ error: billErr.message }, { status: 500 });
  }

  const billIds = (bills ?? []).map(b => b.id);
  const { data: votes, error: voteErr } = await supabase
    .from("votes")
    .select("bill_id, value")
    .in("bill_id", billIds.length ? billIds : ["__none__"]);

  if (voteErr) {
    return NextResponse.json({ error: voteErr.message }, { status: 500 });
  }

  const byBill: Record<string, { up: number; down: number }> = {};
  (votes ?? []).forEach(v => {
    const key = v.bill_id as string;
    if (!byBill[key]) byBill[key] = { up: 0, down: 0 };
    if (v.value === "UP") byBill[key].up++;
    if (v.value === "DOWN") byBill[key].down++;
  });

  const data = (bills ?? []).map(b => {
    const { up = 0, down = 0 } = byBill[b.id] ?? {};
    const total = up + down || 1;
    return {
      id: b.id,
      title: b.title,
      text: b.text,
      benefit: b.benefit,
      authorId: b.author_id,
      createdAt: b.created_at,
      up,
      down,
      ratio: Math.round((up / total) * 100),
    };
  });

  return NextResponse.json({ policies: data }); // ← レスポンスキーを policies に
}

// 作成（= /api/bills POST と同等）
export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? null;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, text, benefit } = (await req.json()) as {
    title?: string; text?: string; benefit?: string;
  };

  if (!title?.trim() || !text?.trim() || !benefit?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bills")
    .insert({
      title: title.trim(),
      text: text.trim(),
      benefit: benefit.trim(),
      author_id: uid,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

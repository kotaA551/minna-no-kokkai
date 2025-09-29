// src/app/api/votes/route.ts
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

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? null;

  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { policyId: billId, value } = (await req.json()) as {
    policyId: string; value: "UP" | "DOWN";
  };

  if (!billId || (value !== "UP" && value !== "DOWN")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // 1ユーザー1票（unique(user_id,bill_id) 前提）
  const { error: upsertErr } = await supabase
    .from("votes")
    .upsert(
      { user_id: uid, bill_id: billId, value },
      { onConflict: "user_id,bill_id" }
    );
  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // 最新集計
  const { data: votes, error: countErr } = await supabase
    .from("votes")
    .select("value")
    .eq("bill_id", billId);
  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  const up = (votes ?? []).filter(v => v.value === "UP").length;
  const down = (votes ?? []).filter(v => v.value === "DOWN").length;

  return NextResponse.json({ up, down });
}

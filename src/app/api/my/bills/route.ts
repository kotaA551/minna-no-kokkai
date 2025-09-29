// src/app/api/my/bills/route.ts
import { NextResponse } from "next/server";
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

export async function GET() {
  const supabase = await getSupabase();

  // 認証チェック
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ bills: [] }, { status: 200 });
  }

  // RPC 実行（Supabase の SQL エディタで事前に作成しておく必要あり）
  const { data, error } = await supabase.rpc("my_bills_summary");

  if (error) {
    console.error("[/api/my/bills] RPC error:", error);
    return NextResponse.json({ bills: [] }, { status: 500 });
  }

  return NextResponse.json({
    bills: (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title,
      agree: row.agree ?? 0,
      disagree: row.disagree ?? 0,
      ratio: row.ratio ?? 0,
    })),
  });
}

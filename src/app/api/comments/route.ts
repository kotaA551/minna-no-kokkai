// src/app/api/comments/route.ts
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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const billId =
    url.searchParams.get("billId") ?? url.searchParams.get("policyId") ?? "";

  if (!billId) {
    return NextResponse.json(
      { error: "billId (or policyId) required" },
      { status: 400 }
    );
  }

   const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("bill_id", billId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // フロント互換のキー名に寄せる
  const mapped = (data ?? []).map(c => ({
    id: c.id,
    billId: c.bill_id,
    content: c.content,
    createdAt: c.created_at,
    userId: c.user_id,
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? null;
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const billId: string = body.billId ?? body.policyId ?? "";
  const content: string = body.content ?? "";

  if (!billId || !content) {
    return NextResponse.json(
      { error: "billId (or policyId) and content required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ bill_id: billId, content, user_id: uid })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    billId: data.bill_id,
    content: data.content,
    createdAt: data.created_at,
    userId: data.user_id,
  });
}

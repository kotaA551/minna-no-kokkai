// /src/app/api/election/vote/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// 既存のサーバ用クライアントがあるならそちらを使ってOK
// import { supabase } from "@/lib/supabase-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ここは「書き換え許可」が必要なためSRK推奨
);

export async function POST(req: Request) {
  try {
    const { kind, value, userId, deviceId } = await req.json() as {
      kind: "district" | "pr";
      value: string;
      userId?: string | null;
      deviceId?: string | null;
    };

    if (!kind || !value) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }

    const base = {
      kind,
      value,
    };

    let upsertData: any = {};
    let onConflict = "";

    if (userId) {
      upsertData = { ...base, user_id: userId };
      onConflict = "user_id,kind";
    } else if (deviceId) {
      upsertData = { ...base, device_id: deviceId };
      onConflict = "device_id,kind";
    } else {
      return NextResponse.json({ error: "no identity" }, { status: 400 });
    }

    const { error } = await supabase
      .from("election_votes")
      .upsert(upsertData, { onConflict })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}

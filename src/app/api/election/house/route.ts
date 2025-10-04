// /src/app/api/election/house/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PARTY_ORDER = [
  "自民党","立憲民主党","公明党","日本維新の会","国民民主党",
  "共産党","れいわ新選組","社民党","その他"
];

export async function GET() {
  // pr（比例代表）のみ集計
  const { data, error } = await supabase
    .from("election_votes")
    .select("value")
    .eq("kind", "pr");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const row of (data ?? [])) {
    const k = row.value || "その他";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const slices = PARTY_ORDER.map(label => ({
    key: label,
    label,
    value: counts.get(label) ?? 0,
    // color はフロントで補完しているので省略OK
  }));

  const total = slices.reduce((s, x) => s + x.value, 0);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    metric: "votes",
    total,
    slices,
  });
}

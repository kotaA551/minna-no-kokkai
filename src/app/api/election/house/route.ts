import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PARTY_COLORS: Record<string, string> = {
  "自民党": "#C9191E",
  "立憲民主党": "#004EA2",
  "公明党": "#F5B400",
  "日本維新の会": "#7DBE2E",
  "国民民主党": "#1D56A5",
  "共産党": "#D6002B",
  "れいわ新選組": "#E64287",
  "社民党": "#00A0DE",
  "その他": "#6B7280",
};

const PARTY_ORDER = [
  "自民党",
  "立憲民主党",
  "日本維新の会",
  "公明党",
  "国民民主党",
  "共産党",
  "れいわ新選組",
  "社民党",
  "その他",
];

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("election_votes")
    .select("kind, value")
    .eq("kind", "pr");

  if (error) {
    console.error("[/api/election/house] error:", error);
    return NextResponse.json(
      { updatedAt: new Date().toISOString(), metric: "votes", total: 0, slices: [] },
      { status: 500 }
    );
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = String(row.value || "").trim() || "その他";
    counts[key] = (counts[key] ?? 0) + 1;
  }

  // 順序固定 + その他合算
  let others = 0;
  for (const k of Object.keys(counts)) {
    if (!PARTY_ORDER.includes(k)) others += counts[k];
  }

  const slices = PARTY_ORDER.map((party) => ({
    key: party,
    label: party,
    value: party === "その他" ? (counts["その他"] ?? 0) + others : (counts[party] ?? 0),
    color: PARTY_COLORS[party] ?? "#6B7280",
  }));

  const total = slices.reduce((s, x) => s + x.value, 0);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    metric: "votes",
    total,
    slices,
  });
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import AddressBar from "@/components/AddressBar";
import { supabase } from "@/lib/supabase-browser";
import ElectionHalfDonut, { Slice } from "@/components/ElectionHalfDonut";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// 表示順と色はAPIにも入れてあるが、クライアント側でも持っておくと安全
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

const parties = [
  "自民党",
  "立憲民主党",
  "公明党",
  "日本維新の会",
  "国民民主党",
  "共産党",
  "れいわ新選組",
  "社民党",
  "その他",
];

export default function ElectionTop() {
  const [districtCandidate, setDistrictCandidate] = useState("");
  const [prParty, setPrParty] = useState("");
  const [saved, setSaved] = useState<{ district?: string; pr?: string } | null>(null);

  // 1) 既存のローカル保存をロード
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mock_vote_lower_house");
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  // 2) 比例代表・模擬投票の集計をSWRで自動更新
  const { data, isLoading, error } = useSWR<{
    updatedAt: string;
    metric: string;
    total: number;
    slices: { key: string; label: string; value: number; color?: string }[];
  }>("/api/election/house", fetcher, { refreshInterval: 5000 });

  // 3) 半円グラフに渡すslices（APIの色を優先し、無ければローカル表で補完）
  const donutSlices: Slice[] = useMemo(() => {
    const raw = data?.slices ?? [];
    // 表示順を parties に合わせる
    const ordered = [...raw].sort(
      (a, b) => parties.indexOf(a.label) - parties.indexOf(b.label)
    );
    return ordered.map((s) => ({
      label: s.label,
      value: s.value,
      color: s.color || PARTY_COLORS[s.label] || "#6B7280",
    }));
  }, [data]);

  const canSubmit = Boolean(districtCandidate.trim() && prParty);

  async function handleConfirm() {
    const payload = { district: districtCandidate.trim(), pr: prParty };
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;

    if (user) {
      if (payload.district) {
        await supabase.from("election_votes")
          .insert({ user_id: user.id, kind: "district", value: payload.district });
      }
      if (payload.pr) {
        await supabase.from("election_votes")
          .insert({ user_id: user.id, kind: "pr", value: payload.pr });
      }
    } else {
      localStorage.setItem("mock_vote_lower_house", JSON.stringify(payload));
    }

    alert("オンライン模擬投票を記録しました（実際の効力はありません）。");
    setSaved(payload);
  }

  return (
    <section className="px-4 pb-20 space-y-6">
      <AddressBar />

      {/* 1) 半円ドーナツ（模擬投票のリアルタイム集計） */}
      <div className="pt-3">
        <ElectionHalfDonut
          title="比例代表 模擬投票 合計"
          unit="票"
          slices={donutSlices}
          height={280}
          showLegend={true}
          cutout="62%"
        />
        <div className="mt-2 text-xs text-gray-500">
          {isLoading && "更新中…"}
          {error && "集計の取得に失敗しました。"}
          {data?.updatedAt && !isLoading && !error && (
            <>最終更新: {new Date(data.updatedAt).toLocaleString()}</>
          )}
        </div>
      </div>

      {/* 2) 投票期間（ダミー表示） */}
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-bold">投票期間</h2>
        <p className="text-sm text-gray-600">
          例）2025年10月01日 00:00 〜 2025年10月14日 23:59（模擬投票）
        </p>
      </div>

      {/* 3) 投票マッチング */}
      <div className="rounded-2xl border bg-white p-4">
        <h3 className="text-base font-semibold mb-2">迷ったら</h3>
        <Link
          href="/election/matching"
          className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2"
        >
          投票マッチングへ
        </Link>
      </div>

      {/* 4) 小選挙区（候補者） */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <h3 className="text-lg font-bold">小選挙区</h3>
        <p className="text-sm text-gray-600">
          あなたの選挙区の候補者名を入力（後で公式候補一覧に置き換えます）
        </p>
        <input
          value={districtCandidate}
          onChange={(e) => setDistrictCandidate(e.target.value)}
          placeholder="例）山田 太郎"
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* 5) 比例代表（政党） */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <h3 className="text-lg font-bold">比例代表</h3>
        <p className="text-sm text-gray-600">支持政党を選択</p>
        <select
          value={prParty}
          onChange={(e) => setPrParty(e.target.value)}
          className="w-full rounded-lg border p-3 bg-white"
        >
          <option value="">選択してください</option>
          {parties.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* 6) 確定ボタン */}
      <div className="sticky bottom-16 left-0 right-0">
        <button
          onClick={handleConfirm}
          disabled={!canSubmit}
          className="w-full rounded-2xl bg-green-600 text-white px-6 py-3 font-semibold disabled:opacity-50"
        >
          投票を確定する
        </button>
        {saved && (
          <p className="mt-2 text-xs text-gray-600">
            記録済み：小選挙区「{saved.district}」・比例代表「{saved.pr}」
          </p>
        )}
      </div>

      {/* 注意書き */}
      <p className="text-xs text-gray-500">
        これは模擬オンライン投票です。実際の選挙結果や公的手続きには一切影響しません。
      </p>
    </section>
  );
}

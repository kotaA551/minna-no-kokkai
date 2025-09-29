// src/app/mypage/page.tsx
"use client";

import useSWR from "swr";
import SupaAuth from "@/components/SupaAuth";
import AddressBar from "@/components/AddressBar";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function MyPage() {
  const { data } = useSWR<{
    bills: { id: string; title: string; agree: number; disagree: number; ratio: number }[];
  }>("/api/my/bills", fetcher, { refreshInterval: 5000 });

  const items = data?.bills ?? [];

  return (
    <section className="p-4 space-y-6 pb-24">
      {/* 認証 */}
      <div className="space-y-3">
        <h1 className="text-2xl font-extrabold">Mypage</h1>
        <SupaAuth />
      </div>

      {/* 住所入力 + 選挙区判定 */}
      <AddressBar />

      {/* あなたの法案の反応 */}
      <div>
        <h2 className="text-lg font-bold text-center mb-3">あなたの法案の反応</h2>
        <ul className="space-y-3">
          {items.map(b => (
            <li key={b.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    賛成 {b.agree} ／ 反対 {b.disagree}（賛成率 {b.ratio}%）
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full rounded bg-gray-200 overflow-hidden">
                <div className="h-full bg-black" style={{ width: `${b.ratio}%` }} />
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-sm text-gray-500 text-center py-6">
              まだ投稿された法案がありません。
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

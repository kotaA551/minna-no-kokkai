"use client";
import useSWR from "swr";
const fetcher = (u:string)=>fetch(u).then(r=>r.json());

export default function MyPage() {
  const { data } = useSWR<{ bills: { id:string; title:string; agree:number; disagree:number; ratio:number }[] }>(
    "/api/my/bills", fetcher, { refreshInterval: 5000 }
  );
  const items = data?.bills ?? [];
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold text-center">あなたの法案の反応</h1>
      <ul className="space-y-3">
        {items.map(b => (
          <li key={b.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{b.title}</h2>
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
      </ul>
    </div>
  );
}

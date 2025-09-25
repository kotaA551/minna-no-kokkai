// src/components/VoteButtons.tsx
"use client";

import { useState } from "react";

type Props = {
  policyId: string;
  up: number;
  down: number;
};

export default function VoteButtons({ policyId, up, down }: Props) {
  const [counts, setCounts] = useState({ up, down });
  const [loading, setLoading] = useState<"UP" | "DOWN" | null>(null);

  async function sendVote(value: "UP" | "DOWN") {
    try {
      setLoading(value);
      // 楽観更新
      setCounts((c) =>
        value === "UP" ? { ...c, up: c.up + 1 } : { ...c, down: c.down + 1 }
      );

      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyId, value }),
      });

      if (!res.ok) throw new Error("vote failed");

      // サーバ集計を信頼して上書き（APIが {up,down} を返す前提）
      const data = (await res.json()) as { up: number; down: number };
      if (typeof data.up === "number" && typeof data.down === "number") {
        setCounts({ up: data.up, down: data.down });
      }
    } catch (e) {
      // 失敗したら楽観更新を巻き戻す
      setCounts({ up, down });
      alert("投票に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-5 w-full justify-center">
      <button
        type="button"
        onClick={() => sendVote("UP")}
        disabled={loading !== null}
        className="rounded-md bg-black text-white p-2 font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        賛成（{counts.up}）
      </button>
      <button
        type="button"
        onClick={() => sendVote("DOWN")}
        disabled={loading !== null}
        className="rounded-md bg-black text-white p-2 font-semibold hover:bg-red-700 disabled:opacity-50"
      >
        反対（{counts.down}）
      </button>
    </div>
  );
}

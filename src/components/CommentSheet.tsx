"use client";

import React, { useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {fetcher} from "@/lib/fetcher";

type Comment = {
  id: string;
  billId: string;
  content: string;
  createdAt: string; // ISO
  userId?: string;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CommentSheet({
  billId,
  triggerLabel = "コメント",
  className = "",
}: {
  billId: string;
  triggerLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error, mutate } = useSWR<Comment[]>(
    open ? `/api/comments?billId=${billId}` : null,
    fetcher
  );
  const [value, setValue] = useState("");
  const [posting, setPosting] = useState(false);

  const comments = useMemo(() => data ?? [], [data]);

  async function submit() {
    const text = value.trim();
    if (!text) return;
    setPosting(true);

    // 楽観的更新
    const tempId = `temp-${Date.now()}`;
    const optimistic = [
      { id: tempId, billId, content: text, createdAt: new Date().toISOString() },
      ...(comments || []),
    ];
    mutate(optimistic, { revalidate: false });

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, content: text }),
      });
      if (!res.ok) throw new Error(await res.text());

      // 最新取得
      await mutate();
      setValue("");
    } catch (e) {
      // 失敗したら元に戻す
      await mutate();
      alert("コメントの投稿に失敗しました。");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className={className}>
      <button
        className="rounded-xl bg-black/80 text-white px-3 py-1 text-sm hover:bg-black"
        onClick={() => setOpen((v) => !v)}
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* 背景 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* シート */}
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">コメント</h3>
              <button
                className="text-2xl leading-none px-2 -mt-1"
                onClick={() => setOpen(false)}
                aria-label="close"
              >
                ×
              </button>
            </div>

            {/* 投稿フォーム */}
            <div className="mb-4">
              <textarea
                className="w-full rounded-lg border p-3 min-h-[80px]"
                placeholder="コメントを書く…"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={posting}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={submit}
                  disabled={posting || !value.trim()}
                  className="rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
                >
                  {posting ? "投稿中…" : "投稿"}
                </button>
              </div>
            </div>

            {/* 一覧 */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {isLoading && <div className="text-sm text-gray-500">読み込み中…</div>}
              {error && <div className="text-sm text-red-600">読み込みに失敗しました。</div>}
              {comments.length === 0 && !isLoading ? (
                <div className="text-sm text-gray-500">まだコメントはありません。</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-lg border p-3">
                    <div className="text-sm whitespace-pre-wrap">{c.content}</div>
                    <div className="text-[11px] text-gray-500 mt-1">{formatTime(c.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import VoteButtons from "@/components/VoteButtons";

type BillItem = {
  id: string;
  title: string;
  text: string;
  benefit: string;
  up: number;
  down: number;
  ratio: number;
  createdAt?: string;
};

type VideoItem = {
  id: string;
  title: string;
  url: string;
  createdAt?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const [tab, setTab] = useState<"ALL" | "VIDEO" | "BILL">("ALL");

  const { data: billData } = useSWR<{ bills: BillItem[] }>(
    tab !== "VIDEO" ? "/api/bills" : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: videoData } = useSWR<VideoItem[]>(
    tab !== "BILL" ? "/api/videos" : null,
    fetcher
  );

  const bills = billData?.bills ?? [];
  const videos = videoData ?? [];

  // 📌 新着順に統合
  const allItems = useMemo(() => {
    const merged = [
      ...videos.map((v) => ({
        type: "video" as const,
        id: v.id,
        title: v.title,
        url: v.url,
        createdAt: v.createdAt ?? v.id, // ファイル名で代用
      })),
      ...bills.map((b) => ({
        type: "bill" as const,
        id: b.id,
        title: b.title,
        text: b.text,
        benefit: b.benefit,
        up: b.up,
        down: b.down,
        ratio: b.ratio,
        createdAt: b.createdAt ?? b.id,
      })),
    ];
    // 新着順（createdAtが新しい順）
    return merged.sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
  }, [videos, bills]);

  // タブごとの表示リスト
  const itemsToShow =
    tab === "ALL"
      ? allItems
      : tab === "VIDEO"
      ? allItems.filter((i) => i.type === "video")
      : allItems.filter((i) => i.type === "bill");

  return (
    <div className="min-h-[100dvh]">
      {/* 🔽 タブ */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-screen-sm mx-auto flex">
          {(["ALL", "VIDEO", "BILL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-1/3 py-3 text-sm font-semibold border-b-2 ${
                tab === t ? "border-black" : "border-transparent text-gray-500"
              }`}
            >
              {t === "ALL" ? "All" : t === "VIDEO" ? "Video" : "Bill"}
            </button>
          ))}
        </div>
      </div>

      {/* 🔽 縦スワイプ表示 */}
      <section className="h-[calc(100dvh-48px-64px)] overflow-y-auto snap-y snap-mandatory">
        {itemsToShow.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p>まだ投稿がありません。</p>
          </div>
        )}

        {itemsToShow.map((item) => (
          <article
            key={item.id}
            className="snap-start w-full h-[calc(100dvh-48px-64px)] flex items-center justify-center bg-white"
          >
            {item.type === "video" ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col p-5 overflow-y-auto">
                <h2 className="text-xl text-center font-bold mb-4">
                  法案名：{item.title}
                </h2>
                <section className="pb-4 border-b">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {item.text}
                  </p>
                </section>
                <section className="py-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    メリット
                  </h3>
                  {item.benefit ? (
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                      {item.benefit
                        .split(/\r?\n/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <li key={i}>{line.replace(/^・\s*/, "")}</li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">（未記入）</p>
                  )}
                </section>
                <div className="mt-auto pt-4">
                  <VoteButtons
                    policyId={item.id}
                    up={item.up ?? 0}
                    down={item.down ?? 0}
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

// src/app/election/matching/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PartyKey =
  | "自民党"
  | "立憲民主党"
  | "公明党"
  | "日本維新の会"
  | "国民民主党"
  | "共産党"
  | "れいわ新選組"
  | "社民党";

type Answer = -2 | -1 | 0 | 1 | 2;

const SCALE: { label: string; value: Answer }[] = [
  { label: "強く反対", value: -2 },
  { label: "やや反対", value: -1 },
  { label: "どちらでもない", value: 0 },
  { label: "やや賛成", value: 1 },
  { label: "強く賛成", value: 2 },
];

const QUESTIONS = [
  "消費税の引き下げを優先すべきだ。",
  "防衛費の増額に賛成だ。",
  "原発の再稼働を進めるべきだ。",
  "ベーシックインカムを導入すべきだ。",
  "同性婚を法制化すべきだ。",
  "入管・移民の受け入れを拡大すべきだ。",
  "教育無償化（大学含む）を進めるべきだ。",
  "積極的な政府支出（財政出動）に賛成だ。",
  "企業への規制緩和を進めるべきだ。",
  "労働者保護（解雇規制など）を強化すべきだ。",
  "環境税・炭素税の導入/強化に賛成だ。",
  "公共交通や子育て支援などの社会インフラへ投資を増やすべきだ。",
  "憲法9条を含む改憲を進めるべきだ。",
  "富裕層や大企業への課税を強化すべきだ。",
  "消費者保護のために独占禁止法を強化すべきだ。",
  "最低賃金を大幅に引き上げるべきだ。",
  "カーボンニュートラル（2050年目標）を重視すべきだ。",
  "防衛装備の輸出を拡大すべきだ。",
  "緊急事態条項を憲法に明記すべきだ。",
  "地方分権（自治体への権限移譲）を進めるべきだ。",
];

const PARTY_PROFILES: Record<PartyKey, Answer[]> = {
  自民党: [
     0,  2,  1, -2, -2, -1,  0, -1,  1, -1,
     0,  0,  2, -1, -1, -1,  0,  2,  2,  1
  ],
  立憲民主党: [
     1, -1, -2,  1,  2,  1,  2,  2, -1,  2,
     2,  2, -2,  2,  2,  2,  2, -2, -2,  1
  ],
  公明党: [
     0,  1,  0,  0,  1,  0,  1,  1,  0,  1,
     1,  1,  0,  1,  1,  1,  1,  0,  1,  1
  ],
  日本維新の会: [
     1,  1,  0,  1,  0,  1,  1,  0,  2, -1,
     0,  1,  1,  0,  1,  0,  0,  1,  2,  2
  ],
  国民民主党: [
     1,  1,  0,  0,  1,  0,  1,  1,  1,  0,
     1,  1,  0,  0,  1,  1,  1,  0,  1,  2
  ],
  共産党: [
     2, -2, -2,  2,  2,  2,  2,  2, -2,  2,
     2,  2, -2,  2,  2,  2,  2, -2, -2,  1
  ],
  れいわ新選組: [
     2, -2, -2,  2,  2,  2,  2,  2, -1,  2,
     2,  2, -2,  2,  2,  2,  2, -2, -2,  2
  ],
  社民党: [
     2, -2, -2,  2,  2,  1,  2,  2, -2,  2,
     2,  2, -2,  2,  2,  2,  2, -2, -2,  2
  ],
};


// 一致度 = 各問で「2 - |diff|」点（0〜2点）を合計 → % 化
function calcMatchPercent(user: Answer[], party: Answer[]) {
  const perQ = user.map((u, i) => 2 - Math.abs(u - party[i]));
  const total = perQ.reduce((a, b) => a + b, 0);
  const max = QUESTIONS.length * 2;
  return Math.round((total / max) * 100);
}

export default function MatchingPage() {
  const [answers, setAnswers] = useState<(Answer | null)[]>(
    Array(QUESTIONS.length).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);

  // ロード時に前回回答を復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem("election_matching_answers_v1");
      if (raw) {
        const arr = JSON.parse(raw) as (Answer | null)[];
        if (Array.isArray(arr) && arr.length === QUESTIONS.length) {
          setAnswers(arr);
        }
      }
    } catch {}
  }, []);

  const allAnswered = useMemo(
    () => answers.every((a) => a !== null),
    [answers],
  );

  const results = useMemo(() => {
    if (!allAnswered) return [];
    const user = answers as Answer[];
    const rows = Object.entries(PARTY_PROFILES).map(([name, vec]) => ({
      party: name as PartyKey,
      percent: calcMatchPercent(user, vec),
    }));
    // 降順
    return rows.sort((a, b) => b.percent - a.percent);
  }, [answers, allAnswered]);

  function handleSubmit() {
    if (!allAnswered) return;
    localStorage.setItem(
      "election_matching_answers_v1",
      JSON.stringify(answers),
    );
    setSubmitted(true);
  }

  return (
    <section className="px-4 pb-24 space-y-8">
      <header className="pt-4">
        <h1 className="text-2xl font-extrabold">投票マッチング（衆院・仮版）</h1>
        <p className="text-sm text-gray-600 mt-1">
          14問に答えると、各政党との一致度を表示します（データはデモ用・後日更新）。
        </p>
      </header>

      {/* 質問 */}
      <ol className="space-y-6">
        {QUESTIONS.map((q, i) => (
          <li key={i} className="rounded-2xl border bg-white p-4">
            <p className="font-semibold mb-3">
              {i + 1}. {q}
            </p>
            <div className="grid grid-cols-5 gap-2 text-xs sm:text-sm">
              {SCALE.map((s) => {
                const id = `q${i}-${s.value}`;
                const checked = answers[i] === s.value;
                return (
                  <label
                    key={s.value}
                    htmlFor={id}
                    className={`flex items-center justify-center rounded-lg border px-2 py-2 cursor-pointer ${
                      checked ? "bg-black text-white border-black" : "bg-white"
                    }`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={`q${i}`}
                      value={s.value}
                      className="sr-only"
                      onChange={() => {
                        const next = [...answers];
                        next[i] = s.value;
                        setAnswers(next);
                      }}
                    />
                    {s.label}
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      {/* 送信ボタン */}
      <div className="sticky bottom-16">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full rounded-2xl bg-black text-white px-6 py-3 font-semibold disabled:opacity-50"
        >
          一致度を計算する
        </button>
        {!allAnswered && (
          <p className="mt-2 text-xs text-gray-500">全ての設問に回答してください。</p>
        )}
      </div>

      {/* 結果 */}
      {submitted && results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">結果（一致度ランキング）</h2>
          <ul className="space-y-2">
            {results.map((r, idx) => (
              <li
                key={r.party}
                className="rounded-xl border bg-white p-3 flex items-center gap-3"
              >
                <span className="w-6 text-right font-bold">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{r.party}</span>
                    <span>{r.percent}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500">
            ※ このマッチングはデモ版です。実際の公約・投票行動を保証するものではありません。
          </p>

          <div className="pt-2">
            <Link
              href="/election"
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2"
            >
              選挙トップへ戻る
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

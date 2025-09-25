// src/components/UploadForm.tsx
"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function useAutosizeTextArea(value: string) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return ref;
}

export default function UploadForm({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [benefit, setBenefit] = useState("");
  const [loading, setLoading] = useState(false);

  const bodyRef = useAutosizeTextArea(text);
  const benefitRef = useAutosizeTextArea(benefit);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !text.trim() || !benefit.trim()) {
      alert("タイトル・本文・便益は必須です。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          text: text.trim(),
          benefit: benefit.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { id: string };

      router.push("/");

      setTitle("");
      setText("");
      setBenefit("");
    } catch {
      alert("投稿に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className={`grid gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-semibold mb-1">タイトル</label>
        <input
          className="w-full rounded-lg border p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：AIの健全利用基本法"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">本文</label>
        <textarea
          ref={bodyRef}
          className="w-full rounded-lg border p-3 resize-none overflow-hidden leading-7"
          value={text}
          onChange={(e) => setText(e.target.value)}
placeholder={`◆ 目的  
AI（人工知能）が生活や仕事にどんどん使われていく中で、国民が安心して恩恵を受けられる社会をつくるためのルールを定める。
◆ 基本的な考え方  
・AIは人を助け、生活を豊かにするために使う  
・人権やプライバシーを侵さないようにする  
・誰にとっても公平に利用できるようにする  
・仕組みや判断が不透明にならないように、できるだけ説明責任を果たす  
・悪用や事故が起きたときの対策をきちんと整える  
◆ 国や自治体がやること  
1. 安全性・信頼性を確認する仕組みをつくる  
2. 学校や社会でAIリテラシー教育を広げる  
3. 研究や開発を支援し、産業を育てる  
4. AIの利用ルールを国際的に協力してつくる  
5. 万一のトラブルや被害に対応できる救済制度を整備する  
◆ 国民が安心して暮らせる未来へ  
AIを「怖いもの」ではなく「頼れる相棒」として活用できる社会を目指す`}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          便益（期待される効果）
        </label>
        <textarea
          ref={benefitRef}
          className="w-full rounded-lg border p-3 resize-none overflow-hidden leading-7"
          value={benefit}
          onChange={(e) => setBenefit(e.target.value)}
          placeholder={`・安心してAIサービスを使えるようになる  
・プライバシーや個人情報が守られる  
・AIによる不公平な扱いや差別を防げる  
・子どもから高齢者までAIの知識を身につけられる  
・新しい産業や仕事が生まれる  
・災害や医療など命に関わる場面でAIが助けになる  
・国際的にも信頼されるAI利用のルールを整えられる
`}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 text-white px-5 py-2 disabled:opacity-50"
        >
          {loading ? "送信中…" : "投稿する"}
        </button>
      </div>
    </form>
  );
}

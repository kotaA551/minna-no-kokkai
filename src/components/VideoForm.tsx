"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoForm({ className = "" }: { className?: string }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !file) {
      alert("タイトルと動画ファイルは必須です。");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("desc", desc.trim());
      formData.append("file", file);

      const res = await fetch("/api/videos", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();
      alert("投稿が完了しました！");

      // 🎯 トップページへ移動
      router.push("/");

      // リセット
      setTitle("");
      setFile(null);
      setDesc("");
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
          placeholder="例：若者の政治参加を呼びかける動画"
        />
      </div>

      <div className="grid gap-2">
        <label className="block text-sm font-semibold">動画ファイル</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full rounded-lg border p-3"
        />
        {file && <p className="text-sm mt-1">選択中: {file.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">説明文</label>
        <textarea
          className="w-full rounded-lg border p-3 min-h-[120px]"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="動画の説明や背景…"
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

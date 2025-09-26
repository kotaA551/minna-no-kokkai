// src/components/VideoForm.tsx
"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { postJson } from "@/lib/fetcher"; // DBへ記録したい人だけ使う

export default function VideoForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }
    setLoading(true);

    try {
      const { url, pathname /*, downloadUrl, contentType, size */ } = await upload(
        file.name,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          // アップロード進捗（任意）
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
          // DBにメタ入れたい場合、クライアント→サーバへ渡すペイロード
          clientPayload: JSON.stringify({ title }),
        }
      );

      setUrl(url);

      // （任意）自前DBへ記録したい場合
      // await postJson<{ id: string }>("/api/videos", { title, url });

      setTitle("");
      setFile(null);
      setProgress(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">タイトル</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="動画タイトル（任意）"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">動画ファイル</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {progress !== null && (
        <div className="text-sm">アップロード中… {progress}%</div>
      )}

      <button
        type="submit"
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={loading || !file}
      >
        {loading ? "アップロード中…" : "アップロード"}
      </button>

      {url && (
        <p className="text-sm">
          完了！URL:{" "}
          <a className="underline" href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        </p>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}

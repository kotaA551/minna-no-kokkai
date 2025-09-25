"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import VideoForm from "@/components/VideoForm";

export default function PostPage() {
  const [tab, setTab] = useState<"bill" | "video">("bill");

  return (
    <section className="p-4">

      {/* タブ */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setTab("bill")}
          className={`flex-1 py-2 text-center ${
            tab === "bill" ? "border-b-2 border-green-600 font-bold" : "text-gray-500"
          }`}
        >
          法案
        </button>
        <button
          onClick={() => setTab("video")}
          className={`flex-1 py-2 text-center ${
            tab === "video" ? "border-b-2 border-green-600 font-bold" : "text-gray-500"
          }`}
        >
          動画
        </button>
      </div>

      {tab === "bill" ? <UploadForm /> : <VideoForm />}
    </section>
  );
}

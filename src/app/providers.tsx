// 例: src/app/providers.tsx
"use client";

import { ReactNode } from "react";
// import { SessionProvider } from "next-auth/react"; // ← 使わないならコメントアウトでもOK

export default function Providers({ children }: { children: ReactNode }) {
  const enableAuth = process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";

  if (!enableAuth) {
    // 認証オフ時はそのまま返す
    return <>{children}</>;
  }

  // 認証オンに戻すときだけ SessionProvider を有効化
  // return <SessionProvider>{children}</SessionProvider>;
  return <>{children}</>;
}

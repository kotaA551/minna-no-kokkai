// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "みんなの国会",
  description: "１億人の直接民主制を実現するSNS",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">
        <main className="pb-16 mx-auto max-w-screen-sm">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

// src/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "HOME", icon: "/home.svg" },
    { href: "/post", label: "POST", icon: "/upload.svg" },
    { href: "/election", label: "ELECTIONS", icon: "/elections.svg" }, 
    { href: "/mypage", label: "Mypage", icon: "/mypage.svg" },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <ul className="mx-auto max-w-screen-sm grid grid-cols-4">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center py-2 text-xs ${
                  active ? "text-black font-semibold" : "text-gray-500"
                }`}
              >
                <img src={icon} alt="" className="w-6 h-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

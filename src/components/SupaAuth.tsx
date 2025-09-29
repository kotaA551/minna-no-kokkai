// src/components/SupaAuth.tsx
"use client";
import { supabase } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

export default function SupaAuth() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (!user) {
    return (
      <div className="flex gap-2">
        <button
          className="rounded-lg border px-3 py-2 text-sm"
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options:{ redirectTo: location.href } })}
        >Googleでログイン</button>
        <button
          className="rounded-lg border px-3 py-2 text-sm"
          onClick={() => supabase.auth.signInWithOAuth({ provider: "apple", options:{ redirectTo: location.href } })}
        >Appleでログイン</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{user.user_metadata?.name ?? user.email}</span>
      <button
        className="rounded-lg border px-3 py-2 text-sm"
        onClick={() => supabase.auth.signOut()}
      >ログアウト</button>
    </div>
  );
}

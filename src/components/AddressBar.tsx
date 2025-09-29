// src/components/AddressBar.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { resolveLowerHouseDistrict } from "@/lib/districtResolver";

const PREFS = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県",
"埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県",
"岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
"鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県",
"福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];

type Value = { prefecture: string; city: string };
const LS_KEY = "user_address_v1";

export default function AddressBar() {
  const [uid, setUid] = useState<string | null>(null);
  const [val, setVal] = useState<Value>({ prefecture: "", city: "" });
  const [loading, setLoading] = useState(true);

  // 認証と初期ロード
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user ?? null;
      if (!mounted) return;

      setUid(user?.id ?? null);

      if (user) {
        const { data: row } = await supabase
          .from("addresses")
          .select("*").single();
        if (row) {
          setVal({ prefecture: row.prefecture, city: row.city });
          setLoading(false);
          return;
        }
      }
      // 未ログイン or DB未登録 → localStorage読み込み
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setVal(JSON.parse(raw));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUid(session?.user?.id ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function save(next: Value) {
    setVal(next);
    if (uid) {
      await supabase.from("addresses")
        .upsert({ user_id: uid, prefecture: next.prefecture, city: next.city })
        .select().single();
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
  }

  const district = useMemo(() => {
    if (!val.prefecture || !val.city) return "";
    return resolveLowerHouseDistrict(val.prefecture, val.city) ?? "";
  }, [val]);

  return (
    <div className="rounded-2xl border bg-white p-4 mt-8 space-y-2">
      <div className="flex gap-2">
        <select
          value={val.prefecture}
          onChange={(e) => save({ ...val, prefecture: e.target.value })}
          className="flex-1 rounded-lg border p-2 bg-white"
          disabled={loading}
        >
          <option value="">都道府県</option>
          {PREFS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          value={val.city}
          onChange={(e) => save({ ...val, city: e.target.value })}
          placeholder="市区町村（例：千代田区 / 柏市）"
          className="flex-1 rounded-lg border p-2"
          disabled={loading}
        />
      </div>
      <p className="text-sm text-gray-600">
        お住いの地域：{val.prefecture || "—"} {val.city || ""}
        {district && <span> / 推定小選挙区：{district}</span>}
      </p>
    </div>
  );
}

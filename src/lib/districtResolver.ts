// src/lib/districtResolver.ts
type Dict = Record<string, Array<{ match: RegExp; district: string }>>;

const DICT: Dict = {
  "東京都": [
    { match: /千代田区/, district: "東京1区" },
    { match: /中央区/, district: "東京1区" },
    { match: /港区/, district: "東京1区" },
    { match: /新宿区/, district: "東京10区" },
    { match: /渋谷区/, district: "東京7区" },
  ],
  "大阪府": [{ match:/大阪市北区|大阪市福島区|大阪市此花区/, district:"大阪1区"}],
  "千葉県": [{ match:/柏市/, district:"千葉8区"}],
};

export function resolveLowerHouseDistrict(prefecture: string, city: string) {
  const rows = DICT[prefecture];
  if (!rows) return null;
  for (const r of rows) if (r.match.test(city)) return r.district;
  return null;
}

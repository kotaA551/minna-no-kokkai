// src/lib/fetcher.ts
type MutationArg<T> = { arg: T };

export async function postJson<TReq, TRes>(
  url: string,
  { arg }: MutationArg<TReq>
): Promise<TRes> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as TRes;
}

export async function getJson<TRes>(url: string): Promise<TRes> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as TRes;
}

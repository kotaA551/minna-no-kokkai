// src/lib/fetcher.ts
export async function fetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function postJson<Arg = any, Res = any>(
  url: string,
  { arg }: { arg: Arg }
): Promise<Res> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Res;
}

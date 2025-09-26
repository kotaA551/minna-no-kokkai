// src/lib/fetcher.ts

export class ApiError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

function isJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json");
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T; // No Content
    if (isJsonResponse(res)) return (await res.json()) as T;
    // JSON以外はテキストとして返す（Tがstring想定のときに有用）
    return (await res.text()) as unknown as T;
  }

  // エラー時は可能ならJSONを読んで情報を付与
  let info: unknown = undefined;
  try {
    info = isJsonResponse(res) ? await res.json() : await res.text();
  } catch {
    /* ignore */
  }
  throw new ApiError(
    `HTTP ${res.status} ${res.statusText}`,
    res.status,
    info
  );
}

type JsonInit = Omit<RequestInit, "body" | "headers" | "method"> & {
  headers?: Record<string, string>;
};

export async function getJson<T>(url: string, init?: JsonInit): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      // GETは特に不要だがプロキシ環境などで明示が安全な場合がある
      Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
    },
  });
  return handleResponse<T>(res);
}

export async function postJson<T, B = unknown>(
  url: string,
  body: B,
  init?: JsonInit
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function putJson<T, B = unknown>(
  url: string,
  body: B,
  init?: JsonInit
): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function patchJson<T, B = unknown>(
  url: string,
  body: B,
  init?: JsonInit
): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function deleteJson<T>(
  url: string,
  init?: JsonInit
): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return handleResponse<T>(res);
}

// ファイルアップロード等に使う（Content-Typeは自動でmultipart/form-dataになる）
export async function postForm<T>(
  url: string,
  form: FormData,
  init?: Omit<RequestInit, "body" | "method">
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    body: form,
    ...init,
  });
  return handleResponse<T>(res);
}

// --- SWR用 fetcher -----------------------------------------------------------
// useSWR<T>(key, fetcher) と組み合わせる想定。
// 例: const { data } = useSWR<Comment[]>(url, fetcher);
export const fetcher = <T>(url: string) => getJson<T>(url);

// --- 便利関数：クエリ文字列の組み立て ---------------------------------------
export function withQuery(
  base: string,
  params: Record<string, string | number | boolean | null | undefined>
) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

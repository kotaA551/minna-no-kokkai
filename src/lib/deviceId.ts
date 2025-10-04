// /src/lib/deviceId.ts
export function getDeviceId(): string {
  const KEY = "mnk_device_id_v1";
  try {
    const exist = localStorage.getItem(KEY);
    if (exist) return exist;
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const id = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    // SSRやCookie制限などの保険
    return "unknown-" + Math.random().toString(36).slice(2);
  }
}

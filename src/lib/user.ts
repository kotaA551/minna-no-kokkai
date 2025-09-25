import { cookies } from "next/headers"
import { nanoid } from "nanoid" // そのままでOK

export async function ensureUserId() {
  const jar = await cookies();                         // ★ await
  let uid = jar.get("uid")?.value
  if (!uid) {
    uid = nanoid()
    jar.set("uid", uid, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60*60*24*365*5 })
  }
  return uid
}

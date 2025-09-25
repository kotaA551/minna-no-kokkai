// src/app/api/votes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserId } from "@/lib/user";

export async function POST(req: NextRequest) {
  // ここを await にする
  const uid = await ensureUserId(); // <- Promise<string> -> string

  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { policyId: billId, value } = (await req.json()) as {
    policyId: string;
    value: "UP" | "DOWN";
  };

  if (!billId || (value !== "UP" && value !== "DOWN")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // 既存があれば更新、無ければ作成（1ユーザー1票を維持）
  await prisma.vote.upsert({
    where: { userId_billId: { userId: uid, billId } },
    update: { value },
    create: { userId: uid, billId, value },
  });

  // 最新集計返す
  const counts = await prisma.vote.groupBy({
    by: ["value"],
    where: { billId },
    _count: { _all: true },
  });
  const up = counts.find(c => c.value === "UP")?._count._all ?? 0;
  const down = counts.find(c => c.value === "DOWN")?._count._all ?? 0;

  return NextResponse.json({ up, down });
}

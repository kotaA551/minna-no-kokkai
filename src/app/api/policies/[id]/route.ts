// src/app/api/policies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next.js 15 形式
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

  // Bill 本体（votes は Bill 側にリレーションがある想定。無ければ消す）
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: { votes: true },
  });
  if (!bill) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // コメントは Comment モデルから取得（billId でひも付く）
  const comments = await prisma.comment.findMany({
    where: { billId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ...bill, comments });
}

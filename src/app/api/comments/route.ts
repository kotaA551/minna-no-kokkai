import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserId } from "@/lib/user";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // 互換: policyId でも billId でも受ける
  const billId = (url.searchParams.get("billId") ?? url.searchParams.get("policyId")) || "";

  if (!billId) {
    return NextResponse.json({ error: "billId (or policyId) required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { billId },                       // ← schema に合わせる
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // 互換: body.billId / body.policyId どちらでもOKに
  const billId: string = body.billId ?? body.policyId ?? "";
  const content: string = body.content ?? "";

  if (!billId || !content) {
    return NextResponse.json({ error: "billId (or policyId) and content required" }, { status: 400 });
  }

  const userId = await ensureUserId();       // 認証している想定
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comment = await prisma.comment.create({
    data: { billId, content, userId },       // ← billId に統一
  });

  return NextResponse.json(comment);
}

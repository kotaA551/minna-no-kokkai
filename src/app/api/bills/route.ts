// src/app/api/bills/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserId } from "@/lib/user";
import { Bill, Vote } from "@prisma/client";

export async function GET() {
  const bills = await prisma.bill.findMany({
    orderBy: { createdAt: "desc" },
    include: { votes: true },
  });

  const data = bills.map((b: Bill & { votes: Vote[] }) => {
    const up = b.votes.filter((v) => v.value === "UP").length;
    const down = b.votes.filter((v) => v.value === "DOWN").length;
    const total = up + down || 1;
    return { ...b, up, down, ratio: Math.round((up / total) * 100) };
  });

  return NextResponse.json({ bills: data });
}

export async function POST(req: NextRequest) {
  const uid = await ensureUserId(); // ★ await 必須
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, text, benefit } = (await req.json()) as {
    title?: string;
    text?: string;
    benefit?: string;
  };

  if (!title?.trim() || !text?.trim() || !benefit?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const created = await prisma.bill.create({
    data: {
      title: title.trim(),
      text: text.trim(),
      benefit: benefit.trim(),
      authorId: uid, // ★ string を渡す
    },
    select: { id: true },
  });

  return NextResponse.json({ id: created.id });
}

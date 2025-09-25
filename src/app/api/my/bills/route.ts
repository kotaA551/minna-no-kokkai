// src/app/api/my/bills/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserId } from "@/lib/user";

export async function GET() {
  const uid = await ensureUserId(); // ★ ここを await
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bills = await prisma.bill.findMany({
    where: { authorId: uid },
    orderBy: { createdAt: "desc" },
    include: { votes: true },
  });

  const data = bills.map(b => {
    const up = b.votes.filter(v => v.value === "UP").length;
    const down = b.votes.filter(v => v.value === "DOWN").length;
    const total = up + down || 1;
    const ratio = Math.round((up / total) * 100);
    return { id: b.id, title: b.title, agree: up, disagree: down, ratio };
  });

  return NextResponse.json({ bills: data });
}

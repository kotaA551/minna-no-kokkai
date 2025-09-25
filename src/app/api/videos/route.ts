import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const desc = formData.get("desc") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return NextResponse.json({ error: "タイトルと動画は必須です" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
      id: fileName,
      title,
      desc,
      url: `/uploads/videos/${fileName}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "アップロード失敗" }, { status: 500 });
  }
}

// 🎥 GET: アップロード済み動画の一覧を返す
export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });

    const files = await readdir(uploadDir);

    const videos = files.map((file) => ({
      id: file,
      title: file, // 今はファイル名を仮タイトルに
      url: `/uploads/videos/${file}`,
    }));

    return NextResponse.json(videos);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "読み込み失敗" }, { status: 500 });
  }
}

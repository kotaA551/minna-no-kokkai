import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "edge";

export async function POST(request: Request) {
  // ← これを追加（型は HandleUploadBody）
  const body = (await request.json()) as HandleUploadBody;

  return handleUpload({
    request,
    body, // ← これが必須
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/ogg",
      ],
      maximumSizeInBytes: 1024 * 1024 * 500, // 500MB
      // allowedOrigins: ["https://あなたの本番ドメイン"] // 必要なら制限
    }),
    // onUploadCompleted: async ({ blob, tokenPayload }) => { ... } // 任意
  });
}

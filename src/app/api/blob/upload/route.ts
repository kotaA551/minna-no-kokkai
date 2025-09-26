import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  const result = await handleUpload({
    request,
    body,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/ogg",
      ],
      maximumSizeInBytes: 1024 * 1024 * 500, // 500MB
    }),
    // onUploadCompleted: async ({ blob, tokenPayload }) => { ... } // 任意
  });

  // ← Route Handler は Response を返す必要がある
  return Response.json(result);
}

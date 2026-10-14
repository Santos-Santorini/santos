import { NextResponse } from "next/server";
import { fetchTrustedImage } from "@/lib/security/remoteImage";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url")?.trim() || "";
  try {
    const { bytes, contentType } = await fetchTrustedImage(raw);
    return new NextResponse(new Uint8Array(bytes), { headers: { "content-type": contentType, "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" } });
  } catch { return NextResponse.json({ error: "Invalid image" }, { status: 400 }); }
}

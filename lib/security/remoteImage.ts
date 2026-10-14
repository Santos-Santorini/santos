const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function isTrustedImageUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return false;
    const configured = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const hosts = new Set(["jmnuuekizaljlqdeupqr.supabase.co", "assets.santos.rs", "santos.rs", "customsuits.adspire.rs"]);
    if (configured) hosts.add(new URL(configured).hostname);
    return hosts.has(url.hostname) && !url.pathname.split("/").some(segment => /^(\.\.|\.)$/.test(segment));
  } catch { return false; }
}

export async function fetchTrustedImage(value: string) {
  if (!isTrustedImageUrl(value)) throw new Error("Invalid image URL");
  const response = await fetch(value, { redirect: "error", signal: AbortSignal.timeout(10_000), cache: "no-store" });
  const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!response.ok || !IMAGE_TYPES.has(contentType) || Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES || !response.body) throw new Error("Invalid image response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      size += chunk.byteLength;
      if (size > MAX_IMAGE_BYTES) throw new Error("Image too large");
      chunks.push(chunk);
    }
  } catch (error) {
    await reader.cancel();
    throw error;
  } finally { reader.releaseLock(); }
  return { bytes: Buffer.concat(chunks), contentType };
}

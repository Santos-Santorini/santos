import type { NextRequest } from "next/server";

/** Cookie-authenticated mutations must originate from this application. */
export function isTrustedMutation(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") === "same-origin";
  return origin === req.nextUrl.origin;
}

import { isTrustedMutation } from "@/lib/security/requestOrigin";
import type { NextRequest } from "next/server";
import { getAdminViewerFromRequest, hasAdminPermission } from "@/lib/security/adminSession";
import type { AdminPermission } from "@/lib/adminRoles";

export const isAdminProtectionEnabled = true;

export async function hasAdminToken(req: NextRequest, permission: AdminPermission = "*") {
  if (!isTrustedMutation(req)) return false;
  const viewer = await getAdminViewerFromRequest(req);
  return hasAdminPermission(viewer, permission);
}

export function hasCronSecret(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}` || req.headers.get("x-cron-secret") === secret;
}

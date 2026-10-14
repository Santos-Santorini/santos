import type { NextRequest } from "next/server";
import { getAdminViewerFromCookieStore as readSession, hasAdminPermission } from "@/lib/adminAuth";
import { getAdminUserByUsername, getAdminUserAuthVersion } from "@/lib/adminUsers";
import { getAdminPermissionsForRoles } from "@/lib/adminRoles";
import { isEmailAllowedForGoogleAdmin, isGoogleAdminSignInConfigured } from "@/lib/adminGoogleOAuth";

export { hasAdminPermission };
export async function getAdminViewerFromCookieStore(store: Parameters<typeof readSession>[0]) {
  const viewer = await readSession(store);
  if (!viewer) return null;
  if (viewer.id.startsWith("google_")) {
    // New sessions preserve the email verbatim; old Google sessions must sign in again.
    if (!isGoogleAdminSignInConfigured() || !isEmailAllowedForGoogleAdmin(viewer.username)) return null;
    return { ...viewer, roleIds: ["owner"] as ["owner"], permissions: ["*"] as ["*"] };
  }
  try {
    const user = await getAdminUserByUsername(viewer.username);
    if (!user || !user.isActive || user.id !== viewer.id || !viewer.authVersion || viewer.authVersion !== getAdminUserAuthVersion(user)) return null;
    return { ...viewer, roleIds: user.roleIds, permissions: getAdminPermissionsForRoles(user.roleIds) };
  } catch { return null; }
}
export const getAdminViewerFromRequest = (req: NextRequest) => getAdminViewerFromCookieStore(req.cookies);

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAdminViewerFromCookieStore, hasAdminPermission } from "@/lib/security/adminSession";
import type { AdminPermission } from "@/lib/adminRoles";

export async function requireAdminPage(permission: AdminPermission) {
  const viewer = await getAdminViewerFromCookieStore(await cookies());
  if (!viewer) redirect("/admin-login");
  if (!hasAdminPermission(viewer, permission)) notFound();
  return viewer;
}

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { scryptSync } from "crypto";
const storage = vi.hoisted(() => ({ users: [] as any[] }));
vi.mock("@/lib/storage/persistentJson", () => ({
  readPersistentJsonFile: vi.fn(async () => ({ version: 1, users: storage.users })),
  writePersistentJsonFile: vi.fn(async (_path, data) => { storage.users = data.users; }),
}));
import { authenticateAdminUser, listAdminUsers, updateAdminUser } from "@/lib/adminUsers";
import { buildAdminSessionValue } from "@/lib/adminAuth";
import { getAdminViewerFromRequest } from "@/lib/security/adminSession";
import { hasAdminToken, hasCronSecret } from "@/lib/auth/admin";
import { getAdminGoogleAllowlist } from "@/lib/adminGoogleOAuth";

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", "test-signing-secret");
  vi.stubEnv("ADMIN_PASSWORD", "owner-password");
  vi.stubEnv("ADMIN_ACCESS_TOKEN", "legacy-owner-token");
  vi.stubEnv("ADMIN_GOOGLE_ALLOWED_EMAILS", "");
  vi.stubEnv("CRON_SECRET", "");
  storage.users = [{ id: "owner", username: "owner", displayName: "Owner", roleIds: ["owner"], isActive: true,
    passwordHash: `scrypt:salt:${scryptSync("owner-password", "salt", 64).toString("hex")}`, createdAt: "2026-01-01", updatedAt: "2026-01-01" }];
});
const request = (cookie?: string) => new NextRequest("https://example.com/api/orders", { headers: cookie ? { cookie: `admin_session=${cookie}` } : {} });

describe("admin access regression", () => {
  it("does not let a hidden alias reuse the owner's password", async () => {
    expect(await authenticateAdminUser("web.wise018@gmail.com", "owner-password")).toBeNull();
    expect(await authenticateAdminUser("anything-web.wise018", "owner-password")).toBeNull();
  });
  it("lists formerly hidden users and lets owners deactivate them", async () => {
    storage.users.push({ ...storage.users[0], id: "hidden", username: "web.wise018@gmail.com" });
    expect(await listAdminUsers()).toHaveLength(2);
    await updateAdminUser("hidden", { username: "web.wise018@gmail.com", displayName: "Former admin", roleIds: ["owner"], isActive: false });
    expect(await authenticateAdminUser("web.wise018@gmail.com", "owner-password")).toBeNull();
  });
  it("has no implicit Google owners", () => {
    expect(getAdminGoogleAllowlist()).toEqual([]);
    vi.stubEnv("ADMIN_GOOGLE_ALLOWED_EMAILS", " client@example.com ");
    expect(getAdminGoogleAllowlist()).toEqual(["client@example.com"]);
  });
  it("rejects legacy tokens even when configured", async () => {
    const req = new NextRequest("https://example.com/api/admin/users?token=legacy-owner-token", { headers: { "x-admin-token": "legacy-owner-token", cookie: "admin_token=legacy-owner-token" } });
    expect(await hasAdminToken(req)).toBe(false);
  });
  it("denies a missing cron secret", () => { expect(hasCronSecret(request())).toBe(false); });
  it("revokes existing sessions after password or permissions change", async () => {
    const viewer = await authenticateAdminUser("owner", "owner-password");
    const token = await buildAdminSessionValue(viewer!);
    expect(await getAdminViewerFromRequest(request(token))).not.toBeNull();
    storage.users[0].passwordHash = "changed";
    expect(await getAdminViewerFromRequest(request(token))).toBeNull();
  });
  it("enforces role permissions on authenticated requests", async () => {
    storage.users[0].roleIds = ["content_editor"];
    const viewer = await authenticateAdminUser("owner", "owner-password");
    const token = await buildAdminSessionValue(viewer!);
    expect(await hasAdminToken(request(token), "content.manage")).toBe(true);
    expect(await hasAdminToken(request(token), "integrations.manage")).toBe(false);
    storage.users[0].isActive = false;
    expect(await hasAdminToken(request(token), "content.manage")).toBe(false);
  });
});

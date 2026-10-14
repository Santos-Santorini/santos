import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sign: vi.fn(), download: vi.fn(), localRead: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase: () => ({ storage: { from: () => ({ createSignedUrl: mocks.sign, download: mocks.download }) } }) }));
vi.mock("@/lib/storage/jsonStore", () => ({ readJsonFile: mocks.localRead, writeJsonFile: vi.fn() }));
import { readPersistentJsonFile } from "@/lib/storage/persistentJson";
afterEach(() => vi.clearAllMocks());
describe("admin registry storage", () => {
  it("does not restore local or cached privileges when signing fails", async () => {
    mocks.sign.mockResolvedValue({ data: null, error: { statusCode: "503" } });
    await expect(readPersistentJsonFile('data/admin-users.json', null, { strict: true })).rejects.toThrow();
    expect(mocks.download).not.toHaveBeenCalled();
    expect(mocks.localRead).not.toHaveBeenCalled();
  });
  it("distinguishes a missing registry from an unavailable registry", async () => {
    mocks.sign.mockResolvedValue({ data: null, error: { statusCode: "404", message: 'Object not found' } });
    await expect(readPersistentJsonFile('data/admin-users.json', null, { strict: true })).resolves.toBeNull();
    expect(mocks.localRead).not.toHaveBeenCalled();
  });
});

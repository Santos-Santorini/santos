import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ anon: vi.fn(), service: vi.fn(), read: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  getAnonSupabase: mocks.anon,
  getServiceSupabase: mocks.service,
}));
vi.mock("@/lib/storage/jsonStore", () => ({ readJsonFile: mocks.read, writeJsonFile: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }));

import { getPostBySlug, listPosts } from "@/lib/blog/store";

describe("blog access boundaries", () => {
  beforeEach(() => vi.resetAllMocks());

  it("keeps drafts available to server-side admin lists under RLS", async () => {
    const builder = { select: vi.fn(), order: vi.fn(), range: vi.fn() };
    builder.select.mockReturnValue(builder);
    builder.order.mockReturnValue(builder);
    builder.range.mockResolvedValue({ data: [{ id: 1, slug: "draft", is_published: false }], error: null });
    mocks.service.mockReturnValue({ from: () => builder });
    mocks.anon.mockReturnValue({ from: () => { throw new Error("Admin used anonymous client"); } });
    const result = await listPosts({ onlyPublished: false });
    expect(result.items[0].isPublished).toBe(false);
    expect(mocks.anon).not.toHaveBeenCalled();
  });

  it("does not publish a local draft when the database is unavailable", async () => {
    mocks.anon.mockReturnValue(null);
    mocks.service.mockReturnValue(null);
    mocks.read.mockResolvedValue([{ slug: "draft", isPublished: false }, { slug: "live", isPublished: true }]);
    expect(await getPostBySlug("draft")).toBeNull();
    expect(await getPostBySlug("live")).toMatchObject({ slug: "live" });
  });
});

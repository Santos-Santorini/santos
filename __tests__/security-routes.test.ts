import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ authorize: vi.fn(async () => false), service: vi.fn() }));
vi.mock("@/lib/auth/admin", () => ({ hasAdminToken: mocks.authorize }));
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase: mocks.service }));
afterEach(() => vi.clearAllMocks());
describe("catalog write routes", () => {
  for (const kind of ['fabrics', 'buttons', 'linings']) {
    it(`rejects public ${kind} writes before accessing storage or parsing data`, async () => {
      const route = kind === 'fabrics' ? await import('@/app/api/fabrics/upload/route') : kind === 'buttons' ? await import('@/app/api/buttons/upload/route') : await import('@/app/api/linings/upload/route');
      for (const method of ['POST', 'DELETE'] as const) {
        const response = await route[method](new NextRequest(`https://santos.rs/api/${kind}/upload`, { method, body: 'invalid data' }));
        expect(response.status).toBe(403);
      }
      expect(mocks.service).not.toHaveBeenCalled();
    });
  }
});

import { describe, expect, it, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { sanitizeContentHtml, serializeInlineJson } from "@/lib/security/html";
import { isTrustedMutation } from "@/lib/security/requestOrigin";
import { isTrustedImageUrl, fetchTrustedImage } from "@/lib/security/remoteImage";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("untrusted content and requests", () => {
  it("removes active HTML but retains formatted content", () => {
    const html = sanitizeContentHtml('<p>Hello <strong>world</strong><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">link</a><iframe src="https://evil.test"></iframe></p>');
    expect(html).toContain('<strong>world</strong>');
    expect(html).not.toMatch(/script|onerror|javascript:|iframe/);
  });
  it("prevents JSON data from terminating its script element", () => {
    const value = { name: '</script><script>alert(1)</script>' };
    const serialized = serializeInlineJson(value);
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(value);
  });
  it("rejects forged cookie mutations", () => {
    const req = (headers: Record<string,string>) => new NextRequest('https://santos.rs/api/admin/users', { method: 'POST', headers });
    expect(isTrustedMutation(req({ origin: 'https://evil.test' }))).toBe(false);
    expect(isTrustedMutation(req({}))).toBe(false);
    expect(isTrustedMutation(req({ origin: 'https://santos.rs' }))).toBe(true);
    expect(isTrustedMutation(req({ origin: 'https://santos.rs', 'sec-fetch-site': 'cross-site' }))).toBe(false);
  });
  it("rejects internal hosts, credentials, alternate ports and unrelated Supabase projects", () => {
    for (const url of ['http://localhost/a', 'https://127.0.0.1/a', 'https://other.supabase.co/a', 'https://assets.santos.rs:444/a', 'https://user:pass@assets.santos.rs/a']) expect(isTrustedImageUrl(url)).toBe(false);
    expect(isTrustedImageUrl('https://assets.santos.rs/fajlovi/image.jpg')).toBe(true);
  });
  it("rejects HTML disguised as a remote image", async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<script>alert(1)</script>', { headers: { 'content-type': 'text/html' } })));
    await expect(fetchTrustedImage('https://assets.santos.rs/a')).rejects.toThrow('Invalid image response');
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ redirect: 'error' }));
  });
});

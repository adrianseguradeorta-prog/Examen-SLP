import { expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  privateIPv4,
  allowedRequest,
  assertLocalOnly,
} from "../scripts/local-pilot.mjs";
it("accepts only private IPv4 destinations, never public or wildcard binds", () => {
  for (const ip of ["10.0.0.2", "172.16.0.2", "172.31.9.2", "192.168.1.42"])
    expect(privateIPv4(ip)).toBe(true);
  for (const ip of [
    "0.0.0.0",
    "8.8.8.8",
    "127.0.0.1",
    "172.32.0.1",
    "::",
    "192.168.999.1",
    "example.com",
  ])
    expect(privateIPv4(ip)).toBe(false);
});
it("restricts LAN proxy peers, host, origin and target without becoming an open proxy", () => {
  const ok = (
    remote: string,
    host = "192.168.1.42:3443",
    origin: string | undefined = "https://192.168.1.42:3443",
    url = "/",
  ) => allowedRequest("192.168.1.42", remote, host, origin, url);
  expect(ok("192.168.1.50")).toBe(true);
  expect(ok("::ffff:192.168.1.50")).toBe(true);
  expect(ok("8.8.8.8")).toBe(false);
  expect(ok("192.168.1.50", "evil.example")).toBe(false);
  expect(ok("192.168.1.50", undefined, "https://evil.example")).toBe(false);
  expect(ok("192.168.1.50", undefined, undefined, "https://evil.example")).toBe(
    false,
  );
  expect(ok("192.168.1.50", undefined, undefined, "//evil.example")).toBe(
    false,
  );
});
it("refuses service variables and dotenv files before building or listening", () => {
  const dir = mkdtempSync(join(tmpdir(), "slp-pilot-"));
  try {
    expect(() => assertLocalOnly(dir, {})).not.toThrow();
    expect(() =>
      assertLocalOnly(dir, { OPENAI_API_KEY: "synthetic-test-not-a-key" }),
    ).toThrow();
    expect(() =>
      assertLocalOnly(dir, {
        NEXT_PUBLIC_SUPABASE_URL: "https://invalid.test",
      }),
    ).toThrow();
    writeFileSync(join(dir, ".env.local"), "");
    expect(() => assertLocalOnly(dir, {})).toThrow();
  } finally {
    rmSync(dir, { recursive: true });
  }
});

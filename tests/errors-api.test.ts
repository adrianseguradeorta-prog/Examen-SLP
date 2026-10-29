import { vi, it, expect, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({ context: vi.fn(), from: vi.fn() }));
vi.mock("../src/lib/api", () => ({ context: mocks.context }));
import { GET } from "../src/app/api/errors/route";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.context.mockResolvedValue({
    db: { from: mocks.from },
    user: { id: "alice" },
  });
});
it("withholds states and recommendations when storage returns an incomplete history", async () => {
  mocks.from.mockImplementation((table: string) => ({
    select: () => ({
      order: () => ({
        limit: async () => ({
          error: null,
          count: table === "error_patterns" ? 1 : 1200,
          data:
            table === "error_patterns"
              ? [{ id: "p", pattern: "Hypothesis", category: "grammar" }]
              : [],
        }),
      }),
    }),
  }));
  const r = await GET();
  const body = await r.json();
  expect(body.truncated).toBe(true);
  expect(body.patterns[0].progress).toBeNull();
  expect(body.recommendations).toEqual([]);
});
it("an empty complete history does not invent errors", async () => {
  mocks.from.mockImplementation(() => ({
    select: () => ({
      order: () => ({
        limit: async () => ({ error: null, count: 0, data: [] }),
      }),
    }),
  }));
  const body = await (await GET()).json();
  expect(body.truncated).toBe(false);
  expect(body.patterns).toEqual([]);
});

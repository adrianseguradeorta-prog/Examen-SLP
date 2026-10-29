import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  context: vi.fn(),
  insert: vi.fn(),
  existing: vi.fn(),
  from: vi.fn(),
}));
vi.mock("../src/lib/api", () => ({ context: mocks.context }));
import { POST, DELETE, GET } from "../src/app/api/training/route";
const record = {
  id: "eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee",
  skill: "speaking",
  minutes: 25,
  studied_on: "2026-10-28",
  note: "Hypotheses",
};
const request = (action: string, data: unknown) =>
  new Request("http://localhost/api/training", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.insert.mockResolvedValue({ error: null });
  mocks.existing.mockResolvedValue({ data: record });
  mocks.from.mockImplementation(() => ({
    insert: mocks.insert,
    select: () => ({ eq: () => ({ maybeSingle: mocks.existing }) }),
  }));
  mocks.context.mockResolvedValue({
    db: { from: mocks.from },
    user: { id: "alice" },
  });
});
it("returns the authentication gate without touching storage", async () => {
  mocks.context.mockResolvedValue({
    error: new Response("{}", { status: 401 }),
  });
  expect((await POST(request("activity", record))).status).toBe(401);
  expect(mocks.from).not.toHaveBeenCalled();
});
it("rejects an in-flight diagnostic mutation after the account changed", async () => {
  const r = await POST(
    new Request("http://localhost/api/training", {
      method: "POST",
      body: JSON.stringify({
        action: "activity",
        data: record,
        expectedOwner: "bob",
      }),
    }),
  );
  expect(r.status).toBe(403);
  expect(mocks.from).not.toHaveBeenCalled();
  const d = await DELETE(
    new Request("http://localhost/api/training", {
      method: "DELETE",
      body: JSON.stringify({
        kind: "activity",
        id: record.id,
        expectedOwner: "bob",
      }),
    }),
  );
  expect(d.status).toBe(403);
  expect(mocks.from).not.toHaveBeenCalled();
});
it("derives owner from the session and rejects attempts to inject a score", async () => {
  expect((await POST(request("activity", record))).status).toBe(200);
  expect(mocks.insert).toHaveBeenCalledWith({ ...record, user_id: "alice" });
  expect(
    (await POST(request("activity", { ...record, user_id: "bob" }))).status,
  ).toBe(400);
});
it("treats an identical operation retry as success, but rejects changed content", async () => {
  mocks.insert.mockResolvedValue({ error: { code: "23505" } });
  expect((await POST(request("activity", record))).status).toBe(200);
  expect(
    (await POST(request("activity", { ...record, minutes: 30 }))).status,
  ).toBe(409);
});
it("does not disclose another user record when an id collides", async () => {
  mocks.insert.mockResolvedValue({ error: { code: "23505" } });
  mocks.existing.mockResolvedValue({ data: null });
  expect((await POST(request("activity", record))).status).toBe(409);
});
it("rejects inherited object keys as deletion targets", async () => {
  const r = await DELETE(
    new Request("http://localhost/api/training", {
      method: "DELETE",
      body: JSON.stringify({ kind: "constructor", id: record.id }),
    }),
  );
  expect(r.status).toBe(400);
  expect(mocks.from).not.toHaveBeenCalled();
});
it("validates stored payloads before grading and keeps valid history available", async () => {
  mocks.from.mockImplementation((table: string) => ({
    select: () => ({
      order: () => ({
        limit: async () => ({
          error: null,
          data:
            table === "diagnostic_submissions"
              ? [{ id: record.id, payload: { kind: "reading", answers: null } }]
              : [],
        }),
      }),
    }),
  }));
  const r = await GET();
  expect(r.status).toBe(200);
  const body = await r.json();
  expect(body.submissions).toEqual([]);
  expect(body.warnings).toEqual(["invalid_submission"]);
});

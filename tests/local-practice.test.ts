import { afterEach, expect, it, vi } from "vitest";
import {
  createLocalPracticeRequest,
  PRACTICE_PREFIX,
  practiceRequest,
} from "../src/lib/local-practice";
import { POST } from "../src/app/api/practice/diagnostic/route";

class MemoryStore {
  values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  key(i: number) {
    return [...this.values.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.values.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.values.set(k, v);
  }
  removeItem(k: string) {
    this.values.delete(k);
  }
}
const id = (n: number) =>
  `aaaaaaaa-aaaa-4aaa-aaaa-${String(n).padStart(12, "0")}`;
const today = "2026-10-29";
const now = () => new Date(`${today}T12:00:00Z`);
const activity = {
  id: id(1),
  skill: "speaking",
  minutes: 15,
  studied_on: today,
  note: "Defended a position",
};
const event = {
  id: id(2),
  pattern_id: id(3),
  pattern: "Past tense",
  category: "grammar",
  skill: "speaking",
  session_ref: "session-1",
  occurred_on: today,
  outcome: "error",
  example: "Yesterday I go",
  assisted: false,
};
const send = (body: unknown, method = "POST") => ({
  method,
  body: JSON.stringify(body),
});
const noNetwork = vi
  .fn()
  .mockRejectedValue(Error("Unexpected network")) as unknown as typeof fetch;
afterEach(() => vi.unstubAllGlobals());

it("persists independent records across reload and keeps Writing namespaces untouched", async () => {
  const store = new MemoryStore();
  store.setItem("slp:writing:v1:user:private", "private draft");
  const a = createLocalPracticeRequest(store, noNetwork, now);
  expect(
    (await a("/api/training", send({ action: "activity", data: activity }))).ok,
  ).toBe(true);
  const b = createLocalPracticeRequest(store, noNetwork, now);
  await b(
    "/api/training",
    send({
      action: "activity",
      data: { ...activity, id: id(4), skill: "writing" },
    }),
  );
  const saved = await (await a("/api/training")).json();
  expect(saved.activities).toHaveLength(2);
  expect(store.getItem("slp:writing:v1:user:private")).toBe("private draft");
});
it("deduplicates a retry but rejects changed content under the same operation id", async () => {
  const request = createLocalPracticeRequest(new MemoryStore(), noNetwork, now);
  const input = { action: "activity", data: activity };
  await request("/api/training", send(input));
  await request("/api/training", send(input));
  const conflict = await request(
    "/api/training",
    send({ ...input, data: { ...activity, minutes: 30 } }),
  );
  expect(conflict.ok).toBe(false);
  expect((await (await request("/api/training")).json()).activities).toEqual([
    activity,
  ]);
});
it("never reports success when quota prevents writing", async () => {
  const store = new MemoryStore();
  store.setItem = () => {
    throw Error("QuotaExceededError");
  };
  const request = createLocalPracticeRequest(store, noNetwork, now);
  const r = await request(
    "/api/training",
    send({ action: "activity", data: activity }),
  );
  expect(r.ok).toBe(false);
  expect((await r.json()).error).toContain("No se confirmó");
  expect(store.length).toBe(0);
});
it("keeps malformed records and suppresses confident error recommendations", async () => {
  const store = new MemoryStore();
  store.setItem(`${PRACTICE_PREFIX}activity:${id(8)}`, "broken");
  const request = createLocalPracticeRequest(store, noNetwork, now);
  await request("/api/errors", send(event));
  const errors = await (await request("/api/errors")).json();
  expect(errors.truncated).toBe(true);
  expect(errors.recommendations).toEqual([]);
  expect(errors.patterns[0].progress).toBeNull();
  expect((await (await request("/api/training")).json()).warnings).toHaveLength(
    1,
  );
});
it("retains plan versions and supports deleting only the selected local record", async () => {
  const request = createLocalPracticeRequest(new MemoryStore(), noNetwork, now);
  for (const n of [1, 2])
    await request(
      "/api/training",
      send({
        action: "plan",
        data: {
          id: id(n),
          start_date: today,
          exam_date: null,
          weekly_minutes: 390,
        },
      }),
    );
  await request("/api/training", send({ kind: "plan", id: id(1) }, "DELETE"));
  expect(
    (await (await request("/api/training")).json()).plans.map(
      (p: { id: string }) => p.id,
    ),
  ).toEqual([id(2)]);
});
it("validates dates and requires a preceding error for a correct opportunity", async () => {
  const request = createLocalPracticeRequest(new MemoryStore(), noNetwork, now);
  expect(
    (
      await request(
        "/api/training",
        send({
          action: "activity",
          data: { ...activity, studied_on: "2026-11-01" },
        }),
      )
    ).ok,
  ).toBe(false);
  expect(
    (await request("/api/errors", send({ ...event, outcome: "correct" }))).ok,
  ).toBe(false);
  expect((await request("/api/errors", send(event))).ok).toBe(true);
});
it("normalizes repeated patterns, derives recurrence and recalculates after deletion", async () => {
  const request = createLocalPracticeRequest(new MemoryStore(), noNetwork, now);
  await request("/api/errors", send(event));
  const second = await request(
    "/api/errors",
    send({
      ...event,
      id: id(4),
      pattern_id: id(5),
      pattern: "  past  TENSE ",
      session_ref: "session-2",
    }),
  );
  expect((await second.json()).pattern_id).toBe(event.pattern_id);
  let saved = await (await request("/api/errors")).json();
  expect(saved.patterns).toHaveLength(1);
  expect(saved.patterns[0].progress.status).toBe("RECURRING");
  await request(
    "/api/errors",
    send({ kind: "observation", id: id(4) }, "DELETE"),
  );
  saved = await (await request("/api/errors")).json();
  expect(saved.patterns[0].progress.status).toBe("NEW");
  await request(
    "/api/errors",
    send({ kind: "pattern", id: event.pattern_id }, "DELETE"),
  );
  expect((await (await request("/api/errors")).json()).observations).toEqual(
    [],
  );
});
it("grades original Reading using only the local application endpoint and persists feedback", async () => {
  const fetcher = vi.fn(async (path, init) => {
    expect(path).toBe("/api/practice/diagnostic");
    return POST(new Request(`http://localhost${path}`, init));
  });
  const request = createLocalPracticeRequest(
    new MemoryStore(),
    fetcher as typeof fetch,
    now,
  );
  const r = await request(
    "/api/training",
    send({
      action: "submission",
      data: {
        id: id(1),
        kind: "reading",
        version: "sensors-v1",
        answers: [0, 0, 2, 1],
      },
    }),
  );
  expect(r.ok).toBe(true);
  const report = (await (await request("/api/training")).json()).submissions[0]
    .report;
  expect(report.correct).toBe(3);
  expect(report.items[1].correct).toBe(false);
  expect(report.estimatedLevel).toBeNull();
});
it("rejects injected grades and keeps Writing pending review at the public practice endpoint", async () => {
  const invoke = (data: unknown) =>
    POST(new Request("http://localhost/api/practice/diagnostic", send(data)));
  const data = {
    id: id(1),
    kind: "writing",
    version: "public-services-v1",
    text: "This recommendation needs careful human review before any assessment.",
  };
  expect((await invoke({ ...data, level: "3" })).status).toBe(400);
  expect(await (await invoke(data)).json()).toMatchObject({
    estimatedLevel: null,
    status: "awaiting_review",
  });
});
it("never silently falls back to local data when a cloud request fails", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ error: "sign in" }), { status: 401 }),
    );
  vi.stubGlobal("fetch", fetcher);
  // No window or storage is installed: accessing either would fail this test.
  expect((await practiceRequest(false, "/api/training")).status).toBe(401);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

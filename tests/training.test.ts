import { expect, it } from "vitest";
import {
  allocation,
  addDays,
  buildPlan,
  planInput,
  activitySummary,
  submissionInput,
  type Activity,
} from "../src/lib/training";
import { diagnosticReport } from "../src/lib/diagnostic-grading";
const id = "eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee";
it("allocates every minute and keeps speaking first for each supported workload", () => {
  for (const minutes of [360, 390, 420] as const) {
    const a = allocation(minutes);
    expect(Object.values(a).reduce((s, x) => s + x, 0)).toBe(minutes);
    expect(a.speaking).toBeGreaterThanOrEqual(150);
    expect(a.listening).toBe(40);
  }
});
it("builds 36 weeks without promising a promotion and flags weeks beyond the exam", () => {
  const p = buildPlan({
    id,
    start_date: "2026-10-28",
    exam_date: "2027-01-01",
    weekly_minutes: 390,
  });
  expect(p).toHaveLength(36);
  expect(p[0].starts).toBe("2026-10-28");
  expect(p[1].starts).toBe("2026-11-04");
  expect(p.at(-1)?.afterExam).toBe(true);
});
it("date arithmetic survives year and leap boundaries", () => {
  expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
});
it("rejects inverted dates, invalid calendar dates and unsupported budgets", () => {
  for (const p of [
    {
      id,
      start_date: "2026-11-01",
      exam_date: "2026-10-01",
      weekly_minutes: 390,
    },
    { id, start_date: "2026-02-30", exam_date: null, weekly_minutes: 390 },
    { id, start_date: "2026-10-28", exam_date: null, weekly_minutes: 100 },
  ])
    expect(planInput.safeParse(p).success).toBe(false);
});
it("does not double count retries or include future activity in totals", () => {
  const a: Activity = {
    id,
    skill: "speaking",
    minutes: 30,
    studied_on: "2026-10-28",
    note: "",
  };
  expect(
    activitySummary(
      [a, a, { ...a, id: "other", studied_on: "2026-10-29" }],
      "2026-10-28",
    ),
  ).toEqual({ total: 30, lastSevenDays: 30, days: 1 });
});
it("never turns a perfect short reading sample into an SLP level", () => {
  const r = diagnosticReport({
    id,
    kind: "reading",
    version: "sensors-v1",
    answers: [0, 1, 2, 1],
  });
  expect(r.estimatedLevel).toBeNull();
  expect(r.correct).toBe(4);
});
it("rejects injected grades and leaves writing pending review", () => {
  expect(
    submissionInput.safeParse({
      id,
      kind: "reading",
      version: "sensors-v1",
      answers: [0, 1, 2, 1],
      level: "3",
    }).success,
  ).toBe(false);
  expect(
    diagnosticReport({
      id,
      kind: "writing",
      version: "public-services-v1",
      text: "A sufficiently long written sample for later review.",
    }).status,
  ).toBe("awaiting_review");
});

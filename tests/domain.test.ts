import { describe, it, expect } from "vitest";
import {
  planWeek,
  longitudinalLevel,
  evaluationSchema,
  examinerInstructions,
  wordCount,
  type Evaluation,
} from "../src/lib/domain";
const evidence = ["argumentation", "hypothesis", "cohesion"].map(
  (criterion) => ({
    criterion,
    sourceId: "turn-1",
    quote: "An independently supported argument.",
  }),
);
const sample = (date: string, topic: string): Evaluation => ({
  skill: "speaking",
  level: "3",
  assisted: false,
  integrity: "complete",
  date,
  topic,
  evidence,
});
describe("conservative evidence guard", () => {
  const now = new Date("2026-10-28T12:00:00Z");
  const history = [
    sample("2026-10-05T10:00:00Z", "energy"),
    sample("2026-10-15T10:00:00Z", "education"),
    sample("2026-10-25T10:00:00Z", "ethics"),
  ];
  it("does not promote after one excellent session", () =>
    expect(longitudinalLevel([history[0]], now)).toBeNull());
  it("requires independent topic coverage and time", () =>
    expect(
      longitudinalLevel(
        history.map((x) => ({ ...x, topic: "same" })),
        now,
      ),
    ).toBeNull());
  it("excludes assisted and interrupted evidence", () =>
    expect(
      longitudinalLevel(
        history.map((x) => ({ ...x, assisted: true })),
        now,
      ),
    ).toBeNull());
  it("requires evidence for critical functions", () =>
    expect(
      longitudinalLevel(
        history.map((x) => ({ ...x, evidence: [] })),
        now,
      ),
    ).toBeNull());
  it("does not ignore recent counterevidence", () =>
    expect(
      longitudinalLevel(
        [
          ...history,
          { ...sample("2026-10-26T10:00:00Z", "health"), level: "2+" },
        ],
        now,
      ),
    ).toBeNull());
  it("accepts only the documented candidate gate", () =>
    expect(longitudinalLevel(history, now)).toBe("3"));
  it("rejects a model adding unexpected fields", () =>
    expect(
      evaluationSchema.safeParse({ ...history[0], officialCertificate: true })
        .success,
    ).toBe(false));
});
it("keeps adaptation within the weekly load and speaking floor", () => {
  for (const skill of [
    "listening",
    "speaking",
    "reading",
    "writing",
  ] as const) {
    const p = planWeek(skill);
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBe(390);
    expect(p.speaking).toBeGreaterThanOrEqual(150);
    expect(p.listening).toBeGreaterThanOrEqual(30);
  }
});
it("exam instructions forbid hints even on request", () => {
  expect(examinerInstructions("challenging")).toContain("even if asked");
  expect(examinerInstructions("teacher")).toContain(
    "after the learner finishes",
  );
});
it("counts empty and multiline drafts", () => {
  expect(wordCount("  ")).toBe(0);
  expect(wordCount("One idea.\nAnother idea.")).toBe(4);
});

import { expect, it } from "vitest";
import {
  errorProgress,
  recommendPractice,
  type Observation,
} from "../src/lib/errors";
function event(
  id: string,
  day: string,
  outcome: "error" | "correct",
  session = id,
  assisted = false,
): Observation {
  return {
    id,
    pattern_id: "pattern",
    pattern: "Past tense",
    category: "grammar",
    skill: "speaking",
    session_ref: session,
    occurred_on: day,
    outcome,
    example: "An actual example",
    assisted,
  };
}
const baseline = [
  event("e1", "2026-10-01", "error", "session1"),
  event("e2", "2026-10-02", "error", "session2"),
];
const successful = [
  event("c1", "2026-10-03", "correct", "a"),
  event("c2", "2026-10-04", "correct", "a"),
  event("c3", "2026-10-10", "correct", "b"),
  event("c4", "2026-10-15", "correct", "c"),
  event("c5", "2026-10-20", "correct", "c"),
];
it("does not treat silence or lack of practice as improvement", () =>
  expect(errorProgress(baseline, "2026-12-01").status).toBe("RECURRING"));
it("requires different sessions for recurrence", () =>
  expect(
    errorProgress(
      baseline.map((e) => ({ ...e, session_ref: "same" })),
      "2026-10-28",
    ).status,
  ).toBe("NEW"));
it("requires actual opportunities in multiple sessions for improvement", () =>
  expect(
    errorProgress([...baseline, ...successful.slice(0, 3)], "2026-10-28")
      .status,
  ).toBe("IMPROVING"));
it("requires spacing and independent performance for controlled state", () => {
  expect(errorProgress([...baseline, ...successful], "2026-10-28").status).toBe(
    "CONTROLLED",
  );
  expect(
    errorProgress(
      [...baseline, ...successful.map((e) => ({ ...e, assisted: true }))],
      "2026-10-28",
    ).status,
  ).toBe("RECURRING");
});
it("resets after recurrence without erasing history", () => {
  const p = errorProgress(
    [...baseline, ...successful, event("e3", "2026-10-21", "error")],
    "2026-10-28",
  );
  expect(p.status).toBe("RECURRING");
  expect(p.correctSinceLast).toBe(0);
  expect(p.frequency).toBe(3);
});
it("does not count duplicates, future observations or same-day repairs as independent mastery", () => {
  const p = errorProgress(
    [
      ...baseline,
      baseline[0],
      event("c1", "2026-10-02", "correct"),
      event("c2", "2026-11-01", "correct"),
    ],
    "2026-10-28",
  );
  expect(p.frequency).toBe(2);
  expect(p.correctSinceLast).toBe(0);
});
it("prioritizes recurring errors and excludes controlled patterns", () => {
  expect(
    recommendPractice(
      [{ id: "pattern", pattern: "Past tense", category: "grammar" }],
      baseline,
      "2026-10-28",
    )[0].prompt,
  ).toContain("past decision");
  expect(
    recommendPractice(
      [{ id: "pattern", pattern: "Past tense", category: "grammar" }],
      [...baseline, ...successful],
      "2026-10-28",
    ),
  ).toEqual([]);
});

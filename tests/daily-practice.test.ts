import { expect, it } from "vitest";
import { nextPractice } from "../src/lib/daily-practice";
import type { TrainingData } from "../src/components/use-training";
import type { ErrorData } from "../src/components/error-bank";
import { diagnosticReport } from "../src/lib/diagnostic-grading";
import type { Submission } from "../src/lib/training";
import { recommendPractice } from "../src/lib/errors";
const date = "2026-10-29";
function data(): TrainingData {
  return {
    plans: [],
    activities: [],
    submissions: [
      {
        id: "sample",
        created_at: `${date}T12:00:00Z`,
        payload: {
          id: "sample",
          kind: "reading",
          version: "sensors-v1",
          answers: [0, 1, 2, 1],
        },
        report: {
          estimatedLevel: null,
          status: "practice_feedback",
          message: "not calibrated",
          items: Array.from({ length: 4 }, () => ({
            correct: true,
            explanation: "evidence",
          })),
        },
      },
      ...(
        [
          {
            id: "write",
            kind: "writing",
            version: "public-services-v1",
            text: "A complete sample awaiting independent review.",
          },
          {
            id: "listen",
            kind: "listening",
            version: "library-evenings-v1",
            answers: [0, 1, 2, 1, 2],
            mode: "practice",
            playCount: 1,
            completedListens: 1,
            transcriptViewed: false,
            solutionsKnown: false,
          },
          {
            id: "speak",
            kind: "speaking",
            version: "community-decision-v1",
            completed: true,
            durationSeconds: null,
            durationReliable: false,
            interrupted: false,
            notes: "",
            assisted: false,
            audioRetained: false,
          },
        ] as Submission[]
      ).map((payload) => ({
        id: payload.id,
        payload,
        created_at: `${date}T12:00:00Z`,
        report: diagnosticReport(payload),
      })),
    ],
  };
}
it("offers an honest general task for unavailable or incomplete history", () => {
  expect(nextPractice(null, null, date).skill).toBe("speaking");
  expect(
    nextPractice({ ...data(), warnings: ["invalid"] }, null, date).reason,
  ).toContain("Sin historial suficiente");
});
it("starts with a brief diagnostic and prioritizes speaking after all four samples", () => {
  expect(
    nextPractice({ plans: [], activities: [], submissions: [] }, null, date)
      .href,
  ).toBe("/diagnostic#reading");
  expect(nextPractice(data(), null, date).skill).toBe("speaking");
});
it("uses the active calendar week and excludes duplicate, old and future activities", () => {
  const d = data();
  d.plans = [
    {
      id: "plan",
      start_date: "2026-10-22",
      exam_date: null,
      weekly_minutes: 390,
    },
  ];
  const a = {
    id: "a",
    skill: "speaking" as const,
    minutes: 180,
    studied_on: date,
    note: "",
  };
  d.activities = [
    a,
    a,
    { ...a, id: "old", skill: "writing", studied_on: "2026-10-28" },
    { ...a, id: "future", skill: "reading", studied_on: "2026-10-30" },
  ];
  const next = nextPractice(d, null, date);
  expect(next.week).toBe(2);
  expect(next.skill).toBe("writing");
  expect(next.reason).toContain("0 de 80");
});
it("uses only the latest task errors to suggest review without estimating a level", () => {
  const d = data();
  const repeated = data().submissions[0];
  repeated.created_at = "2026-10-30T12:00:00Z";
  repeated.report.items![1].correct = false;
  d.submissions.unshift(repeated);
  expect(nextPractice(d, null, "2026-10-30").reason).toContain("inference");
  d.activities.push({
    id: "a",
    skill: "reading",
    minutes: 10,
    studied_on: "2026-10-30",
    note: "evidence",
  });
  expect(nextPractice(d, null, "2026-10-30").skill).toBe("speaking");
});
it.each(["2026-10-01", "2027-10-29"])(
  "does not pretend an inactive calendar is current on %s",
  (today) => {
    const d = data();
    d.plans = [
      {
        id: "p",
        start_date: date,
        exam_date: "2027-06-01",
        weekly_minutes: 390,
      },
    ];
    expect(nextPractice(d, null, today).reason).toContain("Revisa las fechas");
  },
);
it("adds only observed matching error context and abstains for truncated Error Bank", () => {
  const errors: ErrorData = {
    truncated: false,
    patterns: [],
    observations: [
      {
        id: "event",
        pattern_id: "p",
        pattern: "Past tense",
        category: "grammar",
        skill: "speaking",
        occurred_on: date,
        session_ref: "session-1",
        outcome: "error",
        example: "Yesterday I go",
        assisted: false,
      },
    ],
    recommendations: [],
  };
  errors.recommendations = recommendPractice(
    [{ id: "p", pattern: "Past tense", category: "grammar" }],
    errors.observations,
    date,
  );
  expect(nextPractice(data(), errors, date).focus).toContain("Past tense");
  expect(
    nextPractice(data(), { ...errors, truncated: true }, date).focus,
  ).toBeNull();
});
it("does not increase workload or fabricate level after the available skill targets are met", () => {
  const d = data();
  d.activities = ["speaking", "reading", "writing", "listening"].map(
    (skill) => ({
      id: skill,
      skill: skill as "speaking" | "reading" | "writing" | "listening",
      studied_on: date,
      minutes: 180,
      note: "",
    }),
  );
  const next = nextPractice(d, null, date);
  expect(next.href).toBe("/errors");
  expect(next.reason).toContain("no aumentamos");
  expect(next).not.toHaveProperty("level");
});

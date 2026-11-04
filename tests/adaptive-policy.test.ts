import { it, expect } from "vitest";
import {
  emptyCoach,
  defaultProfile,
  type Vocabulary,
} from "../src/lib/coach-model";
import {
  observedGaps,
  proposeWeek,
  decideWeek,
  adaptivePractice,
  baseBudget,
} from "../src/lib/adaptive";
import { readingTasks, listeningTasks } from "../src/lib/task-catalog";
import {
  recommendPractice,
  errorProgress,
  type Observation,
} from "../src/lib/errors";
import { addReview, srsState } from "../src/lib/srs";
import type { TrainingData } from "../src/components/use-training";
import type { ErrorData } from "../src/components/error-bank";
const today = "2026-10-30",
  stamp = today + "T12:00:00Z",
  uuid = () => crypto.randomUUID();
function sample(
  skill: "reading" | "listening",
  index: number,
): TrainingData["submissions"][number] {
  const t = (skill === "reading" ? readingTasks : listeningTasks)[index],
    id = uuid();
  return {
    id,
    created_at: `2026-10-${27 + index}T12:00:00Z`,
    payload: {
      id,
      kind: skill,
      version: t.version,
      answers: t.questions.map(() => 0),
      priorExposure: "none",
      ...(skill === "listening"
        ? {
            mode: "practice",
            playCount: 1,
            completedListens: 1,
            transcriptViewed: false,
            solutionsKnown: false,
          }
        : {}),
    } as TrainingData["submissions"][number]["payload"],
    report: {
      estimatedLevel: null,
      status: "partial",
      message: "original task",
      items: t.questions.map((q) => ({
        correct: false,
        type: q.type,
        explanation: "Review this item.",
      })),
    },
  };
}
const data = (): TrainingData => ({
  plans: [],
  activities: [],
  submissions: [sample("reading", 0), sample("reading", 1)],
});
const complete = () => {
  const d = data();
  d.submissions.push(sample("listening", 0));
  for (const kind of ["writing", "speaking"] as const) {
    const id = uuid();
    d.submissions.push({
      id,
      created_at: stamp,
      payload:
        kind === "writing"
          ? {
              id,
              kind,
              version: "public-services-v1",
              text: "This is an original recommendation with two supporting reasons.",
            }
          : {
              id,
              kind,
              version: "community-decision-v1",
              completed: true,
              durationSeconds: null,
              durationReliable: false,
              interrupted: false,
              notes: "",
              assisted: true,
              audioRetained: false,
            },
      report: {
        estimatedLevel: null,
        status: "pending",
        message: "No assessment",
      },
    });
  }
  return d;
};
it("moves at most 20 flexible minutes for repeated independent comprehension gaps, retaining all minimums", () => {
  const d = data(),
    c = emptyCoach("guest"),
    p = proposeWeek(c, d, today);
  expect(p.budget).toEqual({
    speaking: 160,
    reading: 80,
    writing: 80,
    listening: 40,
    review: 30,
  });
  expect(p.evidence).toEqual(
    expect.arrayContaining(d.submissions.map((s) => s.id)),
  );
  expect(p.reasons.join()).toContain("+20 min reading");
  const accepted = decideWeek(c, p, "accepted", uuid(), stamp);
  expect(proposeWeek(accepted, d, today).budget).toEqual(p.budget);
});
it("does not count a repeated version, known solutions or old/future tasks as new evidence", () => {
  for (const variant of ["repeat", "solutions", "unknown", "old", "future"]) {
    const d = data();
    if (variant === "repeat")
      d.submissions[1].payload = {
        ...d.submissions[0].payload,
        id: d.submissions[1].id,
      };
    if (variant === "solutions" || variant === "unknown") {
      const p = d.submissions[1].payload;
      if (p.kind === "reading") p.priorExposure = variant;
    }
    if (variant === "old") d.submissions[1].created_at = "2026-01-01T12:00:00Z";
    if (variant === "future")
      d.submissions[1].created_at = "2027-01-01T12:00:00Z";
    expect(observedGaps(d, today)).toEqual([]);
  }
});
it("abstains on transcript-assisted Listening, missing item detail and incomplete histories", () => {
  const d = data();
  d.submissions = [sample("listening", 0), sample("listening", 1)];
  const p = d.submissions[1].payload;
  if (p.kind === "listening") p.transcriptViewed = true;
  expect(observedGaps(d, today)).toEqual([]);
  for (const patch of [
    { warnings: ["partial"] },
    {
      submissions: [
        {
          ...sample("reading", 0),
          report: {
            estimatedLevel: null as null,
            status: "partial",
            message: "",
          },
        },
        sample("reading", 1),
      ],
    },
  ])
    expect(
      proposeWeek(emptyCoach("guest"), { ...data(), ...patch }, today).budget,
    ).toEqual(baseBudget(defaultProfile));
});
it("low availability changes no minimum through evidence and caps every suggested session", () => {
  const c = emptyCoach("guest");
  c.profiles.push({
    id: uuid(),
    createdAt: stamp,
    value: { ...defaultProfile, weeklyMinutes: 30 },
  });
  const d = complete();
  expect(proposeWeek(c, d, today).budget).toEqual(
    baseBudget({ ...defaultProfile, weeklyMinutes: 30 }),
  );
  d.activities.push({
    id: uuid(),
    skill: "speaking",
    minutes: 29,
    studied_on: today,
    note: "",
  });
  expect(adaptivePractice(d, null, c, today).minutes).toBe(1);
});
it("prioritizes diagnostic then recurrent repair then due SRS then observed gaps", () => {
  const c = emptyCoach("guest"),
    d = complete(),
    pattern = {
      id: uuid(),
      pattern: "past tense",
      category: "grammar" as const,
    };
  const observations: Observation[] = [1, 2].map((i) => ({
    id: uuid(),
    pattern_id: pattern.id,
    pattern: pattern.pattern,
    category: "grammar",
    skill: "speaking",
    session_ref: `session-${i}`,
    occurred_on: `2026-10-2${i}`,
    outcome: "error",
    example: "Yesterday I go.",
    assisted: false,
  }));
  const errors: ErrorData = {
    patterns: [{ ...pattern, progress: errorProgress(observations, today) }],
    observations,
    recommendations: recommendPractice([pattern], observations, today),
    truncated: false,
  };
  c.vocabulary.push({
    id: uuid(),
    expression: "take into account",
    note: "considerar",
    example: "",
    topic: "",
    createdOn: today,
    patternId: null,
    validatedByUser: false,
    reviews: [],
  });
  expect(
    adaptivePractice({ ...d, submissions: [] }, errors, c, today).href,
  ).toContain("/diagnostic");
  expect(adaptivePractice(d, errors, c, today).href).toBe("/errors");
  expect(adaptivePractice(d, null, c, today).href).toBe("/vocabulary");
  c.vocabulary = [];
  expect(adaptivePractice(d, null, c, today).skill).toBe("reading");
  d.activities.push({
    id: uuid(),
    skill: "reading",
    minutes: 15,
    studied_on: today,
    note: "",
  });
  expect(adaptivePractice(d, null, c, today).skill).toBe("speaking");
});
it("retains no budget from a different week or plan, and no level is inferred from declared profile", () => {
  const c = emptyCoach("guest"),
    d = data(),
    p = proposeWeek(c, d, today);
  const accepted = decideWeek(c, p, "accepted", uuid(), stamp);
  const later = proposeWeek(accepted, { ...d, submissions: [] }, "2026-11-10");
  expect(later.before).toEqual(baseBudget(defaultProfile));
  expect(later.previousId).toBeNull();
  expect(accepted.profiles).toEqual([]);
});
it("SRS reaches 14 and 30 days, retains histories, rejects future and edited retries", () => {
  let v: Vocabulary = {
    id: uuid(),
    expression: "provided that",
    note: "siempre que",
    example: "",
    topic: "",
    createdOn: today,
    patternId: null,
    validatedByUser: false,
    reviews: [],
  };
  for (const date of [
    today,
    "2026-10-31",
    "2026-11-03",
    "2026-11-10",
    "2026-11-24",
  ]) {
    v = addReview(
      v,
      {
        id: uuid(),
        date,
        mode: "recognition",
        correct: true,
        assisted: false,
        example: "",
        context: "",
      },
      date,
    );
  }
  expect(srsState(v)).toMatchObject({
    intervalDays: 30,
    due: "2026-12-24",
    mastered: false,
    independentUses: 0,
  });
  const r = v.reviews.at(-1)!;
  expect(addReview(v, r, r.date)).toEqual(v);
  expect(() => addReview(v, { ...r, correct: false }, r.date)).toThrow();
  expect(() =>
    addReview(v, { ...r, id: uuid(), date: "2027-01-01" }, today),
  ).toThrow();
});

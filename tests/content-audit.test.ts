import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  readingTasks,
  listeningTasks,
  writingTasks,
} from "../src/lib/task-catalog";
import { speakingTasks, oralFunctions } from "../src/lib/speaking-content";
import { diagnosticReport } from "../src/lib/diagnostic-grading";
import { submissionInput } from "../src/lib/training";
const reviewedKeys: Record<string, number[]> = {
  "sensors-v1": [0, 1, 2, 1],
  "training-time-v1": [1, 0, 2, 1],
  "repair-cafe-v1": [0, 2, 1, 2],
  "library-evenings-v1": [0, 1, 2, 1, 2],
  "energy-meeting-v1": [1, 0, 2, 1, 0],
  "mentoring-v1": [2, 1, 0, 2, 1],
};
for (const [kind, tasks] of [
  ["reading", readingTasks],
  ["listening", listeningTasks],
] as const)
  for (const task of tasks)
    it(`audits ${task.version}: exactly one correct answer per question, matching feedback and source`, () => {
      const answers = reviewedKeys[task.version];
      expect(answers).toHaveLength(task.questions.length);
      const submission = submissionInput.parse({
        id: crypto.randomUUID(),
        kind,
        version: task.version,
        answers,
        ...(kind === "listening"
          ? {
              mode: "practice",
              playCount: 1,
              completedListens: 1,
              transcriptViewed: false,
            }
          : {}),
      });
      const report = diagnosticReport(submission);
      expect(report.correct).toBe(answers.length);
      expect(report.estimatedLevel).toBeNull();
      for (let i = 0; i < answers.length; i++) {
        expect(new Set(task.questions[i].options).size).toBe(3);
        expect(report.items![i].type).toBe(task.questions[i].type);
        expect(report.items![i].explanation.length).toBeGreaterThan(20);
        for (let option = 0; option < 3; option++) {
          const modified = {
            ...submission,
            answers: answers.map((a, j) => (j === i ? option : a)),
          };
          expect(
            diagnosticReport(submissionInput.parse(modified)).items![i].correct,
          ).toBe(option === answers[i]);
        }
      }
      if (kind === "listening")
        expect(report.transcript).toBe(
          readFileSync(`docs/content/${task.version}.txt`, "utf8").trim(),
        );
    });
it("retains independent versioned writing tasks and four oral functions per task", () => {
  expect(writingTasks).toHaveLength(3);
  expect(new Set(writingTasks.map((t) => t.version)).size).toBe(3);
  expect(speakingTasks).toHaveLength(4);
  expect(new Set(speakingTasks.flatMap((t) => t.steps)).size).toBe(16);
  for (const t of speakingTasks)
    expect(t.steps).toHaveLength(oralFunctions.length);
  for (const t of writingTasks) expect(t.prompt.length).toBeGreaterThan(100);
});

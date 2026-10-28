import { z } from "zod";
export const skillSchema = z.enum([
  "listening",
  "speaking",
  "reading",
  "writing",
]);
const studyDate = z.iso
  .date()
  .refine(
    (d) => d >= "2020-01-01" && d <= "2100-12-31",
    "Fecha fuera de rango",
  );
export const planInput = z
  .object({
    id: z.uuid(),
    start_date: studyDate,
    exam_date: studyDate.nullable(),
    weekly_minutes: z.union([z.literal(360), z.literal(390), z.literal(420)]),
  })
  .strict()
  .refine((x) => !x.exam_date || x.exam_date >= x.start_date, {
    message: "El examen no puede ser anterior al inicio",
  });
export const activityInput = z
  .object({
    id: z.uuid(),
    skill: skillSchema,
    minutes: z.number().int().min(1).max(180),
    studied_on: studyDate,
    note: z.string().max(500),
  })
  .strict();
export const readingInput = z
  .object({
    id: z.uuid(),
    kind: z.literal("reading"),
    version: z.literal("sensors-v1"),
    answers: z.array(z.number().int().min(0).max(2)).length(4),
  })
  .strict();
export const writingInput = z
  .object({
    id: z.uuid(),
    kind: z.literal("writing"),
    version: z.literal("public-services-v1"),
    text: z.string().trim().min(30).max(30000),
  })
  .strict();
export const submissionInput = z.discriminatedUnion("kind", [
  readingInput,
  writingInput,
]);
export type PlanInput = z.infer<typeof planInput>;
export type Activity = z.infer<typeof activityInput>;
export type Submission = z.infer<typeof submissionInput>;
export function addDays(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function allocation(total: 360 | 390 | 420) {
  return {
    speaking: total - 210,
    writing: 80,
    reading: 60,
    listening: 40,
    review: 30,
  };
}
export function buildPlan(input: PlanInput) {
  return Array.from({ length: 36 }, (_, i) => ({
    week: i + 1,
    starts: addDays(input.start_date, i * 7),
    phase:
      i < 4
        ? "Diagnóstico y bases"
        : i < 12
          ? "Desarrollo hacia 2+"
          : i < 24
            ? "Funciones de nivel 3"
            : i < 32
              ? "Consolidación y transferencia"
              : "Simulacros y revisión",
    minutes: allocation(input.weekly_minutes),
    afterExam: Boolean(
      input.exam_date && addDays(input.start_date, i * 7) > input.exam_date,
    ),
  }));
}
export function activitySummary(activities: Activity[], today: string) {
  const from = addDays(today, -6);
  const unique = [...new Map(activities.map((a) => [a.id, a])).values()].filter(
    (a) => a.studied_on <= today,
  );
  return {
    total: unique.reduce((n, a) => n + a.minutes, 0),
    lastSevenDays: unique
      .filter((a) => a.studied_on >= from)
      .reduce((n, a) => n + a.minutes, 0),
    days: new Set(
      unique.filter((a) => a.studied_on >= from).map((a) => a.studied_on),
    ).size,
  };
}

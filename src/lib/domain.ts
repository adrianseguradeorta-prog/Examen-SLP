import { z } from "zod";
export const skills = ["listening", "speaking", "reading", "writing"] as const;
export type Skill = (typeof skills)[number];
export const draftSchema = z.object({
  id: z.uuid(),
  revision: z.number().int().nonnegative(),
  text: z.string().max(30000),
  task: z.string().min(1).max(200),
});
export const evaluationSchema = z
  .object({
    skill: z.enum(skills),
    level: z.enum(["below_2", "2", "2+", "3"]).nullable(),
    assisted: z.boolean(),
    integrity: z.enum(["complete", "interrupted"]),
    date: z.iso.datetime(),
    topic: z.string().min(1),
    evidence: z.array(
      z.object({
        criterion: z.string().min(1),
        sourceId: z.string().min(1),
        quote: z.string().min(1),
      }),
    ),
  })
  .strict();
export type Evaluation = z.infer<typeof evaluationSchema>;
// Conservative product guard, not an official STANAG grading algorithm.
export function longitudinalLevel(
  items: Evaluation[],
  now: Date,
  skill: Skill = "speaking",
): "3" | null {
  items = items.filter((x) => x.skill === skill);
  const usable = items.filter(
    (x) =>
      x.level === "3" &&
      !x.assisted &&
      x.integrity === "complete" &&
      x.evidence.length > 0 &&
      Date.parse(x.date) <= +now &&
      +now - Date.parse(x.date) <= 42 * 86400000,
  );
  const dates = [...new Set(usable.map((x) => x.date.slice(0, 10)))].sort();
  const required = ["argumentation", "hypothesis", "cohesion"];
  if (
    usable.length < 3 ||
    dates.length < 3 ||
    new Set(usable.map((x) => x.topic)).size < 3 ||
    Date.parse(dates.at(-1)!) - Date.parse(dates[0]) < 14 * 86400000
  )
    return null;
  if (
    items.some(
      (x) =>
        !x.assisted &&
        x.integrity === "complete" &&
        x.level !== null &&
        x.level !== "3" &&
        Date.parse(x.date) >= Date.parse(dates[0]) &&
        Date.parse(x.date) <= +now,
    )
  )
    return null;
  return required.every(
    (c) =>
      usable.filter((x) => x.evidence.some((e) => e.criterion === c)).length >=
      2,
  )
    ? "3"
    : null;
}
export function planWeek(weakness: Skill = "speaking") {
  const minutes: Record<Skill | "review", number> = {
    speaking: 180,
    writing: 80,
    reading: 60,
    listening: 40,
    review: 30,
  };
  if (weakness !== "speaking") {
    minutes.speaking -= 30;
    minutes[weakness] += 30;
  }
  return minutes;
}
export function wordCount(text: string) {
  return text.trim().match(/\S+/gu)?.length ?? 0;
}
export function examinerInstructions(
  mode: "teacher" | "examiner" | "challenging",
) {
  const base =
    "You are an English STANAG 6001 practice partner, not an official certifier. Speak English. Ask one question at a time. Let the learner finish. Adapt follow-up questions to what they actually said. Explore narration, argument, hypothesis and unfamiliar abstract topics. Never invent their statements.";
  return (
    base +
    (mode === "teacher"
      ? " Teach after the learner finishes a complete response. Give at most two actionable corrections and ask for a new attempt. Do not constantly interrupt."
      : " Do not correct, translate, teach, give hints, supply vocabulary or finish sentences, even if asked. Do not announce a grade. " +
        (mode === "challenging"
          ? "Challenge arguments respectfully with relevant objections, changed assumptions and consequences; never test specialist factual knowledge."
          : "Probe and change topics to obtain independent evidence."))
  );
}

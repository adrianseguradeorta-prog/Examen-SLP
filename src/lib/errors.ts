import { z } from "zod";
import { skillSchema } from "./training";
export const categories = [
  "grammar",
  "vocabulary",
  "collocation",
  "pronunciation",
  "fluency",
  "register",
  "cohesion",
  "argumentation",
  "comprehension",
] as const;
export const observationInput = z
  .object({
    id: z.uuid(),
    pattern_id: z.uuid(),
    pattern: z.string().trim().min(3).max(160),
    category: z.enum(categories),
    skill: skillSchema,
    session_ref: z.string().trim().min(3).max(120),
    occurred_on: z.iso.date(),
    outcome: z.enum(["error", "correct"]),
    example: z.string().trim().min(3).max(2000),
    assisted: z.boolean(),
  })
  .strict();
export type Observation = z.infer<typeof observationInput>;
export type Pattern = {
  id: string;
  pattern: string;
  category: (typeof categories)[number];
};
export function errorProgress(events: Observation[], today: string) {
  const valid = [
    ...new Map(
      events.filter((e) => e.occurred_on <= today).map((e) => [e.id, e]),
    ).values(),
  ];
  const failures = valid.filter((e) => e.outcome === "error");
  const last = failures
    .map((e) => e.occurred_on)
    .sort()
    .at(-1);
  const successes = valid.filter(
    (e) =>
      e.outcome === "correct" && !e.assisted && (!last || e.occurred_on > last),
  );
  const independent = new Set(
    successes.map((e) =>
      e.session_ref.trim().toLowerCase().replace(/\s+/g, " "),
    ),
  );
  const dates = successes.map((e) => e.occurred_on).sort();
  const duration = dates.length
    ? (Date.parse(dates.at(-1)!) - Date.parse(dates[0])) / 86400000
    : 0;
  let status: "NEW" | "RECURRING" | "IMPROVING" | "CONTROLLED" = "NEW";
  if (
    new Set(
      failures.map((e) =>
        e.session_ref.trim().toLowerCase().replace(/\s+/g, " "),
      ),
    ).size >= 2
  )
    status = "RECURRING";
  if (failures.length && successes.length >= 3 && independent.size >= 2)
    status = "IMPROVING";
  if (
    failures.length &&
    successes.length >= 5 &&
    independent.size >= 3 &&
    duration >= 14
  )
    status = "CONTROLLED";
  return {
    status,
    frequency: failures.length,
    first: failures.map((e) => e.occurred_on).sort()[0] ?? null,
    last: last ?? null,
    correctSinceLast: successes.length,
    independentSessions: independent.size,
  };
}
const prompts: Record<(typeof categories)[number], string> = {
  grammar:
    "Describe a past decision, explain its consequences and consider what would have happened under different conditions.",
  vocabulary:
    "Explain a current policy using precise everyday language, then reformulate two vague expressions.",
  collocation:
    "Explain a professional challenge and use the expression you are practising in two different contexts.",
  pronunciation:
    "Record a short explanation, listen for intelligibility and compare the difficult phrase with a reliable audio model. A transcript cannot assess pronunciation.",
  fluency:
    "Develop one answer for two minutes. Pause to organise your ideas instead of filling every silence.",
  register:
    "Explain the same proposal to a colleague and then to a formal committee. Adapt your language to the audience.",
  cohesion:
    "Give a recommendation, support it with two reasons, acknowledge an objection and explain how it affects your conclusion.",
  argumentation:
    "Defend a policy, consider the strongest objection and explain under which conditions you would change your position.",
  comprehension:
    "Read a new passage, identify one implication and quote the words that support your interpretation.",
};
export function recommendPractice(
  patterns: Pattern[],
  observations: Observation[],
  today: string,
) {
  return patterns
    .map((p) => ({
      ...p,
      ...errorProgress(
        observations.filter((o) => o.pattern_id === p.id),
        today,
      ),
      prompt: prompts[p.category],
    }))
    .filter((p) => p.status !== "CONTROLLED" && p.frequency > 0)
    .sort(
      (a, b) =>
        Number(b.status === "RECURRING") - Number(a.status === "RECURRING") ||
        b.frequency - a.frequency ||
        (b.last ?? "").localeCompare(a.last ?? ""),
    )
    .slice(0, 3);
}

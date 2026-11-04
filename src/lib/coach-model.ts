import { z } from "zod";
import { skillSchema } from "./training";
export const skills = ["speaking", "writing", "reading", "listening"] as const;
export type Skill = (typeof skills)[number];
const levels = z.enum(["unknown", "0", "0+", "1", "1+", "2", "2+", "3", "3+", "4", "4+", "5"]);
const profileLevels = z.object({ listening: levels, speaking: levels, reading: levels, writing: levels }).strict();
export const profileSchema = z.object({
  declared: profileLevels, target: profileLevels,
  examDate: z.iso.date().nullable(),
  weeklyMinutes: z.number().int().min(30).max(1260),
  priority: skillSchema,
  timeZone: z.string().max(100).refine(value => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; }
  }, "Zona horaria inválida"),
  days: z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(x => new Set(x).size === x.length),
}).strict();
export type Profile = z.infer<typeof profileSchema>;
export const defaultProfile: Profile = {
  declared: { listening: "3", speaking: "2", reading: "2", writing: "2" },
  target: { listening: "3", speaking: "3", reading: "3", writing: "3" },
  examDate: null, weeklyMinutes: 390, priority: "speaking", timeZone: "Europe/Madrid", days: [1,2,3,4,5,6],
};
const minutes = z.number().int().min(0).max(1260);
export const budgetSchema = z.object({ speaking: minutes, writing: minutes, reading: minutes, listening: minutes, review: minutes }).strict();
export type Budget = z.infer<typeof budgetSchema>;
const reviewSchema = z.object({ id: z.uuid(), date: z.iso.date(), mode: z.enum(["recognition", "production"]), correct: z.boolean(), assisted: z.boolean(), example: z.string().max(2000), context: z.string().max(200), }).strict();
export type Review = z.infer<typeof reviewSchema>;
export const vocabularySchema = z.object({
  id: z.uuid(), expression: z.string().trim().min(2).max(200), note: z.string().trim().min(2).max(2000),
  example: z.string().max(2000), topic: z.string().max(100), createdOn: z.iso.date(),
  patternId: z.uuid().nullable(), validatedByUser: z.boolean(),
  reviews: z.array(reviewSchema).max(2000),
}).strict().refine(x => (!x.patternId || x.validatedByUser) && new Set(x.reviews.map(r => r.id)).size === x.reviews.length && x.reviews.every((r,i) => r.date >= x.createdOn && (!i || r.date >= x.reviews[i-1].date)), "Historial SRS inválido");
export type Vocabulary = z.infer<typeof vocabularySchema>;
export const weekSchema = z.object({
  id: z.uuid(), week: z.iso.date(), createdAt: z.iso.datetime(), profileId: z.uuid().nullable(), basePlanId: z.uuid().nullable(),
  previousId: z.uuid().nullable(), policy: z.literal("rules-v1"),
  before: budgetSchema, budget: budgetSchema, available: minutes,
  reasons: z.array(z.string().max(2000)).max(20), evidence: z.array(z.string().max(300)).max(100),
  status: z.enum(["accepted", "rejected", "reverted"]),
}).strict().refine(x => Object.values(x.budget).reduce((a,b)=>a+b,0) === x.available, "Presupuesto incoherente");
export type WeekVersion = z.infer<typeof weekSchema>;
export const coachSchema = z.object({
  version: z.literal(1), owner: z.string().min(1).max(200), revision: z.number().int().nonnegative(),
  profiles: z.array(z.object({ id: z.uuid(), createdAt: z.iso.datetime(), value: profileSchema }).strict()).max(500),
  weeks: z.array(weekSchema).max(1000), vocabulary: z.array(vocabularySchema).max(1000),
}).strict().superRefine((s,ctx)=>{
  for (const rows of [s.profiles,s.weeks,s.vocabulary]) if(new Set(rows.map(r=>r.id)).size!==rows.length) ctx.addIssue({code:"custom",message:"Identificadores repetidos"});
});
export type Coach = z.infer<typeof coachSchema>;
export const emptyCoach = (owner: string): Coach => ({ version: 1, owner, revision: 0, profiles: [], weeks: [], vocabulary: [] });
export function currentProfile(c: Coach): Profile { return c.profiles.at(-1)?.value ?? defaultProfile; }
export function localDate(now: Date, timeZone: string) { return new Intl.DateTimeFormat("en-CA", { timeZone, year:"numeric",month:"2-digit",day:"2-digit" }).format(now); }

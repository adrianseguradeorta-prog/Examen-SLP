import type { TrainingData } from "@/components/use-training";
import type { ErrorData } from "@/components/error-bank";
import { addDays, allocation } from "./training";
import { nextTask, taskHref, taskState } from "./task-rotation";
import { diagnosticOrder, diagnosticSummary } from "./diagnostic-summary";

const tasks = {
  listening: {
    title: "Escucha y justifica las inferencias del anuncio",
    href: "/listening",
    minutes: 10,
  },
  speaking: {
    title: "Defiende una postura en voz alta",
    href: "/speaking#practice",
    minutes: 15,
  },
  writing: {
    title: "Escribe una recomendación y una objeción",
    href: "/writing",
    minutes: 20,
  },
  reading: {
    title: "Justifica una inferencia con evidencia del texto",
    href: "/library#reading",
    minutes: 10,
  },
};
export function nextPractice(
  data: TrainingData | null,
  errors: ErrorData | null,
  today: string,
) {
  const fallback = {
    ...tasks.speaking,
    skill: "speaking",
    reason:
      "Sin historial suficiente: propuesta general centrada en Speaking. No identifica una debilidad ni estima un nivel.",
    week: null as number | null,
    focus: null as string | null,
  };
  if (
    !data ||
    data.warnings?.length ||
    data.activities.length >= 1000 ||
    data.submissions.length >= 50
  )
    return fallback;
  const plan = data.plans[0];
  if (
    plan &&
    (today < plan.start_date ||
      (plan.exam_date && today > plan.exam_date) ||
      today >= addDays(plan.start_date, 252))
  )
    return {
      ...fallback,
      reason:
        "Tu calendario aún no ha empezado o ya ha terminado. Revisa las fechas en Plan; mientras tanto puedes hacer esta práctica breve.",
    };
  const week = plan
    ? Math.floor(
        (Date.parse(today) - Date.parse(plan.start_date)) / (7 * 86400000),
      ) + 1
    : null;
  const from = plan
    ? addDays(plan.start_date, (week! - 1) * 7)
    : addDays(today, -6);
  const activities = [
    ...new Map(data.activities.map((a) => [a.id, a])).values(),
  ].filter((a) => a.studied_on >= from && a.studied_on <= today);
  const summaries = diagnosticSummary(data);
  const missing = diagnosticOrder.find(
    (skill) =>
      !data.submissions.some(
        (s) => s.payload.kind === skill && s.created_at.slice(0, 10) <= today,
      ),
  );
  if (missing)
    return {
      ...fallback,
      title: `Completa tu muestra de ${missing}`,
      href: taskHref(missing, nextTask(data, missing).version),
      skill: missing,
      minutes: missing === "writing" ? 20 : 10,
      week,
      reason: `Falta la muestra de ${missing}. Completa esta tarea para ampliar la evidencia inicial. El perfil sigue siendo declarado: evidencia insuficiente para estimar un SLP.`,
    };
  const gap = summaries.find(
    (s) =>
      (s.skill === "reading" || s.skill === "listening") &&
      s.gaps.length &&
      s.last &&
      !data.activities.some(
        (a) =>
          a.skill === s.skill &&
          a.studied_on >= s.last!.created_at.slice(0, 10) &&
          a.studied_on <= today,
      ),
  );
  if (gap && (gap.skill === "reading" || gap.skill === "listening"))
    return {
      ...fallback,
      ...tasks[gap.skill],
      href: taskHref(gap.skill, gap.last!.payload.version),
      skill: gap.skill,
      week,
      reason: `En la última muestra de ${gap.skill}: ${gap.gaps.map((g) => `${g.missed} de ${g.total} preguntas falladas de ${g.type}`).join("; ")}. Revisa esas explicaciones y registra tu práctica. Evidencia limitada a esta tarea; repetirla es repaso, no diagnóstico nuevo.`,
    };
  const target = allocation(plan?.weekly_minutes ?? 390);
  const totals = { speaking: 0, writing: 0, reading: 0, listening: 0 };
  for (const a of activities)
    if (a.skill in totals) totals[a.skill as keyof typeof totals] += a.minutes;
  const skill = (["speaking", "writing", "reading", "listening"] as const)
    .filter((s) => totals[s] < target[s])
    .sort((a, b) => totals[a] / target[a] - totals[b] / target[b])[0];
  if (!skill)
    return {
      ...fallback,
      title: "Revisa los ejemplos de tu Error Bank",
      href: "/errors",
      minutes: 5,
      week,
      reason:
        "Has registrado la carga propuesta de Speaking, Writing, Reading y Listening para este periodo. Repaso opcional; no aumentamos la carga ni deducimos un nivel por minutos.",
    };
  const pattern = !errors?.truncated
    ? errors?.recommendations.find((p) =>
        errors.observations.some(
          (o) =>
            o.pattern_id === p.id &&
            o.skill === skill &&
            o.occurred_on <= today,
        ),
      )
    : null;
  const selected = nextTask(data, skill);
  const state = taskState(data, skill, selected.version);
  return {
    ...tasks[skill],
    title: selected.title,
    href: taskHref(skill, selected.version),
    skill,
    week,
    minutes: Math.min(tasks[skill].minutes, target[skill] - totals[skill]),
    reason: `${totals[skill]} de ${target[skill]} minutos declarados de ${skill} ${week ? `en la semana ${week}` : "en los últimos siete días (propuesta base)"}. ${state}: ${selected.title}. Se prioriza el reparto del tiempo y material pendiente, no una supuesta nota. El plan sigue siendo provisional.`,
    focus: pattern ? `${pattern.pattern}: ${pattern.prompt}` : null,
  };
}

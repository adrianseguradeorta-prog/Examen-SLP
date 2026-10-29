import type { TrainingData } from "@/components/use-training";
import type { ErrorData } from "@/components/error-bank";
import { addDays, allocation } from "./training";
import { diagnosticReading } from "./diagnostic-content";

const tasks = {
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
  const reading = data.submissions
    .filter(
      (s) => s.payload.kind === "reading" && s.created_at.slice(0, 10) <= today,
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  if (!reading)
    return {
      ...fallback,
      title: "Empieza con la muestra breve de Reading",
      href: "/diagnostic",
      skill: "reading",
      minutes: 10,
      week,
      reason:
        "Todavía no hay una muestra de Reading guardada. Cuatro preguntas con explicación; después pasa a Speaking. No determina tu SLP.",
    };
  const missed =
    reading.report.items?.flatMap((item, i) =>
      !item.correct && diagnosticReading.questions[i]
        ? [diagnosticReading.questions[i].type]
        : [],
    ) ?? [];
  if (
    missed.length &&
    !data.activities.some(
      (a) =>
        a.skill === "reading" &&
        a.studied_on >= reading.created_at.slice(0, 10) &&
        a.studied_on <= today,
    )
  )
    return {
      ...fallback,
      ...tasks.reading,
      skill: "reading",
      week,
      reason: `En tu primera muestra fallaste: ${missed.join(", ")}. Practica otra lectura y registra lo trabajado; una muestra no demuestra una carencia estable.`,
    };
  const target = allocation(plan?.weekly_minutes ?? 390);
  const totals = { speaking: 0, writing: 0, reading: 0 };
  for (const a of activities)
    if (a.skill in totals) totals[a.skill as keyof typeof totals] += a.minutes;
  const skill = (Object.keys(tasks) as (keyof typeof tasks)[])
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
        "Has registrado la carga propuesta de Speaking, Writing y Reading para este periodo. Repaso opcional; no aumentamos la carga ni deducimos un nivel por minutos.",
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
  return {
    ...tasks[skill],
    skill,
    week,
    minutes: Math.min(tasks[skill].minutes, target[skill] - totals[skill]),
    reason: `${totals[skill]} de ${target[skill]} minutos declarados de ${skill} ${week ? `en la semana ${week}` : "en los últimos siete días (propuesta base)"}. Se prioriza el reparto del tiempo, no una supuesta nota.`,
    focus: pattern ? `${pattern.pattern}: ${pattern.prompt}` : null,
  };
}

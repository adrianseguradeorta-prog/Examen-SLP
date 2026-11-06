import type { TrainingData } from "@/components/use-training";
import type { ErrorData } from "@/components/error-bank";
import {
  skills,
  currentProfile,
  type Budget,
  type Coach,
  type Profile,
  type WeekVersion,
} from "./coach-model";
import { addDays } from "./training";
import {
  independentSamples,
  nextTask,
  taskHref,
  taskState,
} from "./task-rotation";
import { comprehensionTask } from "./task-catalog";
import { diagnosticOrder } from "./diagnostic-summary";
import { nextPractice } from "./daily-practice";
import { dueVocabulary } from "./srs";
export const budgetKeys = [...skills, "review"] as const;
const minimum: Budget = {
  speaking: 150,
  writing: 80,
  reading: 60,
  listening: 40,
  review: 30,
};
export const sumBudget = (b: Budget) =>
  Object.values(b).reduce((a, b) => a + b, 0);
export function scaleBudget(b: Budget, total: number): Budget {
  const sum = sumBudget(b);
  const values = budgetKeys.map((k) => ({
    k,
    raw: sum ? (b[k] * total) / sum : total / 5,
  }));
  const out = Object.fromEntries(
    values.map((x) => [x.k, Math.floor(x.raw)]),
  ) as Budget;
  let rest = total - sumBudget(out);
  for (const x of values.sort((a, b) => (b.raw % 1) - (a.raw % 1))) {
    if (rest-- <= 0) break;
    out[x.k]++;
  }
  return out;
}
export function baseBudget(profile: Profile): Budget {
  if (profile.weeklyMinutes < 360)
    return scaleBudget(minimum, profile.weeklyMinutes);
  return {
    ...minimum,
    [profile.priority]: minimum[profile.priority] + profile.weeklyMinutes - 360,
  };
}
export function weekStart(data: TrainingData, today: string) {
  const start = data.plans[0]?.start_date;
  if (start && today >= start && today < addDays(start, 252))
    return addDays(
      start,
      Math.floor((Date.parse(today) - Date.parse(start)) / 604800000) * 7,
    );
  const weekday = new Date(today + "T12:00:00Z").getUTCDay();
  return addDays(today, -((weekday + 6) % 7));
}
export function observedGaps(data: TrainingData, today: string) {
  return (["reading", "listening"] as const).flatMap((skill) => {
    const last = independentSamples(data, skill)
      .filter(
        (s) =>
          s.created_at.slice(0, 10) <= today &&
          s.created_at.slice(0, 10) >= addDays(today, -56),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 2);
    if (last.length < 2) return [];
    const failedTypes = last.map((s) => {
      const task = comprehensionTask(skill, s.payload.version);
      if (
        !task ||
        !s.report.items ||
        s.report.items.length !== task.questions.length
      )
        return [];
      return task.questions
        .filter((_, i) => !s.report.items![i].correct)
        .map((q) => q.type);
    });
    const types = [...new Set(failedTypes[0])].filter((t) =>
      failedTypes[1].includes(t),
    );
    return types.length
      ? [
          {
            skill,
            types,
            ids: last.map((s) => s.id),
            reason: `Las dos últimas muestras independientes de ${skill} (últimas 8 semanas) contienen errores de ${types.join(", ")}. Evidencia limitada a esas tareas; no estima SLP.`,
          },
        ]
      : [];
  });
}
export function effectiveProfile(coach: Coach, data: TrainingData): Profile {
  return coach.profiles.length
    ? currentProfile(coach)
    : {
        ...currentProfile(coach),
        weeklyMinutes: data.plans[0]?.weekly_minutes ?? 390,
        examDate: data.plans[0]?.exam_date ?? null,
      };
}
export function activeWeek(coach: Coach, data: TrainingData, today: string) {
  return [...coach.weeks]
    .reverse()
    .find(
      (w) =>
        w.week === weekStart(data, today) &&
        w.profileId === (coach.profiles.at(-1)?.id ?? null) &&
        w.basePlanId === (data.plans[0]?.id ?? null) &&
        w.status !== "rejected",
    );
}
export function weeklyTotals(data: TrainingData, today: string): Budget {
  const from = weekStart(data, today);
  const totals: Budget = {
    speaking: 0,
    writing: 0,
    reading: 0,
    listening: 0,
    review: 0,
  };
  for (const a of new Map(data.activities.map((a) => [a.id, a])).values())
    if (a.studied_on >= from && a.studied_on <= today)
      totals[a.skill] += a.minutes;
  return totals;
}
export function proposeWeek(coach: Coach, data: TrainingData, today: string) {
  const profile = effectiveProfile(coach, data),
    base = baseBudget(profile),
    previous = activeWeek(coach, data, today);
  // Compare against the base, not the last adaptation: accepting repeatedly cannot ratchet allocations.
  const budget = { ...base },
    totals = weeklyTotals(data, today);
  const reasons = [
      "Propuesta interna rules-v1. Conserva el historial; solo orienta trabajo futuro. No recupera automáticamente semanas perdidas.",
    ],
    evidence: string[] = [];
  const partial =
    !!data.warnings?.length ||
    data.submissions.length >= 50 ||
    data.activities.length >= 1000;
  const outside = !!(
    (data.plans[0] &&
      (today < data.plans[0].start_date ||
        today >= addDays(data.plans[0].start_date, 252))) ||
    (profile.examDate && today > profile.examDate)
  );
  if (profile.weeklyMinutes < 360)
    reasons.push(
      "Disponibilidad inferior a 360 min: mínimos base reducidos proporcionalmente, sin aumentar tus horas.",
    );
  let allowance = Math.min(20, Math.floor(profile.weeklyMinutes * 0.1));
  if (partial || outside)
    reasons.push(
      "Evidencia insuficiente o calendario fuera del periodo: se mantiene el reparto provisional; revisa fechas e historial.",
    );
  else {
    for (const gap of observedGaps(data, today)) {
      const donor = skills
        .filter((s) => s !== gap.skill)
        .sort(
          (a, b) =>
            budget[b] -
            Math.max(minimum[b], totals[b]) -
            (budget[a] - Math.max(minimum[a], totals[a])),
        )[0];
      const amount = Math.max(
        0,
        Math.min(
          allowance,
          budget[donor] - Math.max(minimum[donor], totals[donor]),
        ),
      );
      if (amount) {
        budget[donor] -= amount;
        budget[gap.skill] += amount;
        allowance -= amount;
      }
      reasons.push(
        `${amount ? `+${amount} min ${gap.skill}; −${amount} min ${donor} de margen flexible, sin atribuir mejora a esa destreza.` : `Sin margen para añadir minutos a ${gap.skill}; trabaja esa función dentro de su bloque.`} ${gap.reason}`,
      );
      evidence.push(...gap.ids);
    }
    for (const skill of ["reading", "listening"] as const)
      if (!observedGaps(data, today).some((g) => g.skill === skill))
        reasons.push(
          `Se mantiene ${skill}: evidencia insuficiente de dificultad repetida para modificar su carga. Una muestra o un buen porcentaje no permiten reducirla.`,
        );
  }
  // Completed work stays immutable; over-practice must not erase another skill's minimum.
  if (sumBudget(totals) >= profile.weeklyMinutes)
    reasons.push(
      "Ya has registrado tu disponibilidad actual. No se propone carga adicional ni se borra actividad.",
    );
  else if (skills.some((skill) => totals[skill] > budget[skill]))
    reasons.push(
      "Hay destrezas con más minutos registrados que su bloque. Se conservan los mínimos como referencia; Hoy limita cada sesión al saldo semanal real, sin exigir recuperar la diferencia.",
    );
  return {
    week: weekStart(data, today),
    before: previous?.budget ?? base,
    budget,
    available: profile.weeklyMinutes,
    reasons,
    evidence: [...new Set(evidence)],
    profileId: coach.profiles.at(-1)?.id ?? null,
    basePlanId: data.plans[0]?.id ?? null,
    previousId: previous?.id ?? null,
    policy: "rules-v1" as const,
  };
}
export function decideWeek(
  coach: Coach,
  proposal: ReturnType<typeof proposeWeek>,
  status: "accepted" | "rejected",
  id: string,
  now: string,
): Coach {
  return {
    ...coach,
    weeks: [...coach.weeks, { ...proposal, id, createdAt: now, status }],
  };
}
export function revertWeek(
  coach: Coach,
  data: TrainingData,
  today: string,
  id: string,
  now: string,
): Coach {
  const active = activeWeek(coach, data, today);
  if (!active) throw Error("No hay semana aceptada para revertir.");
  const previous = coach.weeks.find((w) => w.id === active.previousId);
  const budget = previous?.budget ?? baseBudget(effectiveProfile(coach, data));
  const row: WeekVersion = {
    ...active,
    id,
    createdAt: now,
    status: "reverted",
    previousId: active.id,
    before: active.budget,
    budget,
    available: sumBudget(budget),
    reasons: [
      "Vuelta explícita al reparto anterior; no se modifica ninguna actividad.",
    ],
    evidence: [],
  };
  return { ...coach, weeks: [...coach.weeks, row] };
}
export function adaptivePractice(
  data: TrainingData | null,
  errors: ErrorData | null,
  coach: Coach,
  today: string,
) {
  const fallback = nextPractice(data, errors, today);
  if (
    !data ||
    data.warnings?.length ||
    data.submissions.length >= 50 ||
    data.activities.length >= 1000
  )
    return fallback;
  const profile = effectiveProfile(coach, data),
    totals = weeklyTotals(data, today);
  const budget = activeWeek(coach, data, today)?.budget ?? baseBudget(profile);
  const remaining = Math.max(0, profile.weeklyMinutes - sumBudget(totals));
  if (!remaining)
    return {
      ...fallback,
      title: "Carga semanal registrada",
      href: "/plan#adaptive",
      minutes: 0,
      reason:
        "Ya registraste tu disponibilidad semanal. Revisa la semana o descansa; no acumulamos trabajo perdido ni inferimos mejora por minutos.",
    };
  const bounded = (value: typeof fallback) => ({
    ...value,
    minutes: Math.min(value.minutes, remaining),
    reason: `Te propongo esto porque… ${value.reason}`,
  });
  if (
    diagnosticOrder.some(
      (s) =>
        !data.submissions.some(
          (r) => r.payload.kind === s && r.created_at.slice(0, 10) <= today,
        ),
    )
  )
    return bounded(fallback);
  const outside = !!(
    (data.plans[0] &&
      (today < data.plans[0].start_date ||
        today >= addDays(data.plans[0].start_date, 252))) ||
    (profile.examDate && today > profile.examDate)
  );
  if (outside)
    return bounded({
      ...fallback,
      reason:
        "Calendario fuera de periodo: revisa el perfil y Plan. Práctica provisional; no se adapta una semana cerrada.",
    });
  const recurrent = !errors?.truncated
    ? errors?.recommendations.find(
        (p) =>
          p.status === "RECURRING" &&
          p.last &&
          !errors.observations.some(
            (o) =>
              o.pattern_id === p.id &&
              o.occurred_on === today &&
              o.outcome === "correct" &&
              !o.assisted,
          ),
      )
    : null;
  if (recurrent)
    return bounded({
      ...fallback,
      title: `Repara: ${recurrent.pattern}`,
      href: "/errors",
      minutes: 5,
      reason: `Has registrado errores en al menos dos sesiones: ${recurrent.pattern}. Revisa el ejemplo y registra una oportunidad real, sin confundir corrección con dominio.`,
      focus: recurrent.prompt,
    });
  const due = dueVocabulary(coach.vocabulary, today);
  if (due.length)
    return bounded({
      ...fallback,
      title: "Recupera una expresión sin mirar",
      href: "/vocabulary",
      minutes: 5,
      reason: `Hay ${due.length} revisión(es) vencida(s). Reconocer y producir se registran por separado.`,
      focus: null,
    });
  const gap = observedGaps(data, today).find(
    (g) =>
      !data.activities.some(
        (a) => a.skill === g.skill && a.studied_on === today,
      ),
  );
  const skill =
    (gap && totals[gap.skill] < budget[gap.skill] ? gap.skill : undefined) ??
    [...skills]
      .sort(
        (a, b) =>
          totals[a] / Math.max(1, budget[a]) -
          totals[b] / Math.max(1, budget[b]),
      )
      .find((s) => totals[s] < budget[s]) ??
    undefined;
  if (!skill)
    return bounded({
      ...fallback,
      title: "Repaso dentro del tiempo disponible",
      href: "/vocabulary",
      minutes: 5,
      focus: null,
      reason:
        "Ya cubriste los bloques de las cuatro destrezas. Queda margen de repaso; no se añaden horas ni se interpreta como mejora.",
    });
  const task = nextTask(data, skill);
  const weekday = new Date(today + "T12:00:00Z").getUTCDay();
  return bounded({
    ...fallback,
    skill,
    title: task.title,
    href: taskHref(skill, task.version),
    minutes: Math.min(
      skill === "writing" ? 20 : 15,
      Math.max(1, budget[skill] - totals[skill]),
    ),
    focus: null,
    reason:
      gap?.reason ??
      `${totals[skill]} de ${budget[skill]} min registrados de ${skill}. ${taskState(data, skill, task.version)}. ${activeWeek(coach, data, today) ? "Semana aceptada" : "Plan provisional: evidencia insuficiente para estimar nivel"}. ${profile.days.includes(weekday) ? "" : "Hoy no es un día habitual de tu perfil; práctica opcional, sin trasladar deuda."}`,
  });
}

import type { TrainingData } from "@/components/use-training";
import { comprehensionTask } from "./task-catalog";
import { independentSamples } from "./task-rotation";
export const diagnosticOrder = [
  "reading",
  "writing",
  "listening",
  "speaking",
] as const;
export const declaredProfile = {
  listening: "3",
  speaking: "2",
  reading: "2",
  writing: "2",
} as const;
export function diagnosticSummary(data: TrainingData | null) {
  const incomplete =
    !data || Boolean(data.warnings?.length) || data.submissions.length >= 50;
  return diagnosticOrder.map((skill) => {
    const samples =
      data?.submissions
        .filter((s) => s.payload.kind === skill)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)) ?? [];
    const last = samples[0];
    const questions =
      last && (skill === "reading" || skill === "listening")
        ? (comprehensionTask(skill, last.payload.version)?.questions ?? [])
        : [];
    const groups = new Map<string, { missed: number; total: number }>();
    const compatible =
      !!last &&
      questions.length > 0 &&
      last.report.items?.length === questions.length;
    if (!incomplete && compatible)
      last.report.items?.forEach((item, i) => {
        const type = questions[i].type;
        const count = groups.get(type) ?? { missed: 0, total: 0 };
        count.total++;
        if (!item.correct) count.missed++;
        groups.set(type, count);
      });
    const gaps = [...groups.entries()]
      .filter(([, c]) => c.missed > 0)
      .map(([type, c]) => ({ type, ...c }));
    const taskResult =
      !incomplete && compatible
        ? {
            correct: last.report.items!.filter((item) => item.correct).length,
            total: questions.length,
          }
        : null;
    return {
      skill,
      declared: declaredProfile[skill],
      estimatedLevel: null,
      status: incomplete
        ? "Evidencia insuficiente"
        : !last
          ? "Sin muestra"
          : skill === "writing"
            ? "Pendiente de revisión"
            : skill === "speaking"
              ? "Realización registrada · evidencia insuficiente"
              : compatible
                ? "Evidencia parcial"
                : "Evidencia insuficiente",
      sampleCount: samples.length,
      independentCount:
        data && !incomplete && (skill === "reading" || skill === "listening")
          ? independentSamples(data, skill).length
          : 0,
      last,
      gaps,
      taskResult,
      reason: incomplete
        ? "Historial no disponible o incompleto; se mantiene el plan provisional."
        : !last
          ? "Completa una muestra. No se puede estimar un nivel."
          : skill === "writing"
            ? "Texto entregado; falta revisión cualificada. No se evalúa por longitud o vocabulario."
            : skill === "speaking"
              ? "Se conserva la constancia y las notas, no el audio. No permite evaluar el rendimiento oral."
              : !compatible
                ? "Falta el detalle de la corrección de esta tarea. No se deduce un resultado ni un nivel."
                : "Resultado de una tarea breve no calibrada. Las repeticiones no son muestras independientes; evidencia insuficiente para estimar un SLP.",
    };
  });
}

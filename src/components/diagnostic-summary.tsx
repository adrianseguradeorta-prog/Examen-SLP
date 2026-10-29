import Link from "next/link";
import type { TrainingData } from "./use-training";
import { taskHref } from "@/lib/task-rotation";
import { diagnosticSummary } from "@/lib/diagnostic-summary";
export function DiagnosticSummary({ data }: { data: TrainingData | null }) {
  return (
    <section id="summary">
      <h2>Cuatro destrezas, evidencia separada</h2>
      <p>
        Perfil declarado 3.2.2.2 · objetivo 3.3.3.3. No es un resultado de esta
        aplicación. Estimación provisional:{" "}
        <strong>evidencia insuficiente</strong>. Nunca constituye certificación
        oficial.
      </p>
      <div className="two-col">
        {diagnosticSummary(data).map((s) => (
          <article className="card" key={s.skill}>
            <h3>{s.skill}</h3>
            <p>Declarado: {s.declared}</p>
            <strong>{s.status}</strong>
            <p>{s.reason}</p>
            {s.last && (
              <p className="small">
                Última entrega:{" "}
                {new Date(s.last.created_at).toLocaleDateString("es")} ·{" "}
                {s.last.payload.version} · {s.sampleCount} entrega(s)
              </p>
            )}
            {(s.skill === "reading" || s.skill === "listening") && (
              <p>
                {s.independentCount} material(es) distintos con primera entrega
                sin soluciones previas registradas. No demuestra nivel SLP;
                repeticiones y datos antiguos no se cuentan como evidencia
                independiente.
              </p>
            )}
            {s.taskResult && (
              <p>
                Tarea concreta: {s.taskResult.correct} / {s.taskResult.total}{" "}
                aciertos.
              </p>
            )}
            {s.gaps.map((g) => (
              <p key={g.type}>
                En la última muestra fallaste {g.missed} de {g.total} preguntas
                de {g.type}. Revisa la explicación y justifica la respuesta
                antes de continuar.
              </p>
            ))}
            <Link
              href={
                s.last
                  ? taskHref(s.skill, s.last.payload.version)
                  : s.skill === "listening"
                    ? "/listening"
                    : `/diagnostic#${s.skill}`
              }
            >
              {s.last ? "Revisar o repetir como práctica" : "Completar muestra"}{" "}
              →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

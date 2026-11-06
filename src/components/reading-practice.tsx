"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { readingTasks } from "@/lib/task-catalog";
import { useTraining } from "./use-training";
import { useTaskDraft } from "./use-task-draft";
import { TaskPicker, useOpenedTask } from "./task-picker";
export function ReadingPractice({
  local,
  owner,
  version,
  onSubmitted,
}: {
  local: boolean;
  owner: string;
  version: string;
  onSubmitted: () => Promise<void>;
}) {
  const task = readingTasks.find((t) => t.version === version)!;
  const { data, mutate } = useTraining(local, owner);
  const { draft, ready, message, edit, clearAfterConfirmed, restart } =
    useTaskDraft(owner, "reading", version);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const closed = !!data?.submissions.some((s) => s.id === draft?.id);
  const last = data?.submissions.find(
    (s) => s.payload.kind === "reading" && s.payload.version === version,
  );
  const warning = useOpenedTask(local, owner, "reading", version, !!data);
  useEffect(() => {
    if (closed) queueMicrotask(clearAfterConfirmed);
  }, [closed, clearAfterConfirmed]);
  return (
    <section className="card" id="reading">
      <div className="eyebrow">
        1 / READING · 10 MINUTOS · MATERIAL ORIGINAL NO CALIBRADO
      </div>
      <TaskPicker
        skill="reading"
        version={version}
        data={data}
        disabled={busy}
      />
      <h2>{task.title}</h2>
      <p lang="en" className="reading">
        {task.text}
      </p>
      {task.questions.map((q, i) => (
        <fieldset key={q.question}>
          <legend>
            {i + 1}. {q.question}
          </legend>
          {q.options.map((o, j) => (
            <label className="option" key={o}>
              <input
                type="radio"
                name={`reading-${i}`}
                disabled={!data || !ready || busy || closed}
                checked={data && draft ? draft.answers[i] === j : false}
                onChange={() =>
                  draft && edit({ answers: { ...draft.answers, [i]: j } })
                }
              />
              {o}
            </label>
          ))}
        </fieldset>
      ))}
      <p role="status">{error || message}</p>
      {warning && <p role="status">{warning}</p>}
      <button
        className="button"
        disabled={
          !data ||
          !ready ||
          busy ||
          closed ||
          Object.keys(draft?.answers ?? {}).length !== task.questions.length
        }
        onClick={async () => {
          if (!draft) return;
          setBusy(true);
          setError("");
          try {
            await mutate({
              action: "submission",
              data: {
                id: draft.id,
                kind: "reading",
                version,
                answers: task.questions.map((_, i) => draft.answers[i]),
                priorExposure: "none",
              },
            });
            clearAfterConfirmed();
            await onSubmitted();
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "No se pudo entregar. Tus respuestas siguen pendientes.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        Entregar muestra de Reading
      </button>
      {closed && (
        <p>
          Muestra entregada.{" "}
          <button className="text-button" onClick={restart}>
            Repetir como práctica
          </button>
        </p>
      )}
      <p className="small muted">
        Las respuestas pendientes se recuperan al volver. Si ya conoces las
        soluciones, repetir es práctica, no evidencia independiente. Usa una
        pestaña por tarea.
      </p>
      {last && (
        <div className="feedback">
          <h3>
            Última entrega: {last.report.correct} / {last.report.total}
          </h3>
          <p>
            {last.payload.kind === "reading" &&
            last.payload.priorExposure === "none"
              ? "Primera muestra de este material, sin soluciones previas registradas."
              : "Práctica o exposición previa desconocida; no añade evidencia independiente."}{" "}
            No determina un nivel SLP.
          </p>
          {last.report.items?.map((item, i) => (
            <p key={i}>
              <strong>
                {i + 1}. {item.correct ? "Correcto" : "Revisar"} · {item.type}
              </strong>{" "}
              — {item.explanation}
            </p>
          ))}
        </div>
      )}
      <p>
        <Link href="#writing">Continuar con Writing diagnóstico</Link> ·{" "}
        <Link href="/plan#activity">Registrar los minutos reales</Link>
      </p>
    </section>
  );
}

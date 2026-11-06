"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useTraining } from "./use-training";
import { LocalPracticeNotice } from "./local-practice-notice";
import { listeningTasks } from "@/lib/task-catalog";
import { useTaskDraft } from "./use-task-draft";
import { TaskPicker, useOpenedTask } from "./task-picker";
export function Listening({
  local,
  owner,
  version = "library-evenings-v1",
}: {
  local: boolean;
  owner: string;
  version?: string;
}) {
  const task = listeningTasks.find((t) => t.version === version)!;
  const { data, error, mutate } = useTraining(local, owner);
  const {
    draft,
    ready,
    message: draftMessage,
    edit,
    clearAfterConfirmed,
    restart,
  } = useTaskDraft(owner, "listening", version);
  const answers = draft?.answers ?? {};
  const warning = useOpenedTask(local, owner, "listening", version, !!data);
  const [plays, setPlays] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [transcriptViewed, setTranscriptViewed] = useState(false);
  const submitted = !!data?.submissions.some((s) => s.id === draft?.id);
  useEffect(() => {
    if (submitted) queueMicrotask(clearAfterConfirmed);
  }, [submitted, clearAfterConfirmed]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const player = useRef<HTMLAudioElement | null>(null);
  const last = data?.submissions.find(
    (s) => s.payload.kind === "listening" && s.payload.version === task.version,
  );
  return (
    <>
      {local && <LocalPracticeNotice />}
      <section className="card">
        <div className="eyebrow">3 / LISTENING · PRÁCTICA · 8–10 MINUTOS</div>
        <TaskPicker
          skill="listening"
          version={version}
          data={data}
          disabled={busy}
        />
        <h2>{task.title}</h2>
        <p>
          Audio sintético original del proyecto, breve y no calibrado. Escucha
          el anuncio completo y responde. Puedes pausar y repetir libremente.
          Esta actividad no reproduce condiciones oficiales ni es un modo
          examen.
        </p>
        <audio
          style={{ width: "100%" }}
          ref={player}
          controls
          preload="metadata"
          src={task.audio}
          aria-label={`Audio original: ${task.title}`}
          onPlay={() => setPlays((n) => n + 1)}
          onEnded={() => setCompleted((n) => n + 1)}
          onError={() =>
            setMessage(
              "No se pudo abrir el audio. Mantén la aplicación en marcha y recarga; no entregues sin escucharlo.",
            )
          }
        />
        <p className="small muted">
          Inicios/reanudaciones: {plays} · reproducciones que llegaron al final:{" "}
          {completed}. Son condiciones de práctica, no una garantía de escucha
          independiente.
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
                  name={`listening-${i}`}
                  disabled={!data || !ready || busy || submitted}
                  checked={!!data && answers[i] === j}
                  onChange={() => edit({ answers: { ...answers, [i]: j } })}
                />
                {o}
              </label>
            ))}
          </fieldset>
        ))}
        <button
          className="button"
          disabled={
            !data ||
            !ready ||
            busy ||
            submitted ||
            completed < 1 ||
            Object.keys(answers).length !== task.questions.length
          }
          onClick={async () => {
            if (!draft) return;
            setBusy(true);
            try {
              await mutate({
                action: "submission",
                data: {
                  id: draft.id,
                  kind: "listening",
                  priorExposure: "none",
                  version: task.version,
                  answers: task.questions.map((_, i) => answers[i]),
                  mode: "practice",
                  playCount: plays,
                  completedListens: completed,
                  transcriptViewed,
                  solutionsKnown: Boolean(last),
                },
              });
              clearAfterConfirmed();
              setMessage(
                "Respuestas y condiciones guardadas. Esta muestra aporta evidencia limitada, no un nivel SLP.",
              );
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "No se pudo guardar");
            } finally {
              setBusy(false);
            }
          }}
        >
          Entregar respuestas
        </button>
        <p role="status">{error || message}</p>
        <p role="status">{draftMessage}</p>
        {warning && <p role="status">{warning}</p>}
        <p className="small muted">
          Tus respuestas pendientes se recuperan al volver. Después de recargar,
          escucha de nuevo: no guardamos la posición ni los contadores del
          reproductor. Tras entregar se conservan resultado, fecha y versión.
          Repetir soluciones conocidas es práctica. Usa una pestaña por tarea.
        </p>
        {last && (
          <div className="feedback">
            <h3>
              Última entrega: {last.report.correct} / {last.report.total}
            </h3>
            <p>{last.report.message}</p>
            <p>
              {last.payload.kind === "listening" &&
              last.payload.priorExposure === "none"
                ? "Primera muestra de este material, sin soluciones previas registradas."
                : "Práctica o exposición previa desconocida; no añade evidencia independiente."}
            </p>
            {last.report.items?.map((item, i) => (
              <p key={i}>
                <strong>
                  {i + 1}. {item.correct ? "Correcto" : "Revisar"} ·{" "}
                  {item.type ?? task.questions[i]?.type}
                </strong>{" "}
                — {item.explanation}
              </p>
            ))}
            <details
              onToggle={(e) => {
                if (e.currentTarget.open) setTranscriptViewed(true);
              }}
            >
              <summary>Consultar transcripción después de entregar</summary>
              <p lang="en">{last.report.transcript}</p>
            </details>
            <p className="small muted">
              Repetir este audio no añade una muestra independiente. No se
              evalúan acentos, conversación ni comprensión sostenida con un
              único anuncio.
            </p>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => {
                if (player.current) {
                  player.current.pause();
                  player.current.currentTime = 0;
                }
                restart();
                setPlays(0);
                setCompleted(0);
                setTranscriptViewed(false);
                setMessage(
                  "Nuevo repaso; las entregas anteriores se conservan.",
                );
              }}
            >
              Repetir como práctica con soluciones conocidas
            </button>
          </div>
        )}
        <p>
          <Link href="/diagnostic#speaking">
            Continuar con Speaking diagnóstico →
          </Link>{" "}
          · <Link href="/diagnostic#summary">Resumen diagnóstico</Link> ·{" "}
          <Link href="/plan#activity">Registrar minutos reales</Link>
        </p>
      </section>
    </>
  );
}

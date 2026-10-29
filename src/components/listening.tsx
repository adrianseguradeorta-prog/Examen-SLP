"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useTraining } from "./use-training";
import { LocalPracticeNotice } from "./local-practice-notice";
import { listeningTask as task } from "@/lib/listening-content";
export function Listening({ local, owner }: { local: boolean; owner: string }) {
  const { data, error, mutate } = useTraining(local, owner);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [plays, setPlays] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [transcriptViewed, setTranscriptViewed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const id = useRef("");
  const player = useRef<HTMLAudioElement | null>(null);
  const last = data?.submissions.find(
    (s) => s.payload.kind === "listening" && s.payload.version === task.version,
  );
  return (
    <>
      {local && <LocalPracticeNotice />}
      <section className="card">
        <div className="eyebrow">3 / LISTENING · PRÁCTICA · 8–10 MINUTOS</div>
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
          aria-label="Audio original: A trial worth changing"
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
                  disabled={busy || submitted}
                  checked={answers[i] === j}
                  onChange={() => setAnswers({ ...answers, [i]: j })}
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
            busy ||
            submitted ||
            completed < 1 ||
            Object.keys(answers).length !== task.questions.length
          }
          onClick={async () => {
            setBusy(true);
            id.current ||= crypto.randomUUID();
            try {
              await mutate({
                action: "submission",
                data: {
                  id: id.current,
                  kind: "listening",
                  version: task.version,
                  answers: task.questions.map((_, i) => answers[i]),
                  mode: "practice",
                  playCount: plays,
                  completedListens: completed,
                  transcriptViewed,
                  solutionsKnown: Boolean(last),
                },
              });
              setSubmitted(true);
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
        <p className="small muted">
          Antes de entregar, estas respuestas y los contadores solo viven en la
          pestaña. Tras entregar se conservan resultado, fecha, versión y
          condiciones. Haber visto soluciones anteriormente convierte otra
          entrega en repaso.
        </p>
        {last && (
          <div className="feedback">
            <h3>
              Última entrega: {last.report.correct} / {last.report.total}
            </h3>
            <p>{last.report.message}</p>
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
                id.current = "";
                setAnswers({});
                setPlays(0);
                setCompleted(0);
                setTranscriptViewed(false);
                setSubmitted(false);
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

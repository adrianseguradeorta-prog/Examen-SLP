"use client";
import { LocalPracticeNotice } from "./local-practice-notice";
import { useState, useRef } from "react";
import Link from "next/link";
import { diagnosticReading as task } from "@/lib/diagnostic-content";
import { useTraining } from "./use-training";
import { DiagnosticSummary } from "./diagnostic-summary";
import { DiagnosticWriting } from "./diagnostic-writing";
import { DiagnosticSpeaking } from "./diagnostic-speaking";
export function Diagnostic({
  local = false,
  owner = "guest",
}: {
  local?: boolean;
  owner?: string;
}) {
  const { data, error, loading, mutate, load } = useTraining(local, owner);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const readId = useRef("");
  const [showWriting, setShowWriting] = useState(false);
  const lastReading = data?.submissions.find(
    (s) => s.payload.kind === "reading",
  );
  async function submit() {
    setBusy(true);
    const id = readId;
    id.current ||= crypto.randomUUID();
    try {
      await mutate({
        action: "submission",
        data: {
          id: id.current,
          kind: "reading",
          version: "sensors-v1",
          answers: task.questions.map((_, i) => answers[i]),
        },
      });
      id.current = "";
      setMessage(
        "Respuestas guardadas. Revisa las explicaciones y continúa con Writing.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {local && <LocalPracticeNotice />}
      {error && (
        <div className="notice">
          {error} {!local && <Link href="/settings">Conectar cuenta</Link>}
        </div>
      )}
      <div className="notice">
        Diagnóstico inicial de entrenamiento: cuatro tareas originales, ninguna
        calibrada para certificar un SLP. Puedes completarlas en dos sesiones.
        Las muestras cerradas se distinguen de los borradores.
      </div>
      <nav aria-label="Pasos del diagnóstico">
        <Link href="#reading">1. Reading</Link> ·{" "}
        <Link href="#writing">2. Writing</Link> ·{" "}
        <Link href="/listening">3. Listening</Link> ·{" "}
        <Link href="#speaking">4. Speaking</Link>
      </nav>
      <DiagnosticSummary data={data} />
      <p role="status">{loading ? "Recuperando muestras…" : message}</p>
      <section className="card" id="reading">
        <div className="eyebrow">
          1 / READING · 10 MINUTOS · MATERIAL ORIGINAL NO CALIBRADO
        </div>
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
                  name={`diagnostic-${i}`}
                  checked={answers[i] === j}
                  disabled={busy}
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
            busy ||
            !data ||
            Object.keys(answers).length !== task.questions.length
          }
          onClick={() => submit()}
        >
          Entregar muestra de Reading
        </button>
        <p className="small muted">
          Tras consultar las soluciones, repetir este texto sirve de repaso; no
          constituye evidencia independiente.
        </p>
        {lastReading && (
          <div className="feedback">
            <h3>
              Última muestra guardada: {lastReading.report.correct} /{" "}
              {lastReading.report.total} respuestas correctas
            </h3>
            <p>{lastReading.report.message}</p>
            {lastReading.report.items?.map((item, i) => (
              <p key={i}>
                <strong>
                  {i + 1}. {item.correct ? "Correcto" : "Revisar"}
                </strong>{" "}
                · {task.questions[i]?.type} · {item.explanation}
              </p>
            ))}
            <p>
              Solo orienta sobre estas cuatro preguntas. Repetir el mismo texto
              después de ver soluciones es repaso, no evidencia nueva.
            </p>
            <p>
              <Link href="/library#reading">
                Practicar otra lectura con justificación
              </Link>{" "}
              · <Link href="#writing">Continuar con Writing diagnóstico</Link> ·{" "}
              <Link href="/plan#activity">Registrar los minutos reales</Link>
            </p>
          </div>
        )}
      </section>
      <DiagnosticWriting local={local} owner={owner} onSubmitted={load} />
      <section className="card" id="listening">
        <h2>3 / Listening</h2>
        <p>
          Escucha el anuncio original, responde cinco preguntas y revisa qué
          evidencia apoya cada respuesta. 8–10 minutos; repetición permitida en
          práctica.
        </p>
        <Link className="button" href="/listening">
          Abrir Listening Lab →
        </Link>
      </section>
      <DiagnosticSpeaking local={local} owner={owner} onSubmitted={load} />
      <section className="card">
        <h2>Muestras conservadas</h2>
        <button
          className="text-button"
          onClick={() => setShowWriting(!showWriting)}
        >
          {showWriting ? "Ocultar textos" : "Consultar mis textos"}
        </button>
        {!data?.submissions.length && <p>No hay muestras guardadas.</p>}
        {data?.submissions.map((s) => (
          <article key={s.id} className="history-row">
            <div>
              <strong>
                {s.payload.kind} · {s.payload.version} ·{" "}
                {new Date(s.created_at).toLocaleDateString("es")}
              </strong>
              <p>{s.report.message}</p>
              {s.payload.kind === "speaking" && (
                <p>
                  Duración del archivo:{" "}
                  {s.payload.durationSeconds ?? "no disponible"} ·{" "}
                  {s.payload.interrupted
                    ? "interrumpida"
                    : "sin interrupción detectada"}{" "}
                  ·{" "}
                  {s.payload.assisted
                    ? "con ayuda declarada"
                    : "sin ayuda declarada"}
                  . Notas: {s.payload.notes || "sin notas"}. Audio no
                  conservado.
                </p>
              )}
              {s.payload.kind === "listening" && (
                <p>
                  Práctica · inicios/reanudaciones {s.payload.playCount} ·
                  finales de audio {s.payload.completedListens} · transcripción
                  consultada: {s.payload.transcriptViewed ? "sí" : "no"}.
                </p>
              )}
              {showWriting && s.payload.kind === "writing" && (
                <p className="preserve-lines">{s.payload.text}</p>
              )}
            </div>
            <button
              className="text-button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await mutate({ kind: "submission", id: s.id }, "DELETE");
                  setMessage("Muestra eliminada.");
                } catch (e) {
                  setMessage(
                    e instanceof Error ? e.message : "No se pudo borrar",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Borrar
            </button>
          </article>
        ))}
      </section>
    </>
  );
}

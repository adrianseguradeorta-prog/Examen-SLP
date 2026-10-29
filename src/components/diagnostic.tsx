"use client";
import { LocalPracticeNotice } from "./local-practice-notice";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  diagnosticReading as task,
  diagnosticWriting,
} from "@/lib/diagnostic-content";
import { useTraining } from "./use-training";
import { wordCount } from "@/lib/domain";
export function Diagnostic({ local = false }: { local?: boolean }) {
  const { data, error, loading, mutate } = useTraining(local);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const readId = useRef("");
  const writeId = useRef("");
  const [showWriting, setShowWriting] = useState(false);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (text.trim()) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [text]);
  const lastReading = data?.submissions.find(
    (s) => s.payload.kind === "reading",
  );
  async function submit(kind: "reading" | "writing") {
    setBusy(true);
    const id = kind === "reading" ? readId : writeId;
    id.current ||= crypto.randomUUID();
    try {
      await mutate({
        action: "submission",
        data:
          kind === "reading"
            ? {
                id: id.current,
                kind,
                version: "sensors-v1",
                answers: task.questions.map((_, i) => answers[i]),
              }
            : { id: id.current, kind, version: "public-services-v1", text },
      });
      id.current = "";
      setMessage(
        kind === "reading"
          ? "Respuestas guardadas. Revisa la evidencia del texto."
          : "Muestra escrita guardada; evaluación pendiente.",
      );
      if (kind === "writing") setText("");
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
        Diagnóstico en construcción: Reading ofrece una muestra breve; Writing
        recoge una producción para revisión. Speaking y Listening aún no están
        evaluados. No se asigna nivel SLP.
      </div>
      <div className="skill-grid">
        {[
          ["Reading", lastReading ? "Muestra registrada" : "Pendiente"],
          [
            "Writing",
            data?.submissions.some((s) => s.payload.kind === "writing")
              ? "Pendiente de revisión"
              : "Pendiente",
          ],
          ["Speaking", "Pendiente de voz real"],
          ["Listening", "Pendiente de audio validado"],
        ].map(([skill, state]) => (
          <article className="skill-card" key={skill}>
            <h3>{skill}</h3>
            <p>{state}</p>
          </article>
        ))}
      </div>
      <p role="status">{loading ? "Recuperando muestras…" : message}</p>
      <section className="card">
        <div className="eyebrow">READING · MATERIAL ORIGINAL NO CALIBRADO</div>
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
          onClick={() => submit("reading")}
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
              · <Link href="/speaking#practice">Continuar con Speaking</Link> ·{" "}
              <Link href="/plan#activity">Registrar los minutos reales</Link>
            </p>
          </div>
        )}
      </section>
      <section className="card">
        <div className="eyebrow">WRITING · PRODUCCIÓN SIN AYUDA</div>
        <h2>{diagnosticWriting.title}</h2>
        <p lang="en">{diagnosticWriting.prompt}</p>
        <p className="muted">
          Elabora una recomendación con razones y una objeción. No se atribuye
          un límite de palabras a la prueba oficial.
        </p>
        <textarea
          lang="en"
          aria-label="Muestra escrita del diagnóstico"
          spellCheck={false}
          maxLength={30000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
        />
        <p>
          {wordCount(text)} palabras · Este campo no tiene autosave; descarga
          una copia antes de salir.
        </p>
        <p>
          <Link href="/writing">
            Para una práctica que puedas interrumpir, abre Writing Lab con
            recuperación automática.
          </Link>
        </p>
        <button
          className="button"
          disabled={busy || !data || text.trim().length < 30}
          onClick={() => submit("writing")}
        >
          Guardar muestra para revisión
        </button>
        <button
          className="text-button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob([text], { type: "text/plain" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "diagnostic-writing.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Descargar copia
        </button>
      </section>
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
                {s.payload.kind} ·{" "}
                {new Date(s.created_at).toLocaleDateString("es")}
              </strong>
              <p>{s.report.message}</p>
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

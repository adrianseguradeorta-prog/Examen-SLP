"use client";
import { LocalPracticeNotice } from "./local-practice-notice";
import { useState } from "react";
import Link from "next/link";
import { ReadingPractice } from "./reading-practice";
import { useTraining } from "./use-training";
import { DiagnosticSummary } from "./diagnostic-summary";
import { DiagnosticWriting } from "./diagnostic-writing";
import { DiagnosticSpeaking } from "./diagnostic-speaking";
export function Diagnostic({
  local = false,
  owner = "guest",
  readingVersion = "sensors-v1",
  writingVersion = "public-services-v1",
  speakingVersion = "community-decision-v1",
}: {
  local?: boolean;
  owner?: string;
  readingVersion?: string;
  writingVersion?: string;
  speakingVersion?: string;
}) {
  const { data, error, loading, mutate, load } = useTraining(local, owner);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showWriting, setShowWriting] = useState(false);
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
      <ReadingPractice
        key={readingVersion}
        local={local}
        owner={owner}
        version={readingVersion}
        onSubmitted={load}
      />
      <DiagnosticWriting
        key={writingVersion}
        local={local}
        owner={owner}
        version={writingVersion}
        onSubmitted={load}
      />
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
      <DiagnosticSpeaking
        key={speakingVersion}
        local={local}
        owner={owner}
        version={speakingVersion}
        onSubmitted={load}
      />
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

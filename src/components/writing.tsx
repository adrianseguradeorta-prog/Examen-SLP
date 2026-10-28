"use client";
import { useEffect, useRef, useState } from "react";
import { wordCount } from "@/lib/domain";
export function Writing() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Recuperando borrador…");
  const [ready, setReady] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [saveTick, setSaveTick] = useState(0);
  const revision = useRef(0);
  const id = useRef("");
  const saving = useRef(false);
  const last = useRef("");
  useEffect(() => {
    id.current = crypto.randomUUID();
    fetch("/api/drafts")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        if (j.draft) {
          id.current = j.draft.id;
          revision.current = j.draft.revision;
          last.current = j.draft.text;
          setText(j.draft.text);
        }
        setStatus("Conectado al servidor");
      })
      .catch((e) => setStatus(e.message))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!ready || conflict || text === last.current) return;
    const timer = setTimeout(async () => {
      if (saving.current) return;
      saving.current = true;
      setStatus("Guardando…");
      try {
        const r = await fetch("/api/drafts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: id.current,
            revision: revision.current,
            text,
            task: "Remote work and public institutions",
          }),
        });
        const j = await r.json();
        if (r.status === 409) setConflict(true);
        if (!r.ok) throw Error(j.error);
        revision.current = j.draft.revision;
        last.current = text;
        setStatus("Guardado en la nube");
        setSaveTick((t) => t + 1);
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Error de guardado");
      } finally {
        saving.current = false;
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [text, ready, conflict, saveTick]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (text !== last.current) {
        e.preventDefault();
      }
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [text]);
  return (
    <>
      <section className="card">
        <div className="eyebrow">ARGUMENTACIÓN / TAREA ORIGINAL</div>
        <h2>Should public institutions require staff to work in the office?</h2>
        <p lang="en">
          Discuss the benefits and limitations of flexible working. Defend your
          recommendation and respond to a plausible objection.
        </p>
        <p className="muted">
          Sin límite oficial de palabras atribuido. Esta tarea es práctica, no
          simulacro.
        </p>
      </section>
      <section className="card">
        <div className="section-title">
          <h2>Tu borrador</h2>
          <span>{wordCount(text)} palabras</span>
        </div>
        <textarea
          aria-label="Tu texto en inglés"
          lang="en"
          spellCheck={false}
          disabled={!ready}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start with the position you want to defend…"
        />
        <p role="status" className="muted">
          {status}
        </p>
        <button
          className="text-button"
          onClick={() => setSaveTick((t) => t + 1)}
          disabled={conflict}
        >
          Reintentar guardado
        </button>
        <button
          className="button"
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob([text], { type: "text/plain" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "slp-writing.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Descargar copia
        </button>
        {conflict && (
          <p>
            No sobrescribiremos la otra versión. Descarga tu texto antes de
            recargar esta página.
          </p>
        )}
        <p className="small muted">
          Si no has conectado tu cuenta, el texto solo permanece en esta
          pestaña. Descarga una copia antes de salir. Evaluación y recuperación
          offline pendientes.
        </p>
      </section>
    </>
  );
}

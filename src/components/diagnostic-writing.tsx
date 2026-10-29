"use client";
import { useEffect, useRef, useState } from "react";
import { useTraining } from "./use-training";
import { diagnosticWriting } from "@/lib/diagnostic-content";
import { wordCount } from "@/lib/domain";
import {
  diagnosticDraftKey,
  newDiagnosticDraft,
  parseDiagnosticDraft,
  saveDiagnosticDraft,
  type DiagnosticDraft,
} from "@/lib/diagnostic-draft";
export function DiagnosticWriting({
  local,
  owner,
  onSubmitted,
}: {
  local: boolean;
  owner: string;
  onSubmitted: () => Promise<void>;
}) {
  const { data, mutate } = useTraining(local, owner);
  const [draft, setDraft] = useState<DiagnosticDraft | null>(null);
  const [durable, setDurable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [message, setMessage] = useState("Recuperando borrador diagnóstico…");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(diagnosticDraftKey(owner));
        const restored = parseDiagnosticDraft(raw, owner);
        if (raw && !restored)
          throw Error(
            "La copia local tiene un formato inválido; se conserva sin sobrescribir. No se ha abierto el editor.",
          );
        setDraft(
          restored ??
            newDiagnosticDraft(
              owner,
              () => crypto.randomUUID(),
              () => new Date().toISOString(),
            ),
        );
        setDurable(Boolean(restored));
        setMessage(
          restored
            ? "Copia diagnóstica recuperada en este navegador."
            : "Borrador nuevo. Se guardará localmente al escribir.",
        );
      } catch (e) {
        setMessage(
          e instanceof Error ? e.message : "No se pudo recuperar la copia",
        );
      }
    });
    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [owner]);
  const closed = Boolean(
    draft?.closed ||
    data?.submissions.some((s) => s.id === draft?.submissionId),
  );
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (draft?.text && !durable && !closed) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [draft, durable, closed]);
  function persist(next: DiagnosticDraft) {
    setDownloaded(false);
    setDraft(next);
    try {
      saveDiagnosticDraft(localStorage, next);
      setDurable(true);
      setMessage(
        "Borrador guardado en este navegador; todavía no es una muestra entregada.",
      );
    } catch {
      setDurable(false);
      setMessage(
        "No se pudo guardar localmente. Descarga una copia antes de salir; el texto permanece en el editor.",
      );
    }
  }
  return (
    <section className="card" id="writing">
      <div className="eyebrow">2 / WRITING · 15–20 MINUTOS ORIENTATIVOS</div>
      <h2>{diagnosticWriting.title}</h2>
      <p lang="en">{diagnosticWriting.prompt}</p>
      <p>
        Escribe sin traductor ni modelo de respuesta. No hay un límite oficial
        de palabras atribuido. Conserva una postura, razones y una objeción.
      </p>
      <p>
        <strong>
          {closed
            ? "Muestra cerrada: no se edita"
            : "Borrador: aún no entregado"}
        </strong>
      </p>
      <textarea
        aria-label="Muestra escrita del diagnóstico"
        lang="en"
        spellCheck={false}
        maxLength={30000}
        disabled={!draft || !data || busy || closed}
        value={data ? (draft?.text ?? "") : ""}
        onChange={(e) =>
          draft &&
          persist({
            ...draft,
            text: e.target.value,
            dirty: true,
            updatedAt: new Date().toISOString(),
          })
        }
      />
      <p>
        {wordCount(data ? (draft?.text ?? "") : "")} palabras ·{" "}
        {durable ? "Copia local disponible" : "Sin confirmar copia local"}
      </p>
      <p role="status">{message}</p>
      <button
        className="button"
        disabled={
          !draft || busy || closed || !data || draft.text.trim().length < 30
        }
        onClick={async () => {
          if (!draft) return;
          setBusy(true);
          try {
            await mutate({
              action: "submission",
              data: {
                id: draft.submissionId,
                kind: "writing",
                version: "public-services-v1",
                text: draft.text,
              },
            });
            if (!mounted.current) return;
            const done = { ...draft, closed: true, dirty: false };
            setDraft(done);
            try {
              saveDiagnosticDraft(localStorage, done);
              setDurable(true);
            } catch {
              setDurable(false);
            }
            setMessage(
              "Muestra entregada y cerrada. Pendiente de revisión; evidencia insuficiente para estimar nivel.",
            );
            await onSubmitted();
          } catch (e) {
            if (mounted.current)
              setMessage(
                e instanceof Error
                  ? e.message
                  : "No se pudo entregar. Conservamos tu borrador.",
              );
          } finally {
            if (mounted.current) setBusy(false);
          }
        }}
      >
        Entregar muestra cerrada
      </button>
      <button
        className="text-button"
        disabled={!draft || !data}
        onClick={() => {
          const url = URL.createObjectURL(
            new Blob([draft?.text ?? ""], { type: "text/plain" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "diagnostic-writing.txt";
          a.click();
          URL.revokeObjectURL(url);
          setDownloaded(true);
        }}
      >
        Descargar texto
      </button>
      {closed && (
        <button
          className="text-button"
          disabled={busy || !data}
          onClick={() => {
            // Do not replace the only copy if the closed sample cannot be found in history.
            if (
              !downloaded &&
              !data?.submissions.some((s) => s.id === draft?.submissionId)
            ) {
              setMessage(
                "Antes de crear otra muestra, descarga este texto; su entrega no aparece en el historial cargado.",
              );
              return;
            }
            const next = newDiagnosticDraft(
              owner,
              () => crypto.randomUUID(),
              () => new Date().toISOString(),
            );
            try {
              saveDiagnosticDraft(localStorage, next);
              setDraft(next);
              setDownloaded(false);
              setDurable(true);
              setMessage(
                "Nuevo borrador. La muestra anterior sigue en el historial.",
              );
            } catch {
              setMessage(
                "No se pudo preparar otro borrador; no se ha reemplazado el texto.",
              );
            }
          }}
        >
          Crear otra muestra
        </button>
      )}
      <p className="small muted">
        Usa una pestaña para este borrador. La muestra entregada es inmutable;
        crear otra no modifica la anterior. Writing Lab y este borrador tienen
        claves separadas. Sin revisión cualificada no se asigna SLP.
      </p>
    </section>
  );
}

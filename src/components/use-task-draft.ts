"use client";
import { useEffect, useState, useCallback } from "react";
import {
  createTaskDraft,
  taskDraftKey,
  parseTaskDraft,
  saveTaskDraft,
  clearTaskDraft,
  type TaskDraft,
} from "@/lib/task-draft";
export function useTaskDraft(
  owner: string,
  kind: TaskDraft["kind"],
  version: string,
) {
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [durable, setDurable] = useState(true);
  const [message, setMessage] = useState("Recuperando trabajo…");
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(taskDraftKey(owner, kind, version));
        const restored = parseTaskDraft(raw, owner, kind, version);
        if (raw && !restored)
          throw Error(
            "La copia pendiente no se puede leer. No se ha reemplazado; conserva los datos del navegador.",
          );
        setDraft(restored ?? createTaskDraft(owner, kind, version));
        setMessage(
          restored
            ? "Trabajo pendiente recuperado en este navegador."
            : "Se guardará en este navegador al responder.",
        );
      } catch (e) {
        setBlocked(true);
        setMessage(
          e instanceof Error ? e.message : "No se pudo recuperar el trabajo.",
        );
      }
    });
    const changed = (e: StorageEvent) => {
      if (e.key === null || e.key === taskDraftKey(owner, kind, version)) {
        setBlocked(true);
        setMessage(
          "Este trabajo cambió en otra pestaña. Recarga para abrir la copia guardada; no se mezclan respuestas.",
        );
      }
    };
    window.addEventListener("storage", changed);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", changed);
    };
  }, [owner, kind, version]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (!durable) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [durable]);
  function edit(
    values: Partial<Pick<TaskDraft, "answers" | "notes" | "assisted">>,
  ) {
    if (!draft || blocked) return;
    const next = { ...draft, ...values, updatedAt: new Date().toISOString() };
    setDraft(next);
    try {
      saveTaskDraft(localStorage, next);
      setDurable(true);
      setMessage("Trabajo pendiente guardado en este navegador.");
    } catch {
      setDurable(false);
      setMessage(
        "No se pudo guardar. Mantén esta pestaña abierta y copia tus respuestas o notas antes de salir.",
      );
    }
  }
  const clearAfterConfirmed = useCallback(() => {
    if (!draft) return;
    try {
      clearTaskDraft(localStorage, draft);
      setDurable(true);
      setMessage(
        "Entrega confirmada. El resultado se conserva; la copia pendiente se ha retirado.",
      );
    } catch {
      setMessage(
        "Entrega confirmada. No se pudo retirar la copia pendiente; el resultado sigue guardado.",
      );
    }
  }, [draft]);
  function restart() {
    const next = createTaskDraft(owner, kind, version);
    try {
      saveTaskDraft(localStorage, next);
      setDraft(next);
      setDurable(true);
      setMessage(
        "Nueva práctica preparada. No se modifica la entrega anterior.",
      );
    } catch {
      setMessage(
        "No se pudo preparar otra práctica. No se han reemplazado tus respuestas.",
      );
    }
  }
  return {
    draft,
    ready: !!draft && !blocked,
    durable,
    message,
    edit,
    clearAfterConfirmed,
    restart,
  };
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { wordCount } from "@/lib/domain";
import {
  ACTIVE_WRITING_USER_KEY,
  GUEST_WRITING_USER,
  WRITING_TASK,
  chooseWritingDraft,
  parseLocalWritingDraft,
  writingDraftStorageKey,
  type LocalWritingDraft,
  type RemoteWritingDraft,
} from "@/lib/writing-draft";

function readLocal(userKey: string) {
  return parseLocalWritingDraft(
    localStorage.getItem(writingDraftStorageKey(userKey)),
    userKey,
  );
}

export function Writing() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Recuperando borrador…");
  const [ready, setReady] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [saveTick, setSaveTick] = useState(0);
  const revision = useRef(0);
  const id = useRef("");
  const userKey = useRef(GUEST_WRITING_USER);
  const saving = useRef(false);
  const dirty = useRef(false);
  const lastSynced = useRef("");
  const latestText = useRef("");

  const persistLocal = useCallback(
    (draftText: string, isDirty: boolean, syncedText = lastSynced.current) => {
      if (!id.current) return;
      const draft: LocalWritingDraft = {
        userKey: userKey.current,
        id: id.current,
        revision: revision.current,
        text: draftText,
        task: WRITING_TASK,
        dirty: isDirty,
        lastSyncedText: syncedText,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        writingDraftStorageKey(userKey.current),
        JSON.stringify(draft),
      );
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const rememberedUser =
      localStorage.getItem(ACTIVE_WRITING_USER_KEY) || GUEST_WRITING_USER;
    const rememberedLocal = readLocal(rememberedUser);

    const applyDraft = (draft: LocalWritingDraft | null, scope: string) => {
      userKey.current = scope;
      if (!draft) {
        id.current = crypto.randomUUID();
        revision.current = 0;
        dirty.current = false;
        lastSynced.current = "";
        latestText.current = "";
        setText("");
        return;
      }
      id.current = draft.id;
      revision.current = draft.revision;
      dirty.current = draft.dirty;
      lastSynced.current = draft.lastSyncedText;
      latestText.current = draft.text;
      setText(draft.text);
    };

    void (async () => {
      try {
        const r = await fetch("/api/drafts");
        const j = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (r.ok) {
          const scope =
            typeof j.userId === "string" ? j.userId : rememberedUser;
          userKey.current = scope;
          localStorage.setItem(ACTIVE_WRITING_USER_KEY, scope);
          const local = readLocal(scope);
          const selected = chooseWritingDraft(
            local,
            (j.draft ?? null) as RemoteWritingDraft | null,
            scope,
          );
          applyDraft(selected, scope);
          if (selected)
            localStorage.setItem(
              writingDraftStorageKey(scope),
              JSON.stringify(selected),
            );
          setStatus(
            selected?.dirty
              ? "Borrador local recuperado; pendiente de sincronizar."
              : "Conectado al servidor",
          );
        } else if (r.status === 401) {
          localStorage.removeItem(ACTIVE_WRITING_USER_KEY);
          const local = readLocal(GUEST_WRITING_USER);
          applyDraft(local, GUEST_WRITING_USER);
          setStatus(
            local
              ? "Borrador local recuperado. Inicia sesión para sincronizar."
              : "Modo local. Inicia sesión para sincronizar.",
          );
        } else {
          applyDraft(rememberedLocal, rememberedUser);
          setStatus(
            rememberedLocal
              ? `Borrador local recuperado. ${j.error ?? "Sin sincronización."}`
              : `Modo local. ${j.error ?? "Sin sincronización."}`,
          );
        }
      } catch {
        if (cancelled) return;
        applyDraft(rememberedLocal, rememberedUser);
        setStatus(
          rememberedLocal
            ? "Borrador local recuperado. Sin conexión al servidor."
            : "Modo local. Sin conexión al servidor.",
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || conflict || !dirty.current) return;
    const timer = setTimeout(async () => {
      if (saving.current) return;
      saving.current = true;
      const candidate = latestText.current;
      setStatus("Guardado localmente. Sincronizando…");
      try {
        const r = await fetch("/api/drafts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: id.current,
            revision: revision.current,
            text: candidate,
            task: WRITING_TASK,
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (r.status === 409) {
          setConflict(true);
          dirty.current = true;
          persistLocal(latestText.current, true);
          setStatus("Conflicto remoto. Tu copia local se ha conservado.");
          return;
        }
        if (!r.ok) throw Error(j.error ?? "No se pudo sincronizar");
        revision.current = j.draft.revision;
        id.current = j.draft.id;
        lastSynced.current = candidate;
        if (latestText.current === candidate) {
          dirty.current = false;
          persistLocal(candidate, false, candidate);
          setStatus("Guardado localmente y en la nube");
        } else {
          dirty.current = true;
          persistLocal(latestText.current, true, candidate);
          setStatus("Cambios locales pendientes de sincronizar");
        }
        setSaveTick((t) => t + 1);
      } catch (e) {
        dirty.current = true;
        persistLocal(latestText.current, true);
        setStatus(
          `Guardado localmente. ${
            e instanceof Error ? e.message : "Sin sincronización"
          }`,
        );
      } finally {
        saving.current = false;
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [ready, conflict, text, saveTick, persistLocal]);

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
          onChange={(e) => {
            const next = e.target.value;
            latestText.current = next;
            dirty.current = true;
            persistLocal(next, true);
            setText(next);
            if (!conflict) setStatus("Guardado localmente");
          }}
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
          Reintentar sincronización
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
            Hay otra versión en el servidor. Esta página no sustituirá tu copia
            local automáticamente. Descárgala antes de decidir qué versión
            conservar.
          </p>
        )}
        <p className="small muted">
          El borrador se conserva en este navegador tras recargar o cerrar. Si
          inicias sesión, se guarda en un espacio local separado por usuario y
          se sincroniza con el servidor cuando está disponible.
        </p>
      </section>
    </>
  );
}

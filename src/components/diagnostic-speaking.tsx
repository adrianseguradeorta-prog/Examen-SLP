"use client";
import { useEffect, useRef, useState } from "react";
import { useTraining } from "./use-training";
import { useTaskDraft } from "./use-task-draft";
import { TaskPicker, useOpenedTask } from "./task-picker";
import { speakingTasks, oralFunctions } from "@/lib/speaking-content";
import {
  EphemeralRecording,
  emptyRecording,
  type RecordingState,
} from "@/lib/ephemeral-recording";
export function DiagnosticSpeaking({
  local,
  owner,
  version = "community-decision-v1",
  onSubmitted,
}: {
  local: boolean;
  owner: string;
  version?: string;
  onSubmitted: () => Promise<void>;
}) {
  const { data, mutate } = useTraining(local, owner);
  const task = speakingTasks.find((t) => t.version === version)!;
  const {
    draft,
    ready,
    message: draftMessage,
    edit,
    clearAfterConfirmed,
    restart,
  } = useTaskDraft(owner, "speaking", version);
  const warning = useOpenedTask(local, owner, "speaking", version, !!data);
  const [recording, setRecording] = useState<RecordingState>(emptyRecording);
  const [busy, setBusy] = useState(false);
  const saved = !!data?.submissions.some((s) => s.id === draft?.id);
  useEffect(() => {
    if (saved) queueMicrotask(clearAfterConfirmed);
  }, [saved, clearAfterConfirmed]);
  const [message, setMessage] = useState("");
  const recorder = useRef<EphemeralRecording | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const capture = new EphemeralRecording({
      media: () => {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
          return Promise.reject(
            Error(
              "Este navegador necesita micrófono, permiso y HTTPS o localhost. Puedes practicar oralmente, pero no se registrará automáticamente una muestra.",
            ),
          );
        return navigator.mediaDevices.getUserMedia({ audio: true });
      },
      recorder: (stream) => new MediaRecorder(stream),
      createURL: (blob) => URL.createObjectURL(blob),
      revokeURL: (url) => URL.revokeObjectURL(url),
      notify: setRecording,
    });
    recorder.current = capture;
    const hidden = () => {
      if (document.visibilityState !== "visible") capture.stop(true);
    };
    const leaving = () => capture.clear();
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leaving);
    return () => {
      mounted.current = false;
      capture.dispose();
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leaving);
    };
  }, []);
  return (
    <section className="card" id="speaking">
      <div className="eyebrow">4 / SPEAKING · 8–10 MINUTOS</div>
      <TaskPicker
        skill="speaking"
        version={version}
        data={data}
        disabled={
          busy ||
          recording.phase === "recording" ||
          recording.phase === "requesting"
        }
      />
      <h2>{task.title}</h2>
      <p>
        Prepara ideas durante un minuto, sin redactar un guion. Graba una
        respuesta independiente de unos 3–4 minutos. No necesitas conocimientos
        especializados. La aplicación no te escucha, transcribe ni evalúa.
      </p>
      <ol lang="en">
        {task.steps.map((q, i) => (
          <li key={q}>
            <span className="small">{oralFunctions[i]}: </span>
            {q}
          </li>
        ))}
      </ol>
      <p>
        Al iniciar, autorizas únicamente la captura temporal en memoria para
        escucharte. Nada de audio se escribe en disco, localStorage, IndexedDB
        ni servidor. Salir, recargar o pulsar «Descartar audio» lo elimina.
      </p>
      <button
        className="button"
        disabled={!data || !ready || busy || recording.phase === "requesting"}
        onClick={() => {
          if (recording.phase === "recording") recorder.current?.stop();
          else {
            if (saved) restart();
            setMessage("");
            void recorder.current?.start();
          }
        }}
      >
        {recording.phase === "recording"
          ? "Detener grabación"
          : recording.url
            ? "Grabar otra respuesta"
            : "Iniciar grabación efímera"}
      </button>
      <button
        className="text-button"
        disabled={busy || !recording.url}
        onClick={() => recorder.current?.clear()}
      >
        Descartar audio
      </button>
      <p role="status">{recording.message}</p>
      {recording.url && (
        <audio
          style={{ width: "100%" }}
          controls
          src={recording.url}
          aria-label="Tu respuesta oral efímera"
          onLoadedMetadata={(e) =>
            recorder.current?.metadata(e.currentTarget.duration)
          }
          onDurationChange={(e) =>
            recorder.current?.metadata(e.currentTarget.duration)
          }
        />
      )}
      <p>
        {recording.seconds !== null
          ? `Duración del archivo: ${recording.seconds} segundos (no mide tiempo de habla ni fluidez).`
          : "Duración fiable no disponible; no se inventará un valor."}
      </p>
      <form
        key={recording.url}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft) return;
          setBusy(true);
          try {
            await mutate({
              action: "submission",
              data: {
                id: draft.id,
                kind: "speaking",
                version,
                completed: true,
                durationSeconds: recording.seconds,
                durationReliable: recording.seconds !== null,
                interrupted: recording.interrupted,
                notes: draft.notes,
                assisted: draft.assisted,
                audioRetained: false,
              },
            });
            if (!mounted.current) return;
            clearAfterConfirmed();
            setMessage(
              "Realización y notas guardadas. El audio sigue siendo efímero. Evidencia insuficiente para estimar nivel.",
            );
            await onSubmitted();
          } catch (e) {
            if (mounted.current)
              setMessage(
                e instanceof Error ? e.message : "No se pudo registrar",
              );
          } finally {
            if (mounted.current) setBusy(false);
          }
        }}
      >
        <label>
          Observaciones personales (no evaluación)
          <textarea
            name="notes"
            value={data ? (draft?.notes ?? "") : ""}
            onChange={(e) => edit({ notes: e.target.value })}
            maxLength={2000}
            disabled={!data || !ready || busy || saved}
            placeholder="Ej.: me costó responder a la objeción; no sé si utilicé bien el condicional."
          />
        </label>
        <label className="option">
          <input
            type="checkbox"
            name="assisted"
            checked={!!data && !!draft?.assisted}
            onChange={(e) => edit({ assisted: e.target.checked })}
            disabled={!data || !ready || busy || saved}
          />{" "}
          Consulté ayuda o un modelo al preparar/responder.
        </label>
        <label className="option">
          <input
            type="checkbox"
            required
            disabled={busy || saved || recording.phase !== "ready"}
          />{" "}
          He realizado la tarea y escuchado mi respuesta. Registraré cualquier
          interrupción en mis notas.
        </label>
        <button
          className="button"
          disabled={
            !data || !ready || recording.phase !== "ready" || busy || saved
          }
        >
          Registrar realización sin conservar audio
        </button>
      </form>
      <p role="status">{message}</p>
      <p role="status">{draftMessage}</p>
      {warning && <p role="status">{warning}</p>}
      <p className="small">
        Las notas y la ayuda declarada se recuperan al volver. El audio no.
        Después de recargar necesitarás grabar y escuchar otra respuesta antes
        de entregar.
      </p>
      <p className="small muted">
        Registrar esta constancia no suma minutos automáticamente. Usa Hoy o
        Plan para declarar el tiempo real una sola vez. No se puntúan
        pronunciación, fluidez, gramática ni SLP.
      </p>
    </section>
  );
}

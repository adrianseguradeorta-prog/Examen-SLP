"use client";
import { useEffect, useRef, useState } from "react";
import { useTraining } from "./use-training";
import {
  EphemeralRecording,
  emptyRecording,
  type RecordingState,
} from "@/lib/ephemeral-recording";
export function DiagnosticSpeaking({
  local,
  owner,
  onSubmitted,
}: {
  local: boolean;
  owner: string;
  onSubmitted: () => Promise<void>;
}) {
  const { data, mutate } = useTraining(local, owner);
  const [recording, setRecording] = useState<RecordingState>(emptyRecording);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const recorder = useRef<EphemeralRecording | null>(null);
  const id = useRef("");
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
      <h2>A community decision</h2>
      <p>
        Prepara ideas durante un minuto, sin redactar un guion. Graba una
        respuesta independiente de unos 3–4 minutos. No necesitas conocimientos
        especializados. La aplicación no te escucha, transcribe ni evalúa.
      </p>
      <ol lang="en">
        <li>
          Describe a change that affected a team or community you know. What
          happened?
        </li>
        <li>
          Should a local authority spend more on shared public spaces or on
          online services? Explain your position and support it with reasons.
        </li>
        <li>
          Some residents say your choice excludes people with different needs.
          How would you respond?
        </li>
        <li>
          Would your recommendation change if the budget were cut in half?
          Explain why.
        </li>
      </ol>
      <p>
        Al iniciar, autorizas únicamente la captura temporal en memoria para
        escucharte. Nada de audio se escribe en disco, localStorage, IndexedDB
        ni servidor. Salir, recargar o pulsar «Descartar audio» lo elimina.
      </p>
      <button
        className="button"
        disabled={busy || recording.phase === "requesting"}
        onClick={() => {
          if (recording.phase === "recording") recorder.current?.stop();
          else {
            id.current = "";
            setSaved(false);
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
          const f = new FormData(e.currentTarget);
          id.current ||= crypto.randomUUID();
          setBusy(true);
          try {
            await mutate({
              action: "submission",
              data: {
                id: id.current,
                kind: "speaking",
                version: "community-decision-v1",
                completed: true,
                durationSeconds: recording.seconds,
                durationReliable: recording.seconds !== null,
                interrupted: recording.interrupted,
                notes: String(f.get("notes")),
                assisted: f.get("assisted") === "on",
                audioRetained: false,
              },
            });
            if (!mounted.current) return;
            setSaved(true);
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
            maxLength={2000}
            disabled={busy || saved || recording.phase !== "ready"}
            placeholder="Ej.: me costó responder a la objeción; no sé si utilicé bien el condicional."
          />
        </label>
        <label className="option">
          <input
            type="checkbox"
            name="assisted"
            disabled={busy || saved || recording.phase !== "ready"}
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
          disabled={!data || recording.phase !== "ready" || busy || saved}
        >
          Registrar realización sin conservar audio
        </button>
      </form>
      <p role="status">{message}</p>
      <p className="small muted">
        Registrar esta constancia no suma minutos automáticamente. Usa Hoy o
        Plan para declarar el tiempo real una sola vez. No se puntúan
        pronunciación, fluidez, gramática ni SLP.
      </p>
    </section>
  );
}

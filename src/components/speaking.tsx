"use client";
import { useEffect, useRef, useState } from "react";
import { SpeakingPractice } from "./speaking-practice";
import { Mic } from "lucide-react";
export function Speaking() {
  const [mode, setMode] = useState("teacher");
  const [status, setStatus] = useState("");
  const [testing, setTesting] = useState(false);
  const [audio, setAudio] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const url = useRef("");
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );
  async function test() {
    if (testing) {
      recorder.current?.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      setTesting(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw Error("Este navegador requiere HTTPS y soporte de grabación.");
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const r = new MediaRecorder(stream.current);
      recorder.current = r;
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = () => {
        if (url.current) URL.revokeObjectURL(url.current);
        url.current = URL.createObjectURL(
          new Blob(chunks, { type: r.mimeType }),
        );
        setAudio(url.current);
        setStatus(
          "Prueba temporal en memoria. No se almacena ni se envía; se pierde al salir de esta pantalla.",
        );
      };
      r.start();
      setTesting(true);
      setStatus("Grabando prueba local. Pulsa detener para escucharte.");
      setTimeout(() => {
        if (r.state === "recording") {
          r.stop();
          stream.current?.getTracks().forEach((t) => t.stop());
          setTesting(false);
        }
      }, 15000);
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "No se pudo acceder al micrófono",
      );
    }
  }
  return (
    <>
      <SpeakingPractice />
      <p className="muted">
        Modos de conversación previstos: todavía no hay profesor ni examinador
        de voz conectado. Los botones siguientes solo seleccionan el modo.
      </p>
      <div className="mode-grid">
        {[
          [
            "teacher",
            "Teacher",
            "Desarrolla tu respuesta y recibe orientación después.",
          ],
          [
            "examiner",
            "Examiner",
            "Preguntas dinámicas, sin pistas ni correcciones.",
          ],
          [
            "challenging",
            "Challenging",
            "Defiende tu postura ante objeciones razonables.",
          ],
        ].map(([id, title, desc]) => (
          <button
            aria-pressed={mode === id}
            className={`mode ${mode === id ? "selected" : ""}`}
            onClick={() => setMode(id)}
            key={id}
          >
            <strong>{title}</strong>
            <span>{desc}</span>
          </button>
        ))}
      </div>
      <section className="card speaking-stage">
        <div className="mic-orb">
          <Mic size={42} />
        </div>
        <h2>Primero, comprueba tu micrófono.</h2>
        <p>
          Una prueba local de hasta 15 segundos. Usa auriculares y mantén la
          aplicación abierta.
        </p>
        <button className="button" onClick={test}>
          {testing ? "Detener prueba" : "Probar micrófono"}
        </button>
        <p role="status">{status}</p>
        {audio && (
          <audio aria-label="Escuchar prueba local" src={audio} controls />
        )}
      </section>
      <div className="notice">
        La conversación de voz aún no está habilitada. Falta conectar OpenAI y
        validar presupuesto, grabación sincronizada y recuperación. Esta prueba
        de micrófono no es el Speaking Lab terminado.
      </div>
      <section className="card">
        <h2>Mientras tanto, prepara una idea</h2>
        <p lang="en">
          Autonomous systems could reduce military casualties. Who should be
          responsible when they make the wrong decision?
        </p>
        <p className="muted">
          Desarrolla una postura, explica una consecuencia y considera una
          objeción. No necesitas conocer detalles técnicos para argumentar.
        </p>
      </section>
    </>
  );
}

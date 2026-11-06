"use client";
import { useState } from "react";
import Link from "next/link";
import { speakingTopics as topics } from "@/lib/speaking-content";

export function SpeakingPractice() {
  const [topic, setTopic] = useState(0);
  const [step, setStep] = useState(0);
  return (
    <section className="card" id="practice">
      <div className="eyebrow">PRÁCTICA ORAL GUIADA · SIN GRABACIÓN</div>
      <h2>Una respuesta, una objeción, una hipótesis</h2>
      <p>
        Dedica unos 15 minutos. Habla durante 1–2 minutos por pregunta, sin
        escribir primero la respuesta. Las preguntas son originales y fijas;
        nadie está escuchando ni evaluando tu voz.
      </p>
      <label>
        Tema
        <select
          value={topic}
          onChange={(e) => {
            setTopic(Number(e.target.value));
            setStep(0);
          }}
        >
          {topics.map((t, i) => (
            <option key={t.title} value={i}>
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <p>Pregunta {step + 1} de 4</p>
      <blockquote lang="en">{topics[topic].steps[step]}</blockquote>
      <button className="button" onClick={() => setStep((step + 1) % 4)}>
        {step === 3
          ? "Volver a la primera pregunta"
          : "He respondido: siguiente pregunta"}
      </button>
      <details>
        <summary>Revisión personal después de hablar</summary>
        <p>
          ¿Sostuviste tu postura con razones? ¿Respondiste a la objeción?
          ¿Cambiaste la conclusión al cambiar la condición? Son preguntas de
          reflexión, no una rúbrica ni una nota SLP.
        </p>
      </details>
      <p>
        <Link href="/errors">Anotar un error observado</Link> ·{" "}
        <Link href="/plan#activity">Registrar minutos reales</Link> ·{" "}
        <Link href="/">Volver a Hoy</Link>
      </p>
    </section>
  );
}

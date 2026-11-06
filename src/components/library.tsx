"use client";
import Link from "next/link";
import { useState } from "react";
import { lessons, reading, chunks } from "@/lib/content";
export function Library() {
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [show, setShow] = useState(false);
  return (
    <>
      <label>
        Buscar clases
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hipótesis, concesión, inferencia…"
        />
      </label>
      <div className="two-col">
        {lessons
          .filter((l) =>
            (l.title + l.rule).toLowerCase().includes(query.toLowerCase()),
          )
          .map((l) => (
            <article className="card" key={l.id}>
              <div className="eyebrow">{l.tag}</div>
              <h2>{l.title}</h2>
              <p>{l.rule}</p>
              <blockquote lang="en">{l.example}</blockquote>
              <h3>Tu turno</h3>
              <p lang="en">{l.prompt}</p>
              <details>
                <summary>Revisa tu respuesta</summary>
                <p>{l.review}</p>
              </details>
            </article>
          ))}
      </div>
      <section className="card" id="reading">
        <div className="eyebrow">READING / INFERENCIA Y POSTURA</div>
        <h2>{reading.title}</h2>
        <p className="reading" lang="en">
          {reading.text}
        </p>
        {reading.questions.map((q, i) => (
          <fieldset key={q.q}>
            <legend>
              {i + 1}. {q.q}
            </legend>
            {q.options.map((o, j) => (
              <label className="option" key={o}>
                <input
                  type="radio"
                  name={`q${i}`}
                  checked={answers[i] === j}
                  disabled={show}
                  onChange={() => setAnswers({ ...answers, [i]: j })}
                />
                {o}
              </label>
            ))}
            {show && (
              <p className="feedback">
                {answers[i] === q.answer
                  ? "Correcto. "
                  : "Revisa tu inferencia. "}
                {q.why}
              </p>
            )}
          </fieldset>
        ))}
        <button
          className="button"
          disabled={Object.keys(answers).length !== reading.questions.length}
          onClick={() => setShow(true)}
        >
          Revisar respuestas
        </button>
        <p className="muted small">
          Práctica de esta página; todavía no guarda intentos ni estima un nivel
          SLP.
        </p>
        {show && (
          <p>
            <Link href="/plan#activity">Registrar los minutos de Reading</Link>{" "}
            · <Link href="/">Volver a Hoy</Link>
          </p>
        )}
      </section>
      <section className="card">
        <h2>Expresiones para activar</h2>
        <p>
          No basta con reconocerlas. Úsalas para expresar una idea propia en
          otro contexto.
        </p>
        {chunks.map(([a, b]) => (
          <div className="chunk" key={a}>
            <strong lang="en">{a}</strong>
            <span>{b}</span>
          </div>
        ))}
      </section>
    </>
  );
}

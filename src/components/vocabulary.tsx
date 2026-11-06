"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCoach } from "./use-coach";
import { useTraining } from "./use-training";
import {
  currentProfile,
  localDate,
  vocabularySchema,
  type Vocabulary,
} from "@/lib/coach-model";
import { addReview, dueVocabulary, srsState } from "@/lib/srs";
import { chunks } from "@/lib/content";
import { practiceRequest } from "@/lib/local-practice";
import type { ErrorData } from "./error-bank";
import { nextTask, taskHref } from "@/lib/task-rotation";
export function VocabularyLab({
  owner = "guest",
  patternId = "",
}: {
  owner?: string;
  patternId?: string;
}) {
  const { coach, ready, error, update } = useCoach(true, owner);
  const { data } = useTraining(true, owner);
  const [errors, setErrors] = useState<ErrorData | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState("");
  const [seed, setSeed] = useState(-1);
  useEffect(() => {
    const abort = new AbortController();
    practiceRequest(true, "/api/errors", { signal: abort.signal }, owner)
      .then((r) => r.json())
      .then((j) => {
        if (!abort.signal.aborted && j.patterns) setErrors(j);
      })
      .catch(() => {});
    return () => abort.abort();
  }, [owner]);
  const pattern = errors?.patterns.find((p) => p.id === patternId);
  const today = localDate(new Date(), currentProfile(coach).timeZone),
    due = dueVocabulary(coach.vocabulary, today),
    card = due[0];
  async function add(value: Vocabulary) {
    if (
      coach.vocabulary.some(
        (v) =>
          v.expression.trim().toLowerCase() ===
          value.expression.trim().toLowerCase(),
      )
    )
      throw Error(
        "Esa expresión ya está en tu lista; se conserva su historial.",
      );
    await update((c) => ({ ...c, vocabulary: [...c.vocabulary, value] }));
  }
  const transferSkill = pattern
    ? (errors?.observations.find((o) => o.pattern_id === pattern.id)?.skill ??
      "speaking")
    : "speaking";
  return (
    <>
      <section className="card">
        <h2>Recuperar antes de mirar</h2>
        <p>
          Intervalos de repaso: 1, 3, 7, 14 y 30 días. Si fallas o necesitas
          ayuda, vuelve a 1 día. Repetir antes de la fecha no adelanta el
          intervalo. Tus declaraciones no equivalen a dominio verificado.
        </p>
        {error && <p role="alert">{error}</p>}
        <p>{due.length} revisiones pendientes.</p>
        {ready && card && (
          <article key={card.id}>
            <h3>Recuerda la expresión</h3>
            <p>{card.note}</p>
            <p>Intenta decir una frase propia antes de revelar la expresión.</p>
            <button
              className="text-button"
              onClick={() => setRevealed(card.id)}
            >
              Mostrar expresión
            </button>
            {revealed === card.id && (
              <>
                <p lang="en">
                  <strong>{card.expression}</strong>
                </p>
                <p lang="en">{card.example}</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    setBusy(true);
                    try {
                      const reviewed = addReview(
                        card,
                        {
                          id: crypto.randomUUID(),
                          date: today,
                          mode: f.get("mode") as "recognition" | "production",
                          correct: f.get("result") === "correct",
                          assisted: f.get("assisted") === "on",
                          example: String(f.get("example")),
                          context: String(f.get("context")),
                        },
                        today,
                      );
                      await update((c) => ({
                        ...c,
                        vocabulary: c.vocabulary.map((v) =>
                          v.id === card.id ? reviewed : v,
                        ),
                      }));
                      setRevealed("");
                      setMessage(
                        "Revisión guardada. Transfiere la expresión a una situación nueva; registra los minutos una sola vez en Hoy.",
                      );
                    } catch (e) {
                      setMessage(
                        e instanceof Error ? e.message : "No se guardó.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label>
                    Tipo de revisión
                    <select name="mode">
                      <option value="recognition">
                        Reconocimiento: recordar significado
                      </option>
                      <option value="production">
                        Producción: frase propia sin mirar
                      </option>
                    </select>
                  </label>
                  <label>
                    Resultado declarado
                    <select name="result">
                      <option value="incorrect">No lo recuperé</option>
                      <option value="correct">Lo recuperé correctamente</option>
                    </select>
                  </label>
                  <label className="option">
                    <input name="assisted" type="checkbox" />
                    Necesité ayuda, miré antes o imité el modelo
                  </label>
                  <label>
                    Mi frase independiente
                    <textarea name="example" maxLength={2000} />
                  </label>
                  <label>
                    Contexto nuevo
                    <input name="context" maxLength={200} />
                  </label>
                  <button className="button" disabled={busy || !ready}>
                    Guardar revisión
                  </button>
                </form>
              </>
            )}
          </article>
        )}
        {ready && !card && (
          <p>
            No hay revisiones vencidas. Puedes añadir expresiones o practicar la
            transferencia, sin adelantar artificialmente el repaso.
          </p>
        )}
        {data && (
          <p>
            <Link
              href={taskHref(
                transferSkill,
                nextTask(data, transferSkill).version,
              )}
            >
              Usar la corrección en otra tarea de {transferSkill} →
            </Link>{" "}
            (si el banco está agotado, será repetición para práctica).
          </p>
        )}
        <p role="status">{message}</p>
      </section>
      <section className="card" id="add">
        <h2>Añadir expresión o patrón entrenable</h2>
        <p>
          Selecciona lo que necesitas producir. No añadas automáticamente un
          error dudoso.
        </p>
        {pattern && (
          <p>
            Vincular a Error Bank: <strong>{pattern.pattern}</strong>. Escribe
            una forma correcta, no el error.
          </p>
        )}
        <label>
          Expresiones de la biblioteca
          <select
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
          >
            <option value={-1}>Crear mi propia expresión</option>
            {chunks.map(([a], i) => (
              <option value={i} key={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <form
          key={`${seed}-${pattern?.id ?? ""}`}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              f = new FormData(form);
            setBusy(true);
            try {
              const value = vocabularySchema.parse({
                id: crypto.randomUUID(),
                expression: f.get("expression"),
                note: f.get("note"),
                example: f.get("example"),
                topic: f.get("topic"),
                createdOn: today,
                patternId: pattern?.id ?? null,
                validatedByUser: f.get("validated") === "on",
                reviews: [],
              });
              await add(value);
              form.reset();
              setMessage(
                "Expresión guardada. Primera recuperación pendiente; no marcada como dominada.",
              );
            } catch (e) {
              setMessage(
                e instanceof Error && e.message.includes("ya está")
                  ? e.message
                  : "No se guardó: revisa los campos y confirma la corrección si la vinculas a un error.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Expresión correcta
            <input
              name="expression"
              required
              minLength={2}
              maxLength={200}
              defaultValue={seed >= 0 ? chunks[seed][0] : ""}
            />
          </label>
          <label>
            Significado o pista para recuperar
            <textarea
              name="note"
              required
              minLength={2}
              maxLength={2000}
              defaultValue={seed >= 0 ? chunks[seed][1] : ""}
            />
          </label>
          <label>
            Ejemplo de referencia
            <textarea name="example" maxLength={2000} />
          </label>
          <label>
            Tema
            <input name="topic" maxLength={100} defaultValue="argumentation" />
          </label>
          {pattern && (
            <label className="option">
              <input name="validated" type="checkbox" required />
              He comprobado esta corrección y quiero repasarla
            </label>
          )}
          <button className="button" disabled={busy || !ready}>
            Añadir a mis revisiones
          </button>
        </form>
      </section>
      <section className="card">
        <h2>Mi vocabulario ({coach.vocabulary.length})</h2>
        {coach.vocabulary.map((v) => {
          const s = srsState(v);
          return (
            <article className="feedback" key={v.id}>
              <h3 lang="en">{v.expression}</h3>
              <p>{v.note}</p>
              <p>
                Próxima revisión: {s.due} · {s.recognition} · {s.production}
              </p>
              {v.patternId && (
                <p>
                  Vinculado a un error validado por ti.{" "}
                  <Link href="/errors">Consultar Error Bank →</Link>
                </p>
              )}
              <details>
                <summary>Historial ({v.reviews.length})</summary>
                {v.reviews.map((r) => (
                  <p key={r.id}>
                    {r.date} · {r.mode} ·{" "}
                    {r.correct ? "acierto declarado" : "error"}
                    {r.assisted ? " · con ayuda" : ""} · {r.example} {r.context}
                  </p>
                ))}
              </details>
            </article>
          );
        })}
      </section>
    </>
  );
}

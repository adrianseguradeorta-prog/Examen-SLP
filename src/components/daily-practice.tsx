"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTraining } from "./use-training";
import type { ErrorData } from "./error-bank";
import { LocalPracticeNotice } from "./local-practice-notice";
import { nextPractice } from "@/lib/daily-practice";
import { practiceRequest, PRACTICE_PREFIX } from "@/lib/local-practice";

export function DailyPractice({ local }: { local: boolean }) {
  const { data, error, loading, mutate } = useTraining(local);
  const [errors, setErrors] = useState<ErrorData | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const completionId = useRef("");
  const [completionMessage, setCompletionMessage] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    practiceRequest(local, "/api/errors", { signal: abort.signal })
      .then(async (r) => {
        if (r.ok && !abort.signal.aborted) setErrors(await r.json());
      })
      .catch(() => {
        /* Recommendations abstain from Error Bank evidence. */
      });
    return () => abort.abort();
  }, [local]);
  const next = nextPractice(
    data,
    errors,
    new Date().toISOString().slice(0, 10),
  );
  return (
    <>
      {local && <LocalPracticeNotice />}
      <section className="card" aria-label="Práctica siguiente">
        <div className="eyebrow">
          TU SIGUIENTE PRÁCTICA {next.week ? `· SEMANA ${next.week}` : ""}
        </div>
        <h2>{loading ? "Preparando tu siguiente paso…" : next.title}</h2>
        {!loading && (
          <>
            <p>{next.reason}</p>
            <p>{next.minutes} minutos orientativos · sin evaluación de nivel</p>
            {next.focus && (
              <p className="feedback">
                Foco tomado de tus observaciones: {next.focus}
              </p>
            )}
            <Link href={next.href} className="button">
              Empezar este ejercicio →
            </Link>
          </>
        )}
        {error && (
          <p role="status">{error} Se muestra una propuesta general.</p>
        )}
        {!errors && (
          <p className="small muted">
            Sin datos de Error Bank disponibles: no se infieren errores
            personales.
          </p>
        )}
        <p>
          <Link href="/plan#activity">
            Consultar plan e historial de actividades →
          </Link>
        </p>
        <details>
          <summary>He terminado una práctica: registrar minutos</summary>
          <p>
            Elige lo que acabas de practicar, aunque la recomendación haya
            cambiado. No lo registres otra vez en Plan.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              completionId.current ||= crypto.randomUUID();
              setSaving(true);
              try {
                await mutate({
                  action: "activity",
                  data: {
                    id: completionId.current,
                    skill: f.get("skill"),
                    minutes: Number(f.get("minutes")),
                    studied_on: new Date().toISOString().slice(0, 10),
                    note: String(f.get("note")),
                  },
                });
                completionId.current = "";
                form.reset();
                setCompletionMessage(
                  "Práctica registrada. La propuesta siguiente utiliza los minutos guardados; no es una evaluación de nivel.",
                );
              } catch (e) {
                setCompletionMessage(
                  e instanceof Error ? e.message : "No se pudo registrar",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <label>
              Destreza practicada
              <select name="skill" defaultValue="" required disabled={saving}>
                <option value="" disabled>
                  Selecciona la que has practicado
                </option>
                {["reading", "speaking", "writing", "listening"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minutos reales
              <input
                name="minutes"
                type="number"
                min="1"
                max="180"
                required
                disabled={saving}
              />
            </label>
            <label>
              Qué has trabajado
              <input
                name="note"
                maxLength={500}
                disabled={saving}
                placeholder="Ej.: lectura sobre alertas y justificación de inferencias"
              />
            </label>
            <button className="button" disabled={!data || saving}>
              {saving ? "Guardando…" : "Registrar práctica terminada"}
            </button>
          </form>
          <p role="status">{completionMessage}</p>
        </details>
      </section>
      <section className="card">
        <h2>Tu primera sesión · unos 40 minutos</h2>
        <ol>
          <li>
            <Link href="/diagnostic">Reading (10 min)</Link>: lee «Warnings are
            only the beginning», contesta y entrega las cuatro respuestas antes
            de ver la explicación.
          </li>
          <li>
            <Link href="/speaking#practice">Speaking (15 min)</Link>: desarrolla
            una postura, responde a una objeción y cambia una condición. Habla
            en voz alta; no hace falta grabar.
          </li>
          <li>
            <Link href="/writing">Writing (10 min)</Link>: redacta tu
            recomendación sobre trabajo flexible, con una razón y una objeción.
            Relee y descarga una copia.
          </li>
          <li>
            <Link href="/errors">Error Bank (5 min)</Link>: anota un error que
            hayas identificado y un ejemplo exacto. Si no estás seguro, no lo
            registres como error demostrado.
          </li>
          <li>
            <Link href="/plan">Plan y actividad</Link>: guarda tu fecha de
            inicio y carga semanal; registra Reading, Speaking y Writing por
            separado, sin duplicar minutos. Vuelve a Hoy.
          </li>
        </ol>
        <p className="small muted">
          Abrir una pantalla no cuenta como practicar. Listening conserva su
          hueco en el plan, pero aún no hay un ejercicio de audio evaluable. Las
          recomendaciones no cambian automáticamente las fechas ni los objetivos
          de nivel.
        </p>
        {local && (
          <button
            className="text-button"
            onClick={() => {
              try {
                const records: Record<string, string> = {};
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if (k?.startsWith(PRACTICE_PREFIX))
                    records[k] = localStorage.getItem(k)!;
                }
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify({ version: 1, records }, null, 2)], {
                    type: "application/json",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "slp-practice-history.json";
                a.click();
                URL.revokeObjectURL(url);
                setMessage(
                  "Historial exportado. Writing se descarga por separado desde su editor. La importación aún no está implementada.",
                );
              } catch {
                setMessage(
                  "No se pudo exportar: revisa el acceso al almacenamiento del navegador.",
                );
              }
            }}
          >
            Descargar historial local
          </button>
        )}
        <p role="status">{message}</p>
      </section>
    </>
  );
}

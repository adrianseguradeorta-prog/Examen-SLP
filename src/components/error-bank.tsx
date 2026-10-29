"use client";
import { LocalPracticeNotice } from "./local-practice-notice";
import { practiceRequest } from "@/lib/local-practice";
import { useEffect, useRef, useState } from "react";
import {
  categories,
  type Observation,
  type Pattern,
  type errorProgress,
  type recommendPractice,
} from "@/lib/errors";
export type ErrorData = {
  patterns: (Pattern & { progress: ReturnType<typeof errorProgress> | null })[];
  observations: Observation[];
  recommendations: ReturnType<typeof recommendPractice>;
  truncated: boolean;
};
export function ErrorBank({ local = false }: { local?: boolean }) {
  const [data, setData] = useState<ErrorData | null>(null);
  const [message, setMessage] = useState("Cargando observaciones…");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState("");
  const ids = useRef({ event: "", pattern: "" });
  async function load() {
    const r = await practiceRequest(local, "/api/errors", {
      cache: "no-store",
    });
    const j = await r.json();
    if (!r.ok) throw Error(j.error);
    setData(j);
  }
  useEffect(() => {
    const abort = new AbortController();
    practiceRequest(local, "/api/errors", {
      signal: abort.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        return j;
      })
      .then((j) => {
        setData(j);
        setMessage("");
      })
      .catch((e) => {
        if (!abort.signal.aborted) setMessage(e.message);
      });
    return () => abort.abort();
  }, [local]);
  async function remove(kind: string, id: string) {
    if (
      kind === "pattern" &&
      !window.confirm("¿Borrar este patrón y todos sus ejemplos?")
    )
      return;
    setBusy(true);
    try {
      const r = await practiceRequest(local, "/api/errors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id }),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      if (selected === id) setSelected("");
      await load();
      setMessage("Registro eliminado. Estado recalculado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo borrar");
    } finally {
      setBusy(false);
    }
  }
  const current = data?.patterns.find((p) => p.id === selected);
  return (
    <>
      {local && <LocalPracticeNotice />}
      <div className="notice">
        Observaciones registradas por ti. Los estados son reglas de seguimiento,
        no una evaluación oficial ni una detección automática de IA.
      </div>
      <p role="status">{message}</p>
      {data?.truncated && (
        <div className="notice">
          Historial parcial por límite de carga: no interpretes los estados como
          una revisión de todo tu historial.
        </div>
      )}
      <div className="two-col">
        <section className="card">
          <h2>Registrar una observación</h2>
          <label>
            Patrón
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                ids.current = { event: "", pattern: "" };
              }}
            >
              <option value="">Crear patrón nuevo</option>
              {data?.patterns.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pattern}
                </option>
              ))}
            </select>
          </label>
          <form
            key={selected}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              ids.current.event ||= crypto.randomUUID();
              ids.current.pattern ||= crypto.randomUUID();
              setBusy(true);
              try {
                const r = await practiceRequest(local, "/api/errors", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: ids.current.event,
                    pattern_id: current?.id ?? ids.current.pattern,
                    pattern: current?.pattern ?? String(f.get("pattern")),
                    category: current?.category ?? f.get("category"),
                    skill: f.get("skill"),
                    session_ref: f.get("session_ref"),
                    occurred_on: f.get("occurred_on"),
                    outcome: f.get("outcome"),
                    example: f.get("example"),
                    assisted: f.get("assisted") === "on",
                  }),
                });
                const j = await r.json();
                if (!r.ok) throw Error(j.error);
                ids.current = { event: "", pattern: "" };
                form.reset();
                setSelected(j.pattern_id);
                await load();
                setMessage("Observación guardada.");
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "No se pudo guardar",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {!current && (
              <>
                <label>
                  Patrón concreto
                  <input
                    disabled={busy}
                    name="pattern"
                    minLength={3}
                    maxLength={160}
                    placeholder="Ej.: pasado simple al narrar experiencias"
                    required
                  />
                </label>
                <label>
                  Categoría
                  <select disabled={busy} name="category">
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label>
              Destreza
              <select disabled={busy} name="skill">
                {["speaking", "writing", "reading", "listening"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Sesión o contexto de práctica
              <input
                disabled={busy}
                name="session_ref"
                minLength={3}
                maxLength={120}
                placeholder="Ej.: speaking-2026-10-28"
                required
              />
            </label>
            <label>
              Fecha
              <input
                type="date"
                name="occurred_on"
                defaultValue={new Date().toISOString().slice(0, 10)}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </label>
            <label>
              Qué ocurrió
              <select disabled={busy} name="outcome">
                <option value="error">El error apareció</option>
                {current && (
                  <option value="correct">
                    Uso correcto en una oportunidad real
                  </option>
                )}
              </select>
            </label>
            <label>
              Ejemplo exacto
              <textarea
                disabled={busy}
                name="example"
                minLength={3}
                maxLength={2000}
                style={{ minHeight: 110 }}
                required
              />
            </label>
            <label className="option">
              <input type="checkbox" name="assisted" /> Recibí ayuda o repetí un
              modelo
            </label>
            <button className="button" disabled={busy || !data}>
              Guardar observación
            </button>
          </form>
          <p className="small muted">
            Usa el mismo identificador para observaciones de una misma sesión.
            El uso correcto con ayuda no cuenta como dominio independiente.
          </p>
        </section>
        <section className="card">
          <h2>Tu próxima práctica</h2>
          {!data?.recommendations.length && (
            <p className="muted">
              Registra un error concreto para obtener una recomendación.
            </p>
          )}
          {data?.recommendations.map((p) => (
            <article className="feedback" key={p.id}>
              <h3>{p.pattern}</h3>
              <p>
                {p.status} · {p.frequency} observaciones de error
              </p>
              <p lang="en">{p.prompt}</p>
              <p className="small">
                Después, registra qué ocurrió en una nueva sesión. Un consejo
                mostrado no equivale a una actividad completada.
              </p>
            </article>
          ))}
          <details>
            <summary>Cómo cambian los estados</summary>
            <p>
              NEW: primera observación. RECURRING: errores en dos sesiones
              distintas. IMPROVING: tres oportunidades correctas sin ayuda, en
              dos sesiones, después del último día con error. CONTROLLED: cinco
              oportunidades, tres sesiones y al menos 14 días entre usos
              correctos. Una recurrencia reinicia esta evidencia.
            </p>
            <p>
              No utilizar la estructura no cuenta como hacerlo bien. Estos
              mínimos son reglas de producto, pendientes de validación
              pedagógica.
            </p>
          </details>
        </section>
      </div>
      <section className="card">
        <h2>Patrones y evidencias</h2>
        {!data?.patterns.length && <p>Aún no has registrado patrones.</p>}
        {data?.patterns.map((p) => (
          <article key={p.id} className="card">
            <div className="section-title">
              <h3>{p.pattern}</h3>
              <span>{p.progress?.status ?? "HISTORIAL INCOMPLETO"}</span>
            </div>
            <p className="small muted">
              {p.category} · frecuencia {p.progress?.frequency ?? "—"} · primera{" "}
              {p.progress?.first ?? "sin error registrado"} · última{" "}
              {p.progress?.last ?? "—"}
            </p>
            <button
              className="text-button"
              onClick={() => {
                setSelected(p.id);
                ids.current = { event: "", pattern: "" };
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Añadir observación
            </button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => remove("pattern", p.id)}
            >
              Borrar patrón
            </button>
            <details>
              <summary>Ver ejemplos y oportunidades</summary>
              {data.observations
                .filter((o) => o.pattern_id === p.id)
                .map((o) => (
                  <div className="history-row" key={o.id}>
                    <div>
                      <strong>
                        {o.outcome === "error" ? "Error" : "Uso correcto"} ·{" "}
                        {o.skill}
                      </strong>
                      <p>
                        {o.occurred_on} · {o.session_ref}
                        {o.assisted ? " · con ayuda" : ""}
                      </p>
                      <p className="preserve-lines" lang="en">
                        {o.example}
                      </p>
                    </div>
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => remove("observation", o.id)}
                    >
                      Eliminar observación
                    </button>
                  </div>
                ))}
            </details>
          </article>
        ))}
      </section>
    </>
  );
}

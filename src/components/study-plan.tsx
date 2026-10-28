"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useTraining } from "./use-training";
import {
  planInput,
  buildPlan,
  activitySummary,
  type PlanInput,
} from "@/lib/training";
export function StudyPlan() {
  const { data, error, loading, mutate, load } = useTraining();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const planId = useRef("");
  const activityId = useRef("");
  const [preview, setPreview] = useState<PlanInput | null>(null);
  const plan = data?.plans[0] ?? preview;
  const today = new Date().toISOString().slice(0, 10);
  const summary = activitySummary(data?.activities ?? [], today);
  async function remove(kind: string, id: string) {
    setBusy(true);
    try {
      await mutate({ kind, id }, "DELETE");
      setMessage("Registro eliminado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error de borrado");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <div className="notice">
          {error} <Link href="/settings">Conectar cuenta</Link>
        </div>
      )}
      <p role="status">{loading ? "Consultando tu entrenamiento…" : message}</p>
      <div className="two-col">
        <section className="card">
          <h2>Tu plan inicial</h2>
          <p className="muted">
            La carga se concentra en Speaking. Los cambios crean una nueva
            versión y conservan los planes anteriores.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              planId.current ||= crypto.randomUUID();
              const p = {
                id: planId.current,
                start_date: String(f.get("start_date")),
                exam_date: String(f.get("exam_date")) || null,
                weekly_minutes: Number(f.get("weekly_minutes")) as
                  360 | 390 | 420,
              };
              const validated = planInput.safeParse(p);
              if (!validated.success) {
                setMessage(
                  "Revisa las fechas: el examen debe ser posterior al inicio.",
                );
                return;
              }
              setPreview(validated.data);
              setBusy(true);
              try {
                await mutate({ action: "plan", data: p });
                planId.current = "";
                setMessage(
                  "Plan guardado. Disponible desde tu cuenta en otros dispositivos.",
                );
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "No se pudo guardar",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Fecha de inicio
              <input type="date" name="start_date" required />
            </label>
            <label>
              Fecha del examen (opcional)
              <input type="date" name="exam_date" />
            </label>
            <label>
              Tiempo semanal
              <select name="weekly_minutes" defaultValue="390">
                <option value="360">6 horas</option>
                <option value="390">6 horas y media</option>
                <option value="420">7 horas</option>
              </select>
            </label>
            <button className="button" disabled={busy}>
              Preparar y guardar plan
            </button>
          </form>
          <p className="small muted">
            Si falta conexión, la vista previa no queda guardada. No predice una
            fecha de ascenso de nivel.
          </p>
        </section>
        <section className="card">
          <h2>Tu práctica registrada</h2>
          <div className="metrics">
            <div>
              <strong>{summary.lastSevenDays}</strong>
              <span>min · últimos 7 días UTC</span>
            </div>
            <div>
              <strong>{summary.total}</strong>
              <span>min · historial cargado</span>
            </div>
            <div>
              <strong>{summary.days}</strong>
              <span>días de práctica / 7</span>
            </div>
          </div>
          <p className="small muted">
            Tiempos declarados por ti, no mediciones automáticas ni evidencia de
            nivel. Se muestran hasta 1.000 registros.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              activityId.current ||= crypto.randomUUID();
              setBusy(true);
              try {
                await mutate({
                  action: "activity",
                  data: {
                    id: activityId.current,
                    skill: f.get("skill"),
                    minutes: Number(f.get("minutes")),
                    studied_on: f.get("studied_on"),
                    note: f.get("note"),
                  },
                });
                activityId.current = "";
                form.reset();
                setMessage("Actividad guardada.");
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "No se pudo guardar",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Destreza
              <select name="skill">
                <option value="speaking">Speaking</option>
                <option value="writing">Writing</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </label>
            <label>
              Minutos practicados
              <input
                type="number"
                name="minutes"
                min="1"
                max="180"
                defaultValue="20"
                required
              />
            </label>
            <label>
              Fecha
              <input type="date" name="studied_on" max={today} required />
            </label>
            <label>
              Qué has trabajado
              <input
                name="note"
                maxLength={500}
                placeholder="Ej.: defender una hipótesis sobre energía"
              />
            </label>
            <button className="button" disabled={busy || !data}>
              Registrar actividad
            </button>
          </form>
        </section>
      </div>
      {plan && (
        <section className="card">
          <div className="section-title">
            <h2>36 semanas de trabajo</h2>
            <span>
              {data?.plans[0]
                ? "Guardado en cloud"
                : "Vista previa · sin guardar"}
            </span>
          </div>
          <p>
            Prioridad Speaking · {plan.weekly_minutes} minutos por semana ·{" "}
            {plan.exam_date
              ? `Examen: ${plan.exam_date}`
              : "Fecha de examen por definir"}
          </p>
          <p className="muted">
            Plan de partida, todavía no adaptado a evaluaciones. Si una semana
            cae después del examen, aparece marcada para revisar el calendario.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Inicio</th>
                  <th>Enfoque</th>
                  <th>S / W / R / L / repaso</th>
                </tr>
              </thead>
              <tbody>
                {buildPlan(plan).map((w) => (
                  <tr key={w.week}>
                    <td>{w.week}</td>
                    <td>{w.starts}</td>
                    <td>
                      {w.phase}
                      {w.afterExam ? " · después del examen" : ""}
                    </td>
                    <td>{Object.values(w.minutes).join(" / ")} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="card">
        <h2>Historial de actividades</h2>
        {!data?.activities.length && (
          <p className="muted">Aún no hay actividades guardadas.</p>
        )}
        {data?.activities.map((a) => (
          <div className="history-row" key={a.id}>
            <div>
              <strong>
                {a.skill} · {a.minutes} min
              </strong>
              <p>
                {a.studied_on} · {a.note || "Sin nota"}
              </p>
            </div>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => remove("activity", a.id)}
            >
              Borrar
            </button>
          </div>
        ))}
        <button className="text-button" onClick={() => load()}>
          Actualizar desde servidor
        </button>
      </section>
      {Boolean(data?.plans.length) && (
        <section className="card">
          <h2>Versiones del plan</h2>
          {data?.plans.map((p) => (
            <div className="history-row" key={p.id}>
              <span>
                Inicio {p.start_date} · {p.weekly_minutes} min/semana
              </span>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => remove("plan", p.id)}
              >
                Borrar versión
              </button>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

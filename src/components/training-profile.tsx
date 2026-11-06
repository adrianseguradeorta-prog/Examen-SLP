"use client";
import { useState } from "react";
import { currentProfile, profileSchema, skills } from "@/lib/coach-model";
import { useCoach } from "./use-coach";
export function TrainingProfile({ owner = "guest" }: { owner?: string }) {
  const { coach, ready, error, update } = useCoach(true, owner);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const profile = currentProfile(coach);
  return (
    <section className="card" id="profile">
      <h2>Mi perfil de entrenamiento</h2>
      <p>
        Estos niveles son declarados por ti. La aplicación no los convierte en
        evaluaciones. Cambiar disponibilidad no altera actividades ni acepta una
        nueva semana automáticamente.
      </p>
      {error && <p role="alert">{error}</p>}
      {ready && (
        <form
          key={coach.profiles.at(-1)?.id ?? "default"}
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            try {
              const value = profileSchema.parse({
                declared: Object.fromEntries(
                  skills.map((s) => [s, f.get(`declared-${s}`)]),
                ),
                target: Object.fromEntries(
                  skills.map((s) => [s, f.get(`target-${s}`)]),
                ),
                examDate: f.get("examDate") || null,
                weeklyMinutes: Number(f.get("weeklyMinutes")),
                priority: f.get("priority"),
                timeZone: f.get("timeZone"),
                days: f.getAll("days").map(Number),
              });
              await update((c) => ({
                ...c,
                profiles: [
                  ...c.profiles,
                  {
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    value,
                  },
                ],
              }));
              setMessage(
                "Perfil guardado en este navegador. Revisa tu propuesta en Plan.",
              );
            } catch {
              setMessage(
                "No se guardó. Revisa campos, días, zona horaria y almacenamiento; recarga si hay otra pestaña editando.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="two-col">
            {skills.map((s) => (
              <fieldset key={s}>
                <legend>{s}</legend>
                {(["declared", "target"] as const).map((kind) => (
                  <label key={kind}>
                    {kind === "declared" ? "Declarado" : "Objetivo"} · {s}
                    <select
                      name={`${kind}-${s}`}
                      defaultValue={profile[kind][s]}
                    >
                      {[
                        "unknown",
                        "0",
                        "0+",
                        "1",
                        "1+",
                        "2",
                        "2+",
                        "3",
                        "3+",
                        "4",
                        "4+",
                        "5",
                      ].map((l) => (
                        <option key={l} value={l}>
                          {l === "unknown" ? "Sin declarar" : l}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <label>
            Minutos disponibles por semana
            <input
              name="weeklyMinutes"
              type="number"
              min={30}
              max={1260}
              required
              defaultValue={profile.weeklyMinutes}
            />
          </label>
          <label>
            Prioridad principal
            <select name="priority" defaultValue={profile.priority}>
              {skills.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Fecha prevista de examen
            <input
              name="examDate"
              type="date"
              defaultValue={profile.examDate ?? ""}
            />
          </label>
          <label>
            Zona horaria
            <input
              name="timeZone"
              required
              maxLength={100}
              defaultValue={profile.timeZone}
              list="timezones"
            />
          </label>
          <datalist id="timezones">
            <option>Europe/Madrid</option>
            <option>Atlantic/Canary</option>
            <option>UTC</option>
          </datalist>
          <fieldset>
            <legend>Días habituales (orientativos)</legend>
            {[
              "Domingo",
              "Lunes",
              "Martes",
              "Miércoles",
              "Jueves",
              "Viernes",
              "Sábado",
            ].map((d, i) => (
              <label className="option" key={d}>
                <input
                  type="checkbox"
                  name="days"
                  value={i}
                  defaultChecked={profile.days.includes(i)}
                />
                {d}
              </label>
            ))}
          </fieldset>
          <button className="button" disabled={busy}>
            Guardar perfil
          </button>
        </form>
      )}
      <p role="status">{message}</p>
      <details>
        <summary>Versiones de mi perfil ({coach.profiles.length})</summary>
        {coach.profiles.map((p) => (
          <p key={p.id}>
            {p.createdAt.slice(0, 10)} · {p.value.weeklyMinutes} min · prioridad{" "}
            {p.value.priority}
          </p>
        ))}
      </details>
    </section>
  );
}
export function ProfileSummary({ local }: { local: boolean }) {
  const { coach, ready } = useCoach(local);
  const profile = currentProfile(coach);
  return (
    <section className="card">
      <h2>Tu punto de partida</h2>
      <p>
        Perfil declarado ·{" "}
        {ready && coach.profiles.length
          ? "editable en Perfil y copias"
          : "valores iniciales, pendientes de confirmar"}
        . Estimación de la aplicación: evidencia insuficiente.
      </p>
      <div className="skill-grid">
        {skills.map((s) => (
          <article className="skill-card" key={s}>
            <span>{s}</span>
            <strong>
              {profile.declared[s] === "unknown" ? "—" : profile.declared[s]}
              <em>
                {" "}
                → {profile.target[s] === "unknown" ? "—" : profile.target[s]}
              </em>
            </strong>
            <p>Declarado → objetivo; no evaluado</p>
          </article>
        ))}
      </div>
    </section>
  );
}

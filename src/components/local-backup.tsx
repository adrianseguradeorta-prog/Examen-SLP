"use client";
import { useState } from "react";
import {
  exportBackup,
  parseBackup,
  restoreBackup,
  backupSummary,
  deleteLocal,
  MAX_BACKUP_BYTES,
  type DeleteScope,
} from "@/lib/backup";
export function LocalBackup({ owner = "guest" }: { owner?: string }) {
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const preview = raw ? backupSummary(parseBackup(raw, owner)) : null;
  return (
    <section className="card" id="backup">
      <h2>Copia de seguridad</h2>
      <p>
        Incluye perfil, planes, actividad, muestras, errores, SRS y borradores
        de esta identidad. No incluye audio, cuentas ni credenciales. Guarda el
        archivo en un lugar privado.
      </p>
      <button
        className="button"
        onClick={() => {
          try {
            const b = exportBackup(
              localStorage,
              owner,
              new Date().toISOString(),
            );
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(b)], {
                type: "application/json",
              }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "slp-local-backup.json";
            a.click();
            URL.revokeObjectURL(url);
            setMessage("Copia exportada.");
          } catch (e) {
            setMessage(String(e));
          }
        }}
      >
        Exportar copia completa
      </button>
      <label>
        Seleccionar copia para restaurar
        <input
          type="file"
          accept="application/json,.json"
          onChange={async (e) => {
            setRaw("");
            setConfirmed(false);
            try {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > MAX_BACKUP_BYTES) throw Error("Máximo 5 MiB.");
              const text = await f.text();
              parseBackup(text, owner);
              setRaw(text);
              setMessage(
                "Archivo validado; aún no se ha cambiado ningún dato.",
              );
            } catch (e) {
              setMessage(String(e));
            }
          }}
        />
      </label>
      {preview && (
        <>
          <p>
            Se restaurarán {preview.records} registros, {preview.drafts}{" "}
            borradores, {preview.profiles} versiones de perfil, {preview.weeks}{" "}
            semanas y {preview.vocabulary} expresiones.
          </p>
          <label className="option">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            He cerrado las otras pestañas. Entiendo que se reemplazarán los
            datos de esta identidad, incluidos los borradores; no se combinarán.
          </label>
          <button
            className="button"
            disabled={!confirmed}
            onClick={() => {
              try {
                restoreBackup(localStorage, owner, raw, confirmed);
                window.location.reload();
              } catch (e) {
                setMessage(String(e));
              }
            }}
          >
            Reemplazar con esta copia
          </button>
          <button className="text-button" onClick={() => setRaw("")}>
            Cancelar
          </button>
        </>
      )}
      <h3>Borrado local</h3>
      <p>
        Haz una copia y cierra otras pestañas antes de borrar. «Todo» afecta
        solo a esta identidad de la aplicación; conserva claves ajenas y otras
        identidades.
      </p>
      {(
        [
          ["progress", "Progreso y planes (conserva tareas vistas)"],
          ["drafts", "Borradores"],
          ["errors", "Error Bank"],
          ["srs", "Vocabulario y SRS"],
          ["profile", "Perfil y semanas adaptadas"],
          ["all", "Todo mi espacio local"],
        ] as [DeleteScope, string][]
      ).map(([scope, label]) => (
        <button
          key={scope}
          className="text-button"
          onClick={() => {
            if (
              !confirm(
                `¿Borrar ${label}? No se puede deshacer sin una copia. Cierra las otras pestañas antes de confirmar.`,
              )
            )
              return;
            try {
              deleteLocal(localStorage, owner, scope, true);
              window.location.reload();
            } catch (e) {
              setMessage(String(e));
            }
          }}
        >
          {label}
        </button>
      ))}
      <p role="status">{message}</p>
    </section>
  );
}

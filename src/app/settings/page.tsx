import { DiagnosticBoundary } from "@/components/diagnostic-boundary";
import { TrainingProfile } from "@/components/training-profile";
import { LocalBackup } from "@/components/local-backup";
import { Account } from "@/components/account";
import { configured } from "@/lib/supabase";
export default function Settings() {
  return (
    <>
      <div className="eyebrow">TU ESPACIO PERSONAL</div>
      <h1>Perfil y copias</h1>
      {!configured() && (
        <>
          <DiagnosticBoundary owner="guest">
            <TrainingProfile />
            <LocalBackup />
          </DiagnosticBoundary>
        </>
      )}
      <p>
        Perfil y copias disponibles sin cuenta. La sincronización entre
        dispositivos sigue pendiente.
      </p>
      <Account connected={configured()} />
      <section className="card">
        <h2>Integraciones futuras · pendientes de autorización</h2>
        <ol className="instructions">
          <li>
            Crear proyecto Supabase en una región UE y aplicar la migración del
            repositorio.
          </li>
          <li>
            Crear tu usuario desde Supabase Auth; mantener registro público
            desactivado.
          </li>
          <li>
            Importar el repositorio en Vercel y configurar las variables
            indicadas en .env.example.
          </li>
          <li>
            Conectar OpenAI en el servidor y completar la prueba de voz antes de
            habilitar sesiones pagadas.
          </li>
        </ol>
        <p className="muted">
          No introduzcas API keys en esta página. Las claves se configuran como
          secretos del hosting.
        </p>
      </section>
    </>
  );
}

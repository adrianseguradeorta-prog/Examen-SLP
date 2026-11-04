import { TrainingProfile } from "@/components/training-profile";
import { LocalBackup } from "@/components/local-backup";
import { Account } from "@/components/account";
import { configured } from "@/lib/supabase";
export default function Settings() {
  return (
    <>
      <div className="eyebrow">TU ESPACIO PERSONAL</div>
      <h1>Perfil y copias</h1>
      {!configured() && <><TrainingProfile/><LocalBackup/></>}
      <p>La misma cuenta, tu progreso en todos tus dispositivos.</p>
      <Account connected={configured()} />
      <section className="card">
        <h2>Activar la plataforma</h2>
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

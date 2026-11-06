import { configured } from "@/lib/supabase";
import { ErrorBank } from "@/components/error-bank";
export default function Page() {
  return (
    <>
      <div className="eyebrow">OBSERVAR · REPARAR · TRANSFERIR</div>
      <h1>Tu Error Bank.</h1>
      <p>Convierte lo que se repite en una prioridad de práctica.</p>
      <ErrorBank local={!configured()} />
    </>
  );
}

import { configured } from "@/lib/supabase";
import { Diagnostic } from "@/components/diagnostic";
export default function Page() {
  return (
    <>
      <div className="eyebrow">EVIDENCIA ANTES QUE ETIQUETAS</div>
      <h1>Tu diagnóstico inicial.</h1>
      <p>Recoge muestras independientes y descubre qué necesitas trabajar.</p>
      <Diagnostic local={!configured()} />
    </>
  );
}

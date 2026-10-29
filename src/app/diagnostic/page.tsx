import { Diagnostic } from "@/components/diagnostic";
import { DiagnosticBoundary } from "@/components/diagnostic-boundary";
import { practiceIdentity } from "@/lib/practice-identity";
export default async function Page() {
  const { local, owner } = await practiceIdentity();
  return (
    <>
      <div className="eyebrow">EVIDENCIA ANTES QUE ETIQUETAS</div>
      <h1>Tu diagnóstico inicial.</h1>
      <p>
        Reading, Writing, Listening y Speaking: tareas de entrenamiento, no
        certificación.
      </p>
      <DiagnosticBoundary key={owner} owner={owner}>
        {owner && <Diagnostic local={local} owner={owner} />}
      </DiagnosticBoundary>
    </>
  );
}

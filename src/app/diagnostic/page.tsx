import { Diagnostic } from "@/components/diagnostic";
import { DiagnosticBoundary } from "@/components/diagnostic-boundary";
import { practiceIdentity } from "@/lib/practice-identity";
import { readingTasks, writingTasks } from "@/lib/task-catalog";
import { speakingTasks } from "@/lib/speaking-content";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const readingVersion =
    readingTasks.find((t) => t.version === params.reading)?.version ??
    readingTasks[0].version;
  const writingVersion =
    writingTasks.find((t) => t.version === params.writing)?.version ??
    writingTasks[0].version;
  const speakingVersion =
    speakingTasks.find((t) => t.version === params.speaking)?.version ??
    speakingTasks[0].version;
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
        {owner && (
          <Diagnostic
            local={local}
            owner={owner}
            readingVersion={readingVersion}
            writingVersion={writingVersion}
            speakingVersion={speakingVersion}
          />
        )}
      </DiagnosticBoundary>
    </>
  );
}

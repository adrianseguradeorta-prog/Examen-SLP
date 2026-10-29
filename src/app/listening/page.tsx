import { Listening } from "@/components/listening";
import { DiagnosticBoundary } from "@/components/diagnostic-boundary";
import { practiceIdentity } from "@/lib/practice-identity";
import { listeningTasks } from "@/lib/task-catalog";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const version =
    listeningTasks.find((t) => t.version === params.listening)?.version ??
    listeningTasks[0].version;
  const { local, owner } = await practiceIdentity();
  return (
    <>
      <h1>Listening Lab</h1>
      <DiagnosticBoundary key={owner} owner={owner}>
        {owner && (
          <Listening
            key={version}
            local={local}
            owner={owner}
            version={version}
          />
        )}
      </DiagnosticBoundary>
    </>
  );
}

import { Listening } from "@/components/listening";
import { DiagnosticBoundary } from "@/components/diagnostic-boundary";
import { practiceIdentity } from "@/lib/practice-identity";
export default async function Page() {
  const { local, owner } = await practiceIdentity();
  return (
    <>
      <h1>Listening Lab</h1>
      <DiagnosticBoundary key={owner} owner={owner}>
        {owner && <Listening local={local} owner={owner} />}
      </DiagnosticBoundary>
    </>
  );
}

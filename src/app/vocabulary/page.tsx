import { VocabularyLab } from "@/components/vocabulary";
import { DiagnosticBoundary } from "@/components/diagnostic-boundary";
import { practiceIdentity } from "@/lib/practice-identity";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {local,owner}=await practiceIdentity(),params=await searchParams;
  return <><h1>Vocabulario y repaso</h1><p>Reconocer una expresión y producirla son capacidades diferentes.</p>{local&&owner?<DiagnosticBoundary owner={owner}><VocabularyLab owner={owner} patternId={typeof params.pattern==="string"?params.pattern:""}/></DiagnosticBoundary>:<p>Este repaso funciona por ahora en el espacio local. La sincronización de vocabulario aún no está habilitada.</p>}</>;
}

import { configured } from "@/lib/supabase";
import { StudyPlan } from "@/components/study-plan";
export default function Page() {
  return (
    <>
      <div className="eyebrow">36 SEMANAS · UN OBJETIVO</div>
      <h1>Entrena con intención.</h1>
      <p>Planifica tu tiempo y registra lo que realmente has practicado.</p>
      <StudyPlan local={!configured()} />
    </>
  );
}

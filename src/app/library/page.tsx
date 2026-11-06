import { Library } from "@/components/library";
export default function Page() {
  return (
    <>
      <div className="eyebrow">APRENDER · PRODUCIR · REVISAR</div>
      <h1>Biblioteca de entrenamiento</h1>
      <p>
        Material original de práctica. No son preguntas oficiales del examen.
      </p>
      <Library />
    </>
  );
}

import type { Submission } from "./training";
const keys = [0, 1, 2, 1];
const explanations = [
  "The review links detection to understanding and action, without rejecting technology.",
  "The text says the proposals are not incompatible, but they compete for a limited budget.",
  "Contact details affect delivery of warnings, rather than the sensors' ability to detect water.",
  "The review questions defining success through technical improvements alone.",
];
export function diagnosticReport(s: Submission) {
  if (s.kind === "writing")
    return {
      kind: s.kind,
      estimatedLevel: null,
      status: "awaiting_review",
      message:
        "Texto conservado. Pendiente de evaluación; no se asigna nivel por longitud o vocabulario.",
    };
  return {
    kind: s.kind,
    estimatedLevel: null,
    status: "practice_feedback",
    correct: s.answers.filter((a, i) => a === keys[i]).length,
    total: keys.length,
    items: s.answers.map((a, i) => ({
      correct: a === keys[i],
      explanation: explanations[i],
    })),
    message:
      "Muestra breve no calibrada. Los aciertos orientan la práctica, pero no determinan un nivel SLP.",
  };
}

import type { Submission, DiagnosticReport } from "./training";
import { diagnosticReading } from "./diagnostic-content";
import { listeningTask } from "./listening-content";
import {
  listeningKeys,
  listeningExplanations,
  listeningTranscript,
} from "./listening-grading";
const keys = [0, 1, 2, 1];
const explanations = [
  "The review links detection to understanding and action, without rejecting technology.",
  "The text says the proposals are not incompatible, but they compete for a limited budget.",
  "Contact details affect delivery of warnings, rather than the sensors' ability to detect water.",
  "The review questions defining success through technical improvements alone.",
];
export function diagnosticReport(s: Submission): DiagnosticReport {
  if (s.kind === "speaking")
    return {
      kind: s.kind,
      estimatedLevel: null,
      status: "insufficient_evidence",
      message:
        "Tarea oral declarada como realizada. El audio es efímero y no se conserva como evidencia revisable. Evidencia insuficiente para evaluar pronunciación, fluidez o nivel SLP.",
    };
  if (s.kind === "writing")
    return {
      kind: s.kind,
      estimatedLevel: null,
      status: "awaiting_review",
      message:
        "Texto conservado. Pendiente de evaluación; no se asigna nivel por longitud o vocabulario.",
    };
  const answerKeys = s.kind === "listening" ? listeningKeys : keys;
  const why = s.kind === "listening" ? listeningExplanations : explanations;
  const questions =
    s.kind === "listening"
      ? listeningTask.questions
      : diagnosticReading.questions;
  return {
    kind: s.kind,
    estimatedLevel: null,
    status: "practice_feedback",
    correct: s.answers.filter((a, i) => a === answerKeys[i]).length,
    total: answerKeys.length,
    items: s.answers.map((a, i) => ({
      correct: a === answerKeys[i],
      explanation: why[i],
      type: questions[i].type,
    })),
    ...(s.kind === "listening" ? { transcript: listeningTranscript } : {}),
    message:
      "Muestra breve no calibrada. Los aciertos orientan la práctica, pero no determinan un nivel SLP.",
  };
}

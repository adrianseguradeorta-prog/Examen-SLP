import { addDays } from "./training";
import { vocabularySchema, type Vocabulary, type Review } from "./coach-model";
export const intervals = [1, 3, 7, 14, 30] as const;
export function srsState(item: Vocabulary) {
  let step = -1,
    due = item.createdOn;
  let recognition = false;
  const independent: Review[] = [];
  for (const review of item.reviews) {
    const eligible = review.date >= due;
    const successful = review.correct && !review.assisted;
    if (review.mode === "recognition") recognition = successful;
    if (
      review.mode === "production" &&
      successful &&
      review.example.trim() &&
      review.context.trim()
    )
      independent.push(review);
    // An early same-day click never advances spacing; an error always resets it.
    if (!successful) {
      step = 0;
      due = addDays(review.date, intervals[0]);
    } else if (eligible) {
      step = Math.min(step + 1, intervals.length - 1);
      due = addDays(review.date, intervals[step]);
    }
  }
  return {
    due,
    intervalDays: step < 0 ? 0 : intervals[step],
    recognition: recognition
      ? "Reconocimiento declarado"
      : "Reconocimiento por practicar",
    production: independent.length
      ? "Uso independiente declarado · no verificado"
      : "Sin uso independiente registrado",
    independentUses: independent.length,
    mastered: false as const,
  };
}
export function addReview(item: Vocabulary, review: Review, today: string) {
  if (
    review.date > today ||
    review.date < item.createdOn ||
    (item.reviews.at(-1) && review.date < item.reviews.at(-1)!.date)
  )
    throw Error("Fecha de revisión inválida.");
  if (
    review.mode === "production" &&
    review.correct &&
    !review.assisted &&
    (!review.example.trim() || !review.context.trim())
  )
    throw Error(
      "Anota tu frase y un contexto propio para registrar producción independiente.",
    );
  const old = item.reviews.find((r) => r.id === review.id);
  if (old) {
    if (JSON.stringify(old) !== JSON.stringify(review))
      throw Error("Revisión ya registrada con otro contenido.");
    return item;
  }
  return vocabularySchema.parse({
    ...item,
    reviews: [...item.reviews, review],
  });
}
export function dueVocabulary(items: Vocabulary[], today: string) {
  return items
    .filter((v) => srsState(v).due <= today)
    .sort(
      (a, b) =>
        srsState(a).due.localeCompare(srsState(b).due) ||
        a.createdOn.localeCompare(b.createdOn) ||
        a.id.localeCompare(b.id),
    );
}

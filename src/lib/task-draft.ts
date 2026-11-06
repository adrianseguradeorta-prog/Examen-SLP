import { z } from "zod";
import { comprehensionTask } from "./task-catalog";
import { speakingTasks } from "./speaking-content";
const draftSchema = z
  .object({
    schema: z.literal(1),
    owner: z.string().min(1),
    kind: z.enum(["reading", "listening", "speaking"]),
    version: z.string(),
    id: z.uuid(),
    updatedAt: z.iso.datetime(),
    answers: z.record(z.string(), z.number().int().min(0).max(2)),
    notes: z.string().max(2000),
    assisted: z.boolean(),
  })
  .strict();
export type TaskDraft = z.infer<typeof draftSchema>;
export function taskDraftKey(
  owner: string,
  kind: TaskDraft["kind"],
  version: string,
) {
  return `slp:task-draft:v1:${encodeURIComponent(owner)}:${kind}:${encodeURIComponent(version)}`;
}
export function parseTaskDraft(
  raw: string | null,
  owner: string,
  kind: TaskDraft["kind"],
  version: string,
): TaskDraft | null {
  if (!raw) return null;
  try {
    const d = draftSchema.parse(JSON.parse(raw));
    if (d.owner !== owner || d.kind !== kind || d.version !== version)
      return null;
    if (kind === "speaking") {
      if (
        !speakingTasks.some((t) => t.version === version) ||
        Object.keys(d.answers).length
      )
        return null;
    } else {
      const task = comprehensionTask(kind, version);
      if (
        !task ||
        d.notes ||
        d.assisted ||
        Object.keys(d.answers).some(
          (k) =>
            !/^\d+$/.test(k) ||
            String(Number(k)) !== k ||
            Number(k) >= task.questions.length,
        )
      )
        return null;
    }
    return d;
  } catch {
    return null;
  }
}
export function createTaskDraft(
  owner: string,
  kind: TaskDraft["kind"],
  version: string,
): TaskDraft {
  return {
    schema: 1,
    owner,
    kind,
    version,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    answers: {},
    notes: "",
    assisted: false,
  };
}
export function saveTaskDraft(store: Pick<Storage, "setItem">, d: TaskDraft) {
  if (!parseTaskDraft(JSON.stringify(d), d.owner, d.kind, d.version))
    throw Error("Borrador inválido");
  store.setItem(taskDraftKey(d.owner, d.kind, d.version), JSON.stringify(d));
}
export function clearTaskDraft(
  store: Pick<Storage, "getItem" | "removeItem">,
  d: TaskDraft,
) {
  const key = taskDraftKey(d.owner, d.kind, d.version);
  const current = store.getItem(key);
  // Never erase a newer attempt or another tab's changes.
  if (current === null) return;
  const stored = parseTaskDraft(current, d.owner, d.kind, d.version);
  if (
    !stored ||
    stored.id !== d.id ||
    stored.updatedAt !== d.updatedAt ||
    JSON.stringify(stored) !== JSON.stringify(d)
  )
    throw Error("Hay otra copia pendiente; no se ha borrado.");
  store.removeItem(key);
}

import { z } from "zod";
import {
  parseLocalWritingDraft,
  type LocalWritingDraft,
} from "./writing-draft";
import { diagnosticWriting } from "./diagnostic-content";
import { writingTasks } from "./task-catalog";

export type DiagnosticDraft = LocalWritingDraft & {
  submissionId: string;
  closed: boolean;
};
export function diagnosticDraftKey(
  owner: string,
  version = diagnosticWriting.version,
) {
  return `slp:diagnostic:writing:v1:${encodeURIComponent(owner)}${version === diagnosticWriting.version ? "" : ":" + encodeURIComponent(version)}`;
}
export function parseDiagnosticDraft(
  raw: string | null,
  owner: string,
  version = diagnosticWriting.version,
): DiagnosticDraft | null {
  const draft = parseLocalWritingDraft(raw, owner);
  if (
    !draft ||
    !writingTasks.some((t) => t.version === version) ||
    draft.task !== version ||
    draft.text.length > 30000
  )
    return null;
  try {
    const { submissionId, closed } = z
      .object({ submissionId: z.uuid(), closed: z.boolean() })
      .parse(JSON.parse(raw!));
    return { ...draft, submissionId, closed };
  } catch {
    return null;
  }
}
export function newDiagnosticDraft(
  owner: string,
  uuid: () => string,
  now: () => string,
  version = diagnosticWriting.version,
): DiagnosticDraft {
  return {
    userKey: owner,
    id: uuid(),
    revision: 0,
    text: "",
    task: version,
    dirty: false,
    lastSyncedText: "",
    updatedAt: now(),
    submissionId: uuid(),
    closed: false,
  };
}
export function saveDiagnosticDraft(
  store: Pick<Storage, "setItem">,
  draft: DiagnosticDraft,
) {
  store.setItem(
    diagnosticDraftKey(draft.userKey, draft.task),
    JSON.stringify(draft),
  );
}

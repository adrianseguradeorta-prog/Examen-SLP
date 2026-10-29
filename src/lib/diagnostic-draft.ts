import { z } from "zod";
import {
  parseLocalWritingDraft,
  type LocalWritingDraft,
} from "./writing-draft";
import { diagnosticWriting } from "./diagnostic-content";

export type DiagnosticDraft = LocalWritingDraft & {
  submissionId: string;
  closed: boolean;
};
export function diagnosticDraftKey(owner: string) {
  return `slp:diagnostic:writing:v1:${encodeURIComponent(owner)}`;
}
export function parseDiagnosticDraft(
  raw: string | null,
  owner: string,
): DiagnosticDraft | null {
  const draft = parseLocalWritingDraft(raw, owner);
  if (
    !draft ||
    draft.task !== diagnosticWriting.version ||
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
): DiagnosticDraft {
  return {
    userKey: owner,
    id: uuid(),
    revision: 0,
    text: "",
    task: diagnosticWriting.version,
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
  store.setItem(diagnosticDraftKey(draft.userKey), JSON.stringify(draft));
}

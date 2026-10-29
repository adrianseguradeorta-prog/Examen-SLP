export const ACTIVE_WRITING_USER_KEY = "slp:writing:active-user";
export const GUEST_WRITING_USER = "guest";
export const WRITING_TASK = "Remote work and public institutions";

const DRAFT_PREFIX = "slp:writing:draft:v1:";

export type LocalWritingDraft = {
  userKey: string;
  id: string;
  revision: number;
  text: string;
  task: string;
  dirty: boolean;
  lastSyncedText: string;
  updatedAt: string;
};

export type RemoteWritingDraft = {
  id: string;
  revision: number;
  text: string;
  task: string;
  updated_at?: string;
};

export function writingDraftStorageKey(userKey: string) {
  return `${DRAFT_PREFIX}${encodeURIComponent(userKey)}`;
}

export function parseLocalWritingDraft(
  raw: string | null,
  expectedUserKey: string,
): LocalWritingDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<LocalWritingDraft>;
    if (
      value.userKey !== expectedUserKey ||
      typeof value.id !== "string" ||
      !Number.isInteger(value.revision) ||
      (value.revision ?? -1) < 0 ||
      typeof value.text !== "string" ||
      typeof value.task !== "string" ||
      typeof value.dirty !== "boolean" ||
      typeof value.lastSyncedText !== "string" ||
      typeof value.updatedAt !== "string"
    )
      return null;
    return value as LocalWritingDraft;
  } catch {
    return null;
  }
}

function localFromRemote(
  remote: RemoteWritingDraft,
  userKey: string,
): LocalWritingDraft | null {
  if (
    typeof remote?.id !== "string" ||
    !Number.isInteger(remote?.revision) ||
    remote.revision < 0 ||
    typeof remote?.text !== "string" ||
    typeof remote?.task !== "string"
  )
    return null;
  return {
    userKey,
    id: remote.id,
    revision: remote.revision,
    text: remote.text,
    task: remote.task,
    dirty: false,
    lastSyncedText: remote.text,
    updatedAt: remote.updated_at ?? new Date().toISOString(),
  };
}

export function chooseWritingDraft(
  local: LocalWritingDraft | null,
  remote: RemoteWritingDraft | null,
  userKey: string,
): LocalWritingDraft | null {
  if (local?.dirty) return local;
  const server = remote ? localFromRemote(remote, userKey) : null;
  if (!server) return local;
  if (!local) return server;
  if (local.id === server.id && local.revision > server.revision) return local;
  return server;
}

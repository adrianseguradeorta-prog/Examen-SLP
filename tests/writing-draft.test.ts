import { describe, expect, it } from "vitest";
import {
  chooseWritingDraft,
  parseLocalWritingDraft,
  writingDraftStorageKey,
  type LocalWritingDraft,
  type RemoteWritingDraft,
} from "../src/lib/writing-draft";

const local = (overrides: Partial<LocalWritingDraft> = {}): LocalWritingDraft => ({
  userKey: "user-a",
  id: "11111111-1111-4111-8111-111111111111",
  revision: 2,
  text: "Local text",
  task: "Task",
  dirty: true,
  lastSyncedText: "Earlier text",
  updatedAt: "2026-10-29T07:00:00.000Z",
  ...overrides,
});

const remote: RemoteWritingDraft = {
  id: "11111111-1111-4111-8111-111111111111",
  revision: 3,
  text: "Server text",
  task: "Task",
  updated_at: "2026-10-29T07:05:00.000Z",
};

describe("writing draft recovery", () => {
  it("isolates storage keys by user", () => {
    expect(writingDraftStorageKey("user-a")).not.toBe(
      writingDraftStorageKey("user-b"),
    );
  });

  it("never replaces an unsynced local draft with a remote version", () => {
    expect(chooseWritingDraft(local(), remote, "user-a")?.text).toBe(
      "Local text",
    );
  });

  it("uses the newer server copy when the local draft is already synced", () => {
    const selected = chooseWritingDraft(
      local({ dirty: false, text: "Earlier text" }),
      remote,
      "user-a",
    );
    expect(selected?.text).toBe("Server text");
    expect(selected?.dirty).toBe(false);
    expect(selected?.lastSyncedText).toBe("Server text");
  });

  it("restores the local copy when the server has no draft", () => {
    expect(chooseWritingDraft(local(), null, "user-a")?.text).toBe(
      "Local text",
    );
  });

  it("rejects malformed or cross-user stored data", () => {
    expect(parseLocalWritingDraft("not-json", "user-a")).toBeNull();
    expect(parseLocalWritingDraft(JSON.stringify(local()), "user-b")).toBeNull();
  });
});

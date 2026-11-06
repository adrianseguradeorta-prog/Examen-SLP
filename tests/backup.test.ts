import { it, expect } from "vitest";
import {
  exportBackup,
  restoreBackup,
  deleteLocal,
  parseBackup,
  recoverInterruptedReplace,
  MAINTENANCE_KEY,
} from "../src/lib/backup";
import { emptyCoach } from "../src/lib/coach-model";
import { coachKey } from "../src/lib/coach-store";
function store() {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => {
      m.set(k, v);
    },
    removeItem: (k: string) => {
      m.delete(k);
    },
  };
}
it("round trips complete local state without touching another identity or app", () => {
  const s = store();
  s.setItem(coachKey("guest"), JSON.stringify(emptyCoach("guest")));
  s.setItem(coachKey("other"), "private");
  s.setItem("unrelated", "keep");
  const b = exportBackup(s, "guest", "2026-10-30T00:00:00Z");
  deleteLocal(s, "guest", "all", true);
  expect(s.getItem(coachKey("guest"))).toBeNull();
  restoreBackup(s, "guest", JSON.stringify(b), true);
  expect(exportBackup(s, "guest", b.exportedAt)).toEqual(b);
  expect(s.getItem(coachKey("other"))).toBe("private");
  expect(s.getItem("unrelated")).toBe("keep");
});
it("validates before modification and requires confirmation", () => {
  const s = store();
  const b = exportBackup(s, "guest", "2026-10-30T00:00:00Z");
  expect(() => restoreBackup(s, "guest", JSON.stringify(b), false)).toThrow();
  for (const patch of [
    { version: 2 },
    { owner: "other" },
    { unexpected: "secret" },
    { entries: [{ key: "unrelated", value: {} }] },
  ])
    expect(() =>
      parseBackup(JSON.stringify({ ...b, ...patch }), "guest"),
    ).toThrow();
  expect(s.length).toBe(0);
});
it("rejects dangerous keys, malformed JSON and excessive size", () => {
  for (const raw of ["{", '{"__proto__":{}}', " ".repeat(5 * 1024 * 1024 + 1)])
    expect(() => parseBackup(raw, "guest")).toThrow();
});
it("recovers an interrupted replacement before allowing edits", () => {
  const s = store(),
    key = coachKey("guest"),
    value = JSON.stringify(emptyCoach("guest"));
  s.setItem(
    MAINTENANCE_KEY,
    JSON.stringify({ version: 1, owner: "guest", previous: [{ key, value }] }),
  );
  s.setItem(key, "partial write");
  expect(recoverInterruptedReplace(s, "guest")).toBe(true);
  expect(s.getItem(key)).toBe(value);
  expect(s.getItem(MAINTENANCE_KEY)).toBeNull();
});

import { defaultProfile } from "../src/lib/coach-model";
import {
  practicePrefix,
  createLocalPracticeRequest,
} from "../src/lib/local-practice";
import { createTaskDraft, taskDraftKey } from "../src/lib/task-draft";
import {
  newDiagnosticDraft,
  diagnosticDraftKey,
} from "../src/lib/diagnostic-draft";
import { writingDraftStorageKey, WRITING_TASK } from "../src/lib/writing-draft";
const date = "2026-10-30T12:00:00Z";
function fullStore() {
  const s = store(),
    c = emptyCoach("guest"),
    id = crypto.randomUUID();
  c.profiles = [{ id, createdAt: date, value: defaultProfile }];
  c.vocabulary = [
    {
      id: crypto.randomUUID(),
      expression: "provided that",
      note: "siempre que",
      example: "This will work provided that we agree.",
      topic: "reasoning",
      createdOn: "2026-10-30",
      patternId: null,
      validatedByUser: false,
      reviews: [],
    },
  ];
  s.setItem(coachKey("guest"), JSON.stringify(c));
  const rows = [
    {
      kind: "activity",
      data: {
        id: crypto.randomUUID(),
        skill: "reading",
        minutes: 15,
        studied_on: "2026-10-30",
        note: "my reading",
      },
    },
    {
      kind: "exposure",
      data: {
        id: crypto.randomUUID(),
        skill: "reading",
        version: "sensors-v1",
        stage: "solutions",
      },
    },
    {
      kind: "plan",
      data: {
        id: crypto.randomUUID(),
        start_date: "2026-10-30",
        exam_date: null,
        weekly_minutes: 390,
      },
    },
    {
      kind: "observation",
      data: {
        id: crypto.randomUUID(),
        pattern_id: crypto.randomUUID(),
        pattern: "past tense",
        category: "grammar",
        skill: "speaking",
        session_ref: "session one",
        occurred_on: "2026-10-30",
        outcome: "error",
        example: "Yesterday I go.",
        assisted: false,
      },
    },
  ];
  for (const r of rows)
    s.setItem(
      `${practicePrefix()}${r.kind}:${r.data.id}`,
      JSON.stringify({ version: 1, created_at: date, record: r }),
    );
  const task = {
    ...createTaskDraft("guest", "reading", "sensors-v1"),
    answers: { 0: 1 },
  };
  s.setItem(
    taskDraftKey("guest", "reading", "sensors-v1"),
    JSON.stringify(task),
  );
  s.setItem(
    diagnosticDraftKey("guest"),
    JSON.stringify({
      ...newDiagnosticDraft(
        "guest",
        () => crypto.randomUUID(),
        () => date,
      ),
      text: "My unfinished diagnostic writing",
    }),
  );
  s.setItem(
    writingDraftStorageKey("guest"),
    JSON.stringify({
      userKey: "guest",
      id: crypto.randomUUID(),
      revision: 0,
      text: "My writing",
      task: WRITING_TASK,
      dirty: true,
      lastSyncedText: "",
      updatedAt: date,
    }),
  );
  return s;
}
it("round trips profiles, training, exposures, vocabulary and all draft formats", () => {
  const s = fullStore(),
    b = exportBackup(s, "guest", date);
  deleteLocal(s, "guest", "all", true);
  restoreBackup(s, "guest", JSON.stringify(b), true);
  expect(exportBackup(s, "guest", date)).toEqual(b);
});
it.each(["progress", "drafts", "errors", "srs", "profile"] as const)(
  "deletes only the chosen %s scope, retaining other identities",
  (scope) => {
    const s = fullStore();
    s.setItem("another-app", "safe");
    s.setItem(coachKey("bob"), "private");
    deleteLocal(s, "guest", scope, true);
    const b = exportBackup(s, "guest", date),
      coach = JSON.parse(s.getItem(coachKey("guest"))!);
    expect(s.getItem("another-app")).toBe("safe");
    expect(s.getItem(coachKey("bob"))).toBe("private");
    expect(b.entries.some((e) => e.key.includes(":exposure:"))).toBe(true);
    expect(coach.profiles.length).toBe(scope === "profile" ? 0 : 1);
    expect(coach.vocabulary.length).toBe(scope === "srs" ? 0 : 1);
    expect(!!s.getItem(writingDraftStorageKey("guest"))).toBe(
      scope !== "drafts",
    );
    expect(b.entries.some((e) => e.key.includes(":observation:"))).toBe(
      scope !== "errors",
    );
    expect(b.entries.some((e) => e.key.includes(":activity:"))).toBe(
      scope !== "progress",
    );
  },
);
it("rejects unknown nested data, audio, duplicated entries and forged identities before restore", () => {
  const s = fullStore(),
    b = exportBackup(s, "guest", date),
    before = JSON.stringify(b);
  for (const change of [
    (b: ReturnType<typeof exportBackup>) => {
      b.entries.push(b.entries[0]);
    },
    (b: ReturnType<typeof exportBackup>) => {
      (b.entries[0].value as Record<string, unknown>).token = "no";
    },
    (b: ReturnType<typeof exportBackup>) => {
      const e = b.entries.find((e) => e.key.includes("task-draft"))!;
      (e.value as Record<string, unknown>).audio = "blob:fake";
    },
    (b: ReturnType<typeof exportBackup>) => {
      b.owner = "bob";
    },
  ]) {
    const bad = JSON.parse(before);
    change(bad);
    expect(() =>
      restoreBackup(s, "guest", JSON.stringify(bad), true),
    ).toThrow();
    expect(JSON.stringify(exportBackup(s, "guest", date))).toBe(before);
  }
});
it("refuses quota failure before touching data and rolls back a failure after staging", () => {
  const s = fullStore(),
    b = exportBackup(s, "guest", date),
    target = JSON.stringify({ ...b, entries: [] });
  const original = s.setItem;
  let failure = "journal";
  s.setItem = (k, v) => {
    if (failure === "journal" && k === MAINTENANCE_KEY) throw Error("quota");
    original(k, v);
  };
  expect(() => restoreBackup(s, "guest", target, true)).toThrow();
  expect(exportBackup(s, "guest", date)).toEqual(b);
  failure = "target";
  let once = true;
  s.setItem = (k, v) => {
    if (k !== MAINTENANCE_KEY && once) {
      once = false;
      throw Error("quota");
    }
    original(k, v);
  };
  expect(() => restoreBackup(s, "guest", JSON.stringify(b), true)).toThrow(
    /recuperaron/,
  );
  expect(exportBackup(s, "guest", date)).toEqual(b);
});
it("keeps readable history with a corrupt coach, marks evidence incomplete and uses no services", async () => {
  const s = fullStore();
  s.setItem(coachKey("guest"), "broken");
  const response = await createLocalPracticeRequest(
    s,
    async () => {
      throw Error("must not fetch");
    },
    () => new Date(date),
  )("/api/training");
  expect(response.ok).toBe(true);
  const data = await response.json();
  expect(data.activities).toHaveLength(1);
  expect(data.warnings).toContain("invalid_local_profile");
});

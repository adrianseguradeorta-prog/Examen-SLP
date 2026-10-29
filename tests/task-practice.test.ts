import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  createTaskDraft,
  parseTaskDraft,
  saveTaskDraft,
  clearTaskDraft,
  taskDraftKey,
} from "../src/lib/task-draft";
import {
  newDiagnosticDraft,
  saveDiagnosticDraft,
  parseDiagnosticDraft,
  diagnosticDraftKey,
} from "../src/lib/diagnostic-draft";
import { createLocalPracticeRequest } from "../src/lib/local-practice";
import { POST } from "../src/app/api/practice/diagnostic/route";
import {
  catalogs,
  nextTask,
  independentSamples,
  taskState,
} from "../src/lib/task-rotation";
import {
  readingTasks,
  listeningTasks,
  writingTasks,
} from "../src/lib/task-catalog";
import { speakingTasks, oralFunctions } from "../src/lib/speaking-content";
import { additionalGrading } from "../src/lib/additional-grading";
import { diagnosticReport } from "../src/lib/diagnostic-grading";
import { diagnosticSummary } from "../src/lib/diagnostic-summary";
import { nextPractice } from "../src/lib/daily-practice";
import type { TrainingData } from "../src/components/use-training";
import type { Submission } from "../src/lib/training";
class MemoryStore {
  values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  key(i: number) {
    return [...this.values.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.values.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.values.set(k, v);
  }
  removeItem(k: string) {
    this.values.delete(k);
  }
}
const fetcher = (async (path, init) => {
  expect(path).toBe("/api/practice/diagnostic");
  return POST(new Request("http://localhost" + path, init));
}) as typeof fetch;
const send = (action: string, data: unknown) => ({
  method: "POST",
  body: JSON.stringify({ action, data }),
});
const empty = (): TrainingData => ({
  plans: [],
  activities: [],
  submissions: [],
  exposures: [],
});
const date = "2026-10-29T12:00:00Z";
const sample = (version = "sensors-v1"): Submission => ({
  id: crypto.randomUUID(),
  kind: "reading",
  version: version as "sensors-v1",
  answers: [0, 1, 2, 1],
  priorExposure: "none",
});
it.each(["reading", "listening"] as const)(
  "restores unfinished %s answers in a new storage consumer, isolated by owner/version",
  (kind) => {
    const store = new MemoryStore(),
      version = catalogs[kind][0].version;
    const draft = {
      ...createTaskDraft("alice", kind, version),
      answers: { 0: 2, 2: 1 },
    };
    saveTaskDraft(store, draft);
    const raw = store.getItem(taskDraftKey("alice", kind, version));
    expect(parseTaskDraft(raw, "alice", kind, version)?.answers).toEqual({
      0: 2,
      2: 1,
    });
    expect(parseTaskDraft(raw, "bob", kind, version)).toBeNull();
    expect(
      parseTaskDraft(raw, "alice", kind, catalogs[kind][1].version),
    ).toBeNull();
    expect(store.getItem(taskDraftKey("guest", kind, version))).toBeNull();
  },
);
it("keeps oral notes and assistance but refuses any audio, duration, URL or unknown metadata in a draft", () => {
  const d = {
    ...createTaskDraft("guest", "speaking", "community-decision-v1"),
    notes: "Need a clearer reason.",
    assisted: true,
  };
  expect(
    parseTaskDraft(JSON.stringify(d), "guest", d.kind, d.version)?.notes,
  ).toBe(d.notes);
  for (const field of ["audio", "url", "durationSeconds", "blob", "transcript"])
    expect(
      parseTaskDraft(
        JSON.stringify({ ...d, [field]: "not allowed" }),
        "guest",
        d.kind,
        d.version,
      ),
    ).toBeNull();
});
it("rejects malformed answers and preserves a durable copy after quota failure", () => {
  const store = new MemoryStore(),
    d = {
      ...createTaskDraft("guest", "reading", "sensors-v1"),
      answers: { 0: 1 },
    };
  saveTaskDraft(store, d);
  store.setItem = () => {
    throw Error("quota");
  };
  expect(() => saveTaskDraft(store, { ...d, answers: { 0: 2 } })).toThrow();
  expect(
    parseTaskDraft(
      store.getItem(taskDraftKey("guest", d.kind, d.version)),
      "guest",
      d.kind,
      d.version,
    )?.answers,
  ).toEqual({ 0: 1 });
  for (const answers of [{ "01": 1 }, { 4: 1 }, { 0: 4 }])
    expect(
      parseTaskDraft(
        JSON.stringify({ ...d, answers }),
        "guest",
        d.kind,
        d.version,
      ),
    ).toBeNull();
});
it("clears only the confirmed pending copy, not another task or a newer edit", () => {
  const store = new MemoryStore(),
    a = createTaskDraft("alice", "reading", "sensors-v1"),
    b = createTaskDraft("bob", "reading", "sensors-v1");
  saveTaskDraft(store, a);
  saveTaskDraft(store, b);
  clearTaskDraft(store, a);
  expect(store.getItem(taskDraftKey("alice", a.kind, a.version))).toBeNull();
  expect(store.getItem(taskDraftKey("bob", b.kind, b.version))).not.toBeNull();
  saveTaskDraft(store, {
    ...a,
    answers: { 1: 2 },
    updatedAt: "2026-10-29T13:00:00Z",
  });
  expect(() => clearTaskDraft(store, a)).toThrow();
  expect(
    store.getItem(taskDraftKey("alice", a.kind, a.version)),
  ).not.toBeNull();
});
it("retains the original Writing recovery key and separates added task drafts", () => {
  const store = new MemoryStore();
  const d = newDiagnosticDraft(
    "alice",
    () => crypto.randomUUID(),
    () => date,
  );
  saveDiagnosticDraft(store, { ...d, text: "The original diagnostic draft." });
  const other = newDiagnosticDraft(
    "alice",
    () => crypto.randomUUID(),
    () => date,
    "learning-budget-v1",
  );
  saveDiagnosticDraft(store, {
    ...other,
    text: "A different proposal for training.",
  });
  expect(diagnosticDraftKey("alice")).toBe("slp:diagnostic:writing:v1:alice");
  expect(
    parseDiagnosticDraft(store.getItem(diagnosticDraftKey("alice")), "alice")
      ?.text,
  ).toContain("original");
  expect(
    parseDiagnosticDraft(
      store.getItem(diagnosticDraftKey("alice", other.task)),
      "alice",
      other.task,
    )?.text,
  ).toContain("different");
});
it("ships three distinct versioned comprehension tasks per skill, three Writing tasks and existing oral functions", () => {
  expect(readingTasks).toHaveLength(3);
  expect(listeningTasks).toHaveLength(3);
  expect(writingTasks).toHaveLength(3);
  expect(new Set(readingTasks.map((t) => t.text)).size).toBe(3);
  expect(new Set(listeningTasks.map((t) => t.audio)).size).toBe(3);
  expect(speakingTasks.flatMap((t) => t.steps).length).toBeGreaterThanOrEqual(
    6,
  );
  expect(oralFunctions).toHaveLength(4);
  for (const task of listeningTasks) {
    expect(
      readFileSync("public" + task.audio)
        .subarray(0, 3)
        .toString(),
    ).toBe("ID3");
    const extra = additionalGrading[task.version];
    if (extra)
      expect(
        readFileSync("docs/content/" + task.version + ".txt", "utf8").trim(),
      ).toBe(extra.transcript);
  }
});
it("corrects additional Reading/Listening only against their own versions and never assigns a level", () => {
  for (const [version, g] of Object.entries(additionalGrading)) {
    const kind = readingTasks.some((t) => t.version === version)
      ? "reading"
      : "listening";
    const s = {
      id: crypto.randomUUID(),
      kind,
      version,
      answers: g.keys,
      priorExposure: "none",
      ...(kind === "listening"
        ? {
            mode: "practice",
            playCount: 1,
            completedListens: 1,
            transcriptViewed: false,
            solutionsKnown: false,
          }
        : {}),
    } as Submission;
    const report = diagnosticReport(s);
    expect(report.correct).toBe(g.keys.length);
    expect(report.estimatedLevel).toBeNull();
    expect(
      report.items?.every((i) => i.correct && i.type && i.explanation),
    ).toBe(true);
  }
});
it("rotates unseen material, resumes unfinished opened tasks and labels completed material as practice", () => {
  const d = empty();
  expect(nextTask(d, "reading").version).toBe("sensors-v1");
  d.submissions = [
    {
      id: "a",
      created_at: date,
      payload: sample(),
      report: diagnosticReport(sample()),
    },
  ];
  expect(nextTask(d, "reading").version).toBe("training-time-v1");
  d.exposures = [
    {
      id: crypto.randomUUID(),
      skill: "reading",
      version: "repair-cafe-v1",
      stage: "opened",
    },
  ];
  expect(nextTask(d, "reading").version).toBe("repair-cafe-v1");
  expect(taskState(d, "reading", "sensors-v1")).toBe(
    "Repetición para práctica",
  );
  expect(taskState(d, "reading", "repair-cafe-v1")).toBe(
    "Abierta · sin entrega",
  );
});
it("keeps exposure after deletion and a repeat cannot increase independent evidence, even after reload", async () => {
  const store = new MemoryStore();
  const api = createLocalPracticeRequest(
    store,
    fetcher,
    () => new Date(date),
    "alice",
  );
  const first = sample();
  expect((await api("/api/training", send("submission", first))).ok).toBe(true);
  let d = (await (await api("/api/training")).json()) as TrainingData;
  expect(independentSamples(d, "reading")).toHaveLength(1);
  const repeat = sample();
  expect((await api("/api/training", send("submission", repeat))).ok).toBe(
    true,
  );
  d = await (await api("/api/training")).json();
  expect(independentSamples(d, "reading")).toHaveLength(1);
  // Retry is idempotent even though solutions are now known.
  expect((await api("/api/training", send("submission", first))).ok).toBe(true);
  expect((await (await api("/api/training")).json()).submissions).toHaveLength(
    2,
  );
  for (const s of [first, repeat])
    await api("/api/training", {
      method: "DELETE",
      body: JSON.stringify({ kind: "submission", id: s.id }),
    });
  const reopened = createLocalPracticeRequest(
    store,
    fetcher,
    () => new Date(date),
    "alice",
  );
  expect(
    (await reopened("/api/training", send("submission", sample()))).ok,
  ).toBe(true);
  d = await (await reopened("/api/training")).json();
  expect(independentSamples(d, "reading")).toHaveLength(0);
  expect(d.submissions[0].payload).toHaveProperty("priorExposure", "solutions");
  expect(diagnosticSummary(d).every((s) => s.estimatedLevel === null)).toBe(
    true,
  );
  const bob = createLocalPracticeRequest(
    store,
    fetcher,
    () => new Date(date),
    "bob",
  );
  expect((await (await bob("/api/training")).json()).exposures).toEqual([]);
});
it("does not count unknown legacy evidence, duplicate material or incomplete history as independent", () => {
  const s = sample();
  if (s.kind === "reading") delete s.priorExposure;
  const d = empty();
  d.submissions = [
    { id: s.id, created_at: date, payload: s, report: diagnosticReport(s) },
  ];
  expect(independentSamples(d, "reading")).toHaveLength(0);
  const first = sample();
  d.submissions.unshift({
    id: first.id,
    created_at: "2026-10-28T12:00:00Z",
    payload: first,
    report: diagnosticReport(first),
  });
  expect(independentSamples(d, "reading")).toHaveLength(1);
  expect(
    independentSamples({ ...d, warnings: ["partial"] }, "reading"),
  ).toHaveLength(0);
});
it("uses a new task in daily practice after completed samples and preserves conservative fallback", () => {
  const d = empty();
  const samples: Submission[] = [
    sample(),
    {
      id: crypto.randomUUID(),
      kind: "writing",
      version: "public-services-v1",
      text: "A sufficiently long recommendation for practice.",
    },
    {
      id: crypto.randomUUID(),
      kind: "listening",
      version: "library-evenings-v1",
      answers: [0, 1, 2, 1, 2],
      mode: "practice",
      playCount: 1,
      completedListens: 1,
      transcriptViewed: false,
      solutionsKnown: false,
    },
    {
      id: crypto.randomUUID(),
      kind: "speaking",
      version: "community-decision-v1",
      completed: true,
      durationSeconds: null,
      durationReliable: false,
      interrupted: false,
      assisted: false,
      notes: "",
      audioRetained: false,
    },
  ];
  d.submissions = samples.map((payload) => ({
    id: payload.id,
    payload,
    created_at: date,
    report: diagnosticReport(payload),
  }));
  expect(nextPractice(d, null, "2026-10-29").href).toContain(
    "speaking=technology-decisions-v1",
  );
  d.activities = [
    {
      id: crypto.randomUUID(),
      skill: "speaking",
      minutes: 180,
      studied_on: "2026-10-29",
      note: "Completed practice",
    },
  ];
  expect(nextPractice(d, null, "2026-10-29").href).toContain(
    "writing=learning-budget-v1",
  );
  expect(
    nextPractice({ ...d, warnings: ["invalid"] }, null, "2026-10-29").reason,
  ).toContain("Sin historial suficiente");
});
it("deduplicates opened exposure, and a failed delivery leaves the pending draft intact", async () => {
  const store = new MemoryStore(),
    draft = {
      ...createTaskDraft("guest", "reading", "sensors-v1"),
      answers: { 0: 0 },
    };
  saveTaskDraft(store, draft);
  const api = createLocalPracticeRequest(
    store,
    (async () => new Response("{}", { status: 503 })) as typeof fetch,
  );
  const e = {
    id: crypto.randomUUID(),
    skill: "reading",
    version: "sensors-v1",
    stage: "opened",
  };
  await api("/api/training", send("exposure", e));
  await api(
    "/api/training",
    send("exposure", { ...e, id: crypto.randomUUID() }),
  );
  expect((await (await api("/api/training")).json()).exposures).toHaveLength(1);
  expect((await api("/api/training", send("submission", sample()))).ok).toBe(
    false,
  );
  expect(
    store.getItem(taskDraftKey("guest", "reading", "sensors-v1")),
  ).not.toBeNull();
  expect((await (await api("/api/training")).json()).submissions).toEqual([]);
});

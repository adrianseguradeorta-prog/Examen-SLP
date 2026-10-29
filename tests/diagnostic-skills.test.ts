import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { submissionInput, type Submission } from "../src/lib/training";
import { diagnosticReport } from "../src/lib/diagnostic-grading";
import { diagnosticSummary } from "../src/lib/diagnostic-summary";
import { nextPractice } from "../src/lib/daily-practice";
import { listeningTranscript } from "../src/lib/listening-grading";
import {
  diagnosticDraftKey,
  newDiagnosticDraft,
  parseDiagnosticDraft,
  saveDiagnosticDraft,
} from "../src/lib/diagnostic-draft";
import { createLocalPracticeRequest } from "../src/lib/local-practice";
import { POST } from "../src/app/api/practice/diagnostic/route";
import type { TrainingData } from "../src/components/use-training";

const id = (n: number) =>
  `aaaaaaaa-aaaa-4aaa-aaaa-${String(n).padStart(12, "0")}`;
const date = "2026-10-29T12:00:00Z";
const listening: Submission = {
  id: id(1),
  kind: "listening",
  version: "library-evenings-v1",
  answers: [0, 1, 0, 0, 2],
  mode: "practice",
  playCount: 2,
  completedListens: 1,
  transcriptViewed: false,
  solutionsKnown: false,
};
const speaking: Submission = {
  id: id(2),
  kind: "speaking",
  version: "community-decision-v1",
  completed: true,
  durationSeconds: null,
  durationReliable: false,
  interrupted: false,
  assisted: false,
  notes: "I found the objection difficult.",
  audioRetained: false,
};
const reading: Submission = {
  id: id(3),
  kind: "reading",
  version: "sensors-v1",
  answers: [0, 1, 2, 1],
};
const writing: Submission = {
  id: id(4),
  kind: "writing",
  version: "public-services-v1",
  text: "A sufficiently long written response, pending human review.",
};
const data = (samples: Submission[]): TrainingData => ({
  plans: [],
  activities: [],
  submissions: samples.map((payload) => ({
    id: payload.id,
    created_at: date,
    payload,
    report: diagnosticReport(payload),
  })),
});
class MemoryStore {
  values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  key(i: number) {
    return [...this.values.keys()][i] ?? null;
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}
const localFetch = (async (path, init) => {
  expect(path).toBe("/api/practice/diagnostic");
  return POST(new Request(`http://localhost${path}`, init));
}) as typeof fetch;
const send = (body: unknown) => ({
  method: "POST",
  body: JSON.stringify(body),
});

it("grades only the defined Listening questions and returns their functions and explanation", () => {
  const r = diagnosticReport(listening);
  expect(r.correct).toBe(3);
  expect(r.total).toBe(5);
  expect(
    r.items?.filter((i) => i.type === "inference" && !i.correct),
  ).toHaveLength(2);
  expect(r.transcript).toContain("six weeks");
  expect(r.estimatedLevel).toBeNull();
});
it("ships a nonempty original MP3 and keeps the regeneration script text equal to the transcript", () => {
  const audio = readFileSync("public/audio/library-evenings-v1.mp3");
  expect(audio.subarray(0, 3).toString()).toBe("ID3");
  expect(audio.length).toBeGreaterThan(100000);
  expect(
    readFileSync("docs/content/library-evenings-v1.txt", "utf8").trim(),
  ).toBe(listeningTranscript);
});
it("distinguishes no sample, partial evidence, pending review and insufficient oral evidence", () => {
  expect(
    diagnosticSummary(data([])).every((s) => s.status === "Sin muestra"),
  ).toBe(true);
  const summary = diagnosticSummary(
    data([reading, writing, listening, speaking]),
  );
  expect(summary.map((s) => s.status)).toEqual([
    "Evidencia parcial",
    "Pendiente de revisión",
    "Evidencia parcial",
    "Realización registrada · evidencia insuficiente",
  ]);
  expect(summary.every((s) => s.estimatedLevel === null)).toBe(true);
  expect(summary.find((s) => s.skill === "listening")?.gaps).toEqual([
    { type: "inference", missed: 2, total: 2 },
  ]);
});
it("abstains for missing, truncated or invalid evidence, even with perfect repeated answers", () => {
  expect(
    diagnosticSummary(null).every((s) => s.status === "Evidencia insuficiente"),
  ).toBe(true);
  const d = data([
    reading,
    { ...reading, id: id(8) },
    writing,
    listening,
    speaking,
  ]);
  expect(diagnosticSummary(d).every((s) => s.estimatedLevel === null)).toBe(
    true,
  );
  expect(
    diagnosticSummary({ ...d, warnings: ["invalid"] }).every(
      (s) => s.gaps.length === 0,
    ),
  ).toBe(true);
  const partial = data([reading]);
  partial.submissions[0].report.items = undefined;
  expect(diagnosticSummary(partial)[0].status).toBe("Evidencia insuficiente");
  expect(diagnosticSummary(partial)[0].taskResult).toBeNull();
});
it("recommends missing samples before tailoring practice and quotes only supported error counts", () => {
  expect(nextPractice(data([reading]), null, date.slice(0, 10)).href).toBe(
    "/diagnostic#writing",
  );
  expect(
    nextPractice(data([reading, writing]), null, date.slice(0, 10)).href,
  ).toBe("/listening");
  expect(
    nextPractice(data([reading, writing, listening]), null, date.slice(0, 10))
      .href,
  ).toBe("/diagnostic#speaking");
  expect(
    nextPractice(
      data([reading, writing, listening, speaking]),
      null,
      date.slice(0, 10),
    ).reason,
  ).toContain("2 de 2 preguntas falladas de inference");
});
it("rejects unknown audio fields, injected levels, exam claims and unreliable durations", () => {
  for (const s of [
    { ...speaking, audio: "base64" },
    { ...speaking, audioRetained: true },
    { ...speaking, durationSeconds: 42 },
    {
      ...speaking,
      durationSeconds: 42,
      durationReliable: true,
      interrupted: true,
    },
    { ...listening, mode: "exam" },
    { ...listening, playCount: 0 },
    { ...listening, level: "3" },
  ])
    expect(submissionInput.safeParse(s).success).toBe(false);
  expect(
    submissionInput.safeParse({
      ...speaking,
      durationSeconds: 42,
      durationReliable: true,
    }).success,
  ).toBe(true);
});
it("restores the diagnostic Writing draft after reload without mixing owners or the Writing Lab key", () => {
  const store = new MemoryStore();
  let n = 10;
  const draft = {
    ...newDiagnosticDraft(
      "alice",
      () => id(n++),
      () => date,
    ),
    text: writing.kind === "writing" ? writing.text : "",
    dirty: true,
  };
  saveDiagnosticDraft(store, draft);
  const restored = parseDiagnosticDraft(
    store.getItem(diagnosticDraftKey("alice")),
    "alice",
  );
  expect(restored?.text).toBe(draft.text);
  expect(restored?.closed).toBe(false);
  expect(
    parseDiagnosticDraft(store.getItem(diagnosticDraftKey("alice")), "bob"),
  ).toBeNull();
  expect(store.getItem(diagnosticDraftKey("guest"))).toBeNull();
  expect(store.key(0)).not.toContain("slp:writing:draft");
  saveDiagnosticDraft(store, { ...draft, closed: true, dirty: false });
  expect(
    parseDiagnosticDraft(store.getItem(diagnosticDraftKey("alice")), "alice")
      ?.closed,
  ).toBe(true);
});
it("does not interpret corrupt drafts or erase a durable draft on quota failure", () => {
  const store = new MemoryStore();
  const draft = newDiagnosticDraft(
    "guest",
    () => id(9),
    () => date,
  );
  saveDiagnosticDraft(store, { ...draft, text: "saved text" });
  store.setItem = () => {
    throw Error("quota");
  };
  expect(() =>
    saveDiagnosticDraft(store, { ...draft, text: "unsaved" }),
  ).toThrow();
  expect(
    parseDiagnosticDraft(store.getItem(diagnosticDraftKey("guest")), "guest")
      ?.text,
  ).toBe("saved text");
  expect(parseDiagnosticDraft("invalid", "guest")).toBeNull();
});
it("persists four closed samples separately by identity and rejects changing an existing submission", async () => {
  const store = new MemoryStore();
  const a = createLocalPracticeRequest(
    store,
    localFetch,
    () => new Date(date),
    "alice",
  );
  const b = createLocalPracticeRequest(
    store,
    localFetch,
    () => new Date(date),
    "bob",
  );
  for (const s of [reading, writing, listening, speaking])
    expect(
      (await a("/api/training", send({ action: "submission", data: s }))).ok,
    ).toBe(true);
  expect((await (await b("/api/training")).json()).submissions).toEqual([]);
  const reopened = createLocalPracticeRequest(
    store,
    localFetch,
    () => new Date(date),
    "alice",
  );
  const history = await (await reopened("/api/training")).json();
  expect(history.submissions).toHaveLength(4);
  expect(
    history.submissions.find(
      (s: { payload: Submission }) => s.payload.kind === "listening",
    ).report.items[2].type,
  ).toBe("inference");
  expect(
    (
      await reopened(
        "/api/training",
        send({
          action: "submission",
          data: {
            ...writing,
            text: "Different response with more than thirty characters.",
          },
        }),
      )
    ).ok,
  ).toBe(false);
  expect((await (await reopened("/api/training")).json()).activities).toEqual(
    [],
  );
  expect(
    (
      await a(
        "/api/training",
        send({
          action: "activity",
          data: {
            id: id(20),
            skill: "listening",
            minutes: 10,
            studied_on: date.slice(0, 10),
            note: "Reviewed the two inferences",
          },
        }),
      )
    ).ok,
  ).toBe(true);
  expect(
    (await (await reopened("/api/training")).json()).activities,
  ).toHaveLength(1);
});

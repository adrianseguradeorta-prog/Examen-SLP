import { z } from "zod";
import { activityInput, planInput, submissionInput } from "./training";
import { observationInput, errorProgress, recommendPractice } from "./errors";

export const PRACTICE_PREFIX = "slp:practice:v1:guest:";
export function practicePrefix(owner = "guest") {
  return `slp:practice:v1:${encodeURIComponent(owner)}:`;
}
export const PRACTICE_CHANGE = "slp-practice-change";
export const reportSchema = z.object({
  estimatedLevel: z.null(),
  status: z.string(),
  message: z.string(),
  correct: z.number().int().nonnegative().optional(),
  total: z.number().int().positive().optional(),
  transcript: z.string().optional(),
  items: z
    .array(
      z.object({
        correct: z.boolean(),
        explanation: z.string(),
        type: z.string().optional(),
      }),
    )
    .optional(),
});
const recordSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("plan"), data: planInput }),
  z.object({ kind: z.literal("activity"), data: activityInput }),
  z.object({
    kind: z.literal("submission"),
    data: submissionInput,
    report: reportSchema,
  }),
  z.object({ kind: z.literal("observation"), data: observationInput }),
]);
const storedSchema = z.object({
  version: z.literal(1),
  created_at: z.iso.datetime(),
  record: recordSchema,
});
type RecordData = z.infer<typeof recordSchema>;
type Store = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Explicit guest workspace only. Never used as a fallback for a cloud/auth error.
// One immutable record per key prevents unrelated tabs from replacing an entire history.
export function createLocalPracticeRequest(
  store: Store,
  fetcher: typeof fetch,
  now = () => new Date(),
  owner = "guest",
) {
  const prefix = practicePrefix(owner);
  function read() {
    const rows: z.infer<typeof storedSchema>[] = [];
    const warnings: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key?.startsWith(prefix)) continue;
      try {
        const row = storedSchema.parse(JSON.parse(store.getItem(key)!));
        if (key !== `${prefix}${row.record.kind}:${row.record.data.id}`)
          throw Error("key mismatch");
        rows.push(row);
      } catch {
        warnings.push("invalid_local_record");
      }
    }
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { rows, warnings };
  }
  function write(record: RecordData) {
    const key = `${prefix}${record.kind}:${record.data.id}`;
    const previous = store.getItem(key);
    if (previous) {
      const old = storedSchema.parse(JSON.parse(previous));
      if (JSON.stringify(old.record) !== JSON.stringify(record))
        throw Error(
          "Este identificador ya tiene otro contenido. Recarga antes de reintentar.",
        );
      return;
    }
    store.setItem(
      key,
      JSON.stringify({ version: 1, created_at: now().toISOString(), record }),
    );
  }
  return async (path: string, init?: RequestInit): Promise<Response> => {
    try {
      const method = init?.method ?? "GET";
      const { rows, warnings } = read();
      const observations = rows.flatMap(({ record }) =>
        record.kind === "observation" ? [record.data] : [],
      );
      const patterns = [
        ...new Map(
          observations.map((o) => [
            o.pattern_id,
            { id: o.pattern_id, pattern: o.pattern, category: o.category },
          ]),
        ).values(),
      ];
      const today = now().toISOString().slice(0, 10);
      if (method === "GET") {
        if (path === "/api/training")
          return json({
            plans: rows.flatMap(({ record }) =>
              record.kind === "plan" ? [record.data] : [],
            ),
            activities: rows.flatMap(({ record }) =>
              record.kind === "activity" ? [record.data] : [],
            ),
            submissions: rows.flatMap(({ record, created_at }) =>
              record.kind === "submission"
                ? [
                    {
                      id: record.data.id,
                      payload: record.data,
                      report: record.report,
                      created_at,
                    },
                  ]
                : [],
            ),
            warnings,
            local: true,
          });
        if (path === "/api/errors")
          return json({
            patterns: patterns.map((p) => ({
              ...p,
              progress: warnings.length
                ? null
                : errorProgress(
                    observations.filter((o) => o.pattern_id === p.id),
                    today,
                  ),
            })),
            observations,
            recommendations: warnings.length
              ? []
              : recommendPractice(patterns, observations, today),
            truncated: warnings.length > 0,
          });
      }
      const body = JSON.parse(String(init?.body ?? "null"));
      if (method === "POST" && path === "/api/training") {
        if (body?.action === "plan")
          write({ kind: "plan", data: planInput.parse(body.data) });
        else if (body?.action === "activity") {
          const data = activityInput.parse(body.data);
          if (data.studied_on > today)
            throw Error("No registres actividad futura.");
          write({ kind: "activity", data });
        } else if (body?.action === "submission") {
          const data = submissionInput.parse(body.data);
          // The local application server grades original Reading; no cloud/AI call.
          const r = await fetcher("/api/practice/diagnostic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: init?.signal,
          });
          if (!r.ok)
            throw Error(
              "No se pudo revisar la muestra. Mantén la aplicación local en marcha y reintenta.",
            );
          const report = reportSchema.parse(await r.json());
          write({ kind: "submission", data, report });
        } else throw Error("Acción desconocida.");
        return json({ ok: true, local: true });
      }
      if (method === "POST" && path === "/api/errors") {
        let data = observationInput.parse(body);
        if (data.occurred_on > today)
          throw Error("No registres observaciones futuras.");
        const existing = patterns.find(
          (p) =>
            p.category === data.category &&
            normalize(p.pattern) === normalize(data.pattern),
        );
        if (existing)
          data = {
            ...data,
            pattern_id: existing.id,
            pattern: existing.pattern,
          };
        const byId = patterns.find((p) => p.id === data.pattern_id);
        if (
          byId &&
          (byId.category !== data.category ||
            normalize(byId.pattern) !== normalize(data.pattern))
        )
          throw Error("El patrón ya tiene otro contenido.");
        if (
          data.outcome === "correct" &&
          !observations.some(
            (o) =>
              o.pattern_id === data.pattern_id &&
              o.outcome === "error" &&
              o.occurred_on <= data.occurred_on,
          )
        )
          throw Error("Registra primero un error para este patrón.");
        write({ kind: "observation", data });
        return json({ ok: true, pattern_id: data.pattern_id, local: true });
      }
      if (method === "DELETE") {
        const p = z
          .object({
            kind: z.enum([
              "plan",
              "activity",
              "submission",
              "pattern",
              "observation",
            ]),
            id: z.uuid(),
          })
          .strict()
          .parse(body);
        const allowed =
          path === "/api/training"
            ? ["plan", "activity", "submission"]
            : path === "/api/errors"
              ? ["pattern", "observation"]
              : [];
        if (!allowed.includes(p.kind)) throw Error("Solicitud inválida.");
        if (p.kind === "pattern")
          observations
            .filter((o) => o.pattern_id === p.id)
            .forEach((o) => store.removeItem(`${prefix}observation:${o.id}`));
        else store.removeItem(`${prefix}${p.kind}:${p.id}`);
        return json({ ok: true });
      }
      return json({ error: "Solicitud no disponible." }, 400);
    } catch (e) {
      const message =
        e instanceof z.ZodError
          ? "Revisa los campos o los datos locales: formato inválido."
          : e instanceof Error
            ? e.message
            : "Error local";
      return json(
        {
          error: `No se confirmó la operación local: ${message} Si el navegador bloquea el almacenamiento o está lleno, conserva una copia antes de salir.`,
        },
        400,
      );
    }
  };
}

export async function practiceRequest(
  local: boolean,
  path: string,
  init?: RequestInit,
  owner = "guest",
) {
  if (!local) return fetch(path, init);
  try {
    const r = await createLocalPracticeRequest(
      window.localStorage,
      window.fetch.bind(window),
      () => new Date(),
      owner,
    )(path, init);
    if (r.ok && init?.method && init.method !== "GET")
      window.dispatchEvent(new Event(PRACTICE_CHANGE));
    return r;
  } catch {
    return json(
      {
        error:
          "El navegador no permite acceder al almacenamiento local. No se ha guardado la operación.",
      },
      400,
    );
  }
}

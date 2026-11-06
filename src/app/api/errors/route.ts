import { NextResponse } from "next/server";
import { z } from "zod";
import { context } from "@/lib/api";
import {
  observationInput,
  errorProgress,
  recommendPractice,
  type Observation,
  type Pattern,
} from "@/lib/errors";
export async function GET() {
  const c = await context();
  if (c.error) return c.error;
  const [patterns, observations] = await Promise.all([
    c.db
      .from("error_patterns")
      .select("id,pattern,category", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(500),
    c.db
      .from("error_observations")
      .select(
        "id,pattern_id,skill,session_ref,occurred_on,outcome,example,assisted",
        { count: "exact" },
      )
      .order("occurred_on", { ascending: false })
      .limit(1000),
  ]);
  if (patterns.error || observations.error)
    return NextResponse.json(
      {
        error: "No se pudo cargar Error Bank. Comprueba la tercera migración.",
      },
      { status: 500 },
    );
  const ps = patterns.data as Pattern[];
  const events = (observations.data ?? [])
    .map((o) => {
      const p = ps.find((p) => p.id === o.pattern_id);
      return p ? { ...o, pattern: p.pattern, category: p.category } : null;
    })
    .filter(Boolean) as Observation[];
  const truncated =
    patterns.count === null ||
    observations.count === null ||
    patterns.count > ps.length ||
    observations.count > (observations.data?.length ?? 0);
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json(
    {
      patterns: ps.map((p) => ({
        ...p,
        progress: truncated
          ? null
          : errorProgress(
              events.filter((o) => o.pattern_id === p.id),
              today,
            ),
      })),
      observations: events,
      recommendations: truncated ? [] : recommendPractice(ps, events, today),
      truncated,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const c = await context(request);
  if (c.error) return c.error;
  const p = observationInput.safeParse(await request.json().catch(() => null));
  if (!p.success)
    return NextResponse.json(
      { error: "Completa el patrón, el ejemplo, la sesión y la fecha." },
      { status: 400 },
    );
  const x = p.data;
  const { data, error } = await c.db.rpc("record_error_observation", {
    event_id: x.id,
    new_pattern_id: x.pattern_id,
    pattern_text: x.pattern,
    error_category: x.category,
    event_skill: x.skill,
    session_label: x.session_ref,
    event_date: x.occurred_on,
    event_outcome: x.outcome,
    event_example: x.example,
    event_assisted: x.assisted,
  });
  if (error)
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "Este identificador ya tiene otro contenido. Recarga antes de reintentar."
            : "No se pudo guardar. Registra primero un error; comprueba la fecha y la migración.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  return NextResponse.json({ ok: true, pattern_id: data });
}
export async function DELETE(request: Request) {
  const c = await context(request);
  if (c.error) return c.error;
  const p = z
    .object({ kind: z.enum(["pattern", "observation"]), id: z.uuid() })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!p.success)
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  const { error } = await c.db
    .from(p.data.kind === "pattern" ? "error_patterns" : "error_observations")
    .delete()
    .eq("id", p.data.id)
    .eq("user_id", c.user.id);
  return error
    ? NextResponse.json({ error: "No se pudo borrar" }, { status: 500 })
    : NextResponse.json({ ok: true });
}

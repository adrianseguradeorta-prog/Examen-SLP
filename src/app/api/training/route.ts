import { NextResponse } from "next/server";
import { isDeepStrictEqual } from "node:util";
import { context } from "@/lib/api";
import {
  activityInput,
  planInput,
  submissionInput,
  type Submission,
} from "@/lib/training";
import { diagnosticReport } from "@/lib/diagnostic-grading";
export async function GET() {
  const c = await context();
  if (c.error) return c.error;
  const results = await Promise.all([
    c.db
      .from("study_plans")
      .select("id,start_date,exam_date,weekly_minutes,created_at")
      .order("created_at", { ascending: false })
      .limit(36),
    c.db
      .from("study_activities")
      .select("id,skill,minutes,studied_on,note")
      .order("studied_on", { ascending: false })
      .limit(1000),
    c.db
      .from("diagnostic_submissions")
      .select("id,payload,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (results.some((r) => r.error))
    return NextResponse.json(
      {
        error:
          "No se pudo cargar el entrenamiento. Comprueba que ambas migraciones estén aplicadas.",
      },
      { status: 500 },
    );
  const warnings: string[] = [];
  const plans = results[0].data?.flatMap((row) => {
    const { id, start_date, exam_date, weekly_minutes } = row;
    const parsed = planInput.safeParse({
      id,
      start_date,
      exam_date,
      weekly_minutes,
    });
    if (!parsed.success) {
      warnings.push("invalid_plan");
      return [];
    }
    return [parsed.data];
  });
  const activities = results[1].data?.flatMap((row) => {
    const parsed = activityInput.safeParse(row);
    if (!parsed.success) {
      warnings.push("invalid_activity");
      return [];
    }
    return [parsed.data];
  });
  const submissions = results[2].data?.flatMap((row) => {
    const parsed = submissionInput.safeParse(row.payload);
    if (!parsed.success) {
      warnings.push("invalid_submission");
      return [];
    }
    return [
      { ...row, payload: parsed.data, report: diagnosticReport(parsed.data) },
    ];
  });
  return NextResponse.json(
    { plans, activities, submissions, warnings },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const c = await context(request);
  if (c.error) return c.error;
  const body = await request.json().catch(() => null);
  let table: string, payload: Record<string, unknown>;
  if (body?.action === "plan") {
    const p = planInput.safeParse(body.data);
    if (!p.success)
      return NextResponse.json(
        { error: "Revisa fechas y carga semanal." },
        { status: 400 },
      );
    table = "study_plans";
    payload = p.data;
  } else if (body?.action === "activity") {
    const p = activityInput.safeParse(body.data);
    if (
      !p.success ||
      p.data.studied_on >
        new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    )
      return NextResponse.json(
        { error: "Actividad o fecha inválida." },
        { status: 400 },
      );
    table = "study_activities";
    payload = p.data;
  } else if (body?.action === "submission") {
    const p = submissionInput.safeParse(body.data);
    if (!p.success)
      return NextResponse.json(
        { error: "Completa las respuestas antes de entregar." },
        { status: 400 },
      );
    table = "diagnostic_submissions";
    payload = { id: p.data.id, payload: p.data };
  } else
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  const { error } = await c.db
    .from(table)
    .insert({ ...payload, user_id: c.user.id });
  if (error) {
    if (error.code !== "23505")
      return NextResponse.json(
        {
          error:
            "No se pudo guardar. Puedes reintentar sin duplicar la operación.",
        },
        { status: 500 },
      );
    const { data: existing } = await c.db
      .from(table)
      .select("*")
      .eq("id", payload.id)
      .maybeSingle();
    if (
      !existing ||
      !Object.entries(payload).every(([k, v]) =>
        isDeepStrictEqual(existing[k], v),
      )
    )
      return NextResponse.json(
        {
          error:
            "Esta operación ya tiene otro contenido guardado. Recarga antes de continuar.",
        },
        { status: 409 },
      );
  }
  return NextResponse.json({
    ok: true,
    report:
      table === "diagnostic_submissions"
        ? diagnosticReport(payload.payload as Submission)
        : null,
  });
}
export async function DELETE(request: Request) {
  const c = await context(request);
  if (c.error) return c.error;
  const body = await request.json().catch(() => null);
  const tables: Record<string, string> = {
    activity: "study_activities",
    submission: "diagnostic_submissions",
    plan: "study_plans",
  };
  const id = activityInput.shape.id.safeParse(body?.id);
  const table = Object.hasOwn(tables, body?.kind)
    ? tables[body.kind]
    : undefined;
  if (!id.success || !table)
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  const { error } = await c.db
    .from(table)
    .delete()
    .eq("id", id.data)
    .eq("user_id", c.user.id);
  return error
    ? NextResponse.json({ error: "No se pudo borrar" }, { status: 500 })
    : NextResponse.json({ ok: true });
}

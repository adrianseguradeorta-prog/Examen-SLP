import { NextResponse } from "next/server";
import { context } from "@/lib/api";
import { draftSchema } from "@/lib/domain";
export async function GET() {
  const c = await context();
  if (c.error) return c.error;
  const { data, error } = await c.db
    .from("writing_drafts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1);
  return error
    ? NextResponse.json(
        { error: "No se pudo recuperar el borrador" },
        { status: 500 },
      )
    : NextResponse.json({ draft: data?.[0] ?? null });
}
export async function PUT(request: Request) {
  const c = await context(request);
  if (c.error) return c.error;
  const parsed = draftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Borrador inválido" }, { status: 400 });
  const d = parsed.data;
  const { data, error } = await c.db.rpc("save_writing_draft", {
    draft_id: d.id,
    base_revision: d.revision,
    draft_text: d.text,
    task_title: d.task,
  });
  if (error)
    return NextResponse.json(
      { error: "No se pudo guardar. Conserva tu copia local." },
      { status: 500 },
    );
  if (!data)
    return NextResponse.json(
      {
        error:
          "Otra versión está guardada. Descarga tu copia antes de recuperar la del servidor.",
      },
      { status: 409 },
    );
  return NextResponse.json({ draft: data });
}

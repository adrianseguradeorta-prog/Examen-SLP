import { NextResponse } from "next/server";
import { configured, database } from "@/lib/supabase";
import { z } from "zod";
export async function POST(request: Request) {
  const expected = new URL(process.env.NEXT_PUBLIC_APP_URL || request.url)
    .origin;
  if (request.headers.get("origin") !== expected)
    return NextResponse.json({ error: "Origen inválido" }, { status: 403 });
  if (!configured())
    return NextResponse.json(
      { error: "Supabase todavía no está conectado." },
      { status: 503 },
    );
  const body = z
    .object({ email: z.email(), password: z.string().min(8).max(128) })
    .safeParse(await request.json().catch(() => null));
  if (!body.success)
    return NextResponse.json(
      { error: "Revisa el email y la contraseña (mínimo 8 caracteres)." },
      { status: 400 },
    );
  const db = await database();
  const { error } = await db.auth.signInWithPassword(body.data);
  return error
    ? NextResponse.json(
        { error: "No se pudo iniciar sesión. Comprueba tus credenciales." },
        { status: 401 },
      )
    : NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  if (
    request.headers.get("origin") !==
    new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin
  )
    return NextResponse.json({}, { status: 403 });
  if (configured()) await (await database()).auth.signOut();
  return NextResponse.json({ ok: true });
}

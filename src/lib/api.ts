import { NextResponse } from "next/server";
import { configured, database } from "./supabase";
export async function context(request?: Request) {
  if (request && request.method !== "GET") {
    const expected = new URL(process.env.NEXT_PUBLIC_APP_URL || request.url)
      .origin;
    if (request.headers.get("origin") !== expected)
      return {
        error: NextResponse.json(
          { error: "Origen no autorizado" },
          { status: 403 },
        ),
      };
  }
  if (!configured())
    return {
      error: NextResponse.json(
        { error: "Conecta Supabase para guardar tu progreso." },
        { status: 503 },
      ),
    };
  const db = await database();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return {
      error: NextResponse.json(
        { error: "Inicia sesión para continuar." },
        { status: 401 },
      ),
    };
  return { db, user };
}

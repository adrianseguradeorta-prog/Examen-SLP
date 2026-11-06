import { NextResponse } from "next/server";
import { submissionInput } from "@/lib/training";
import { diagnosticReport } from "@/lib/diagnostic-grading";

// Stateless practice feedback, with answer keys remaining on the app server.
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 150000)
    return NextResponse.json(
      { error: "Muestra demasiado larga" },
      { status: 413 },
    );
  const parsed = submissionInput.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Completa la muestra" }, { status: 400 });
  return NextResponse.json(diagnosticReport(parsed.data), {
    headers: { "Cache-Control": "no-store" },
  });
}

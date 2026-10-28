"use client";
import { useCallback, useEffect, useState } from "react";
import type { Activity, PlanInput, Submission } from "@/lib/training";
type Report = {
  estimatedLevel: null;
  status: string;
  message: string;
  correct?: number;
  total?: number;
  items?: { correct: boolean; explanation: string }[];
};
export type TrainingData = {
  plans: PlanInput[];
  activities: Activity[];
  submissions: {
    id: string;
    payload: Submission;
    created_at: string;
    report: Report;
  }[];
};
export function useTraining() {
  const [data, setData] = useState<TrainingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/training", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      setData(j);
      setError(
        j.warnings?.length
          ? "Hay registros antiguos o inválidos que no pueden interpretarse. El resto del historial está disponible."
          : "",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/training", { cache: "no-store", signal: abort.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        return j;
      })
      .then((j) => {
        setData(j);
        setError(
          j.warnings?.length
            ? "Hay registros inválidos excluidos del historial."
            : "",
        );
      })
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(e instanceof Error ? e.message : "Error de conexión");
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, []);
  async function mutate(body: unknown, method = "POST") {
    const r = await fetch("/api/training", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) throw Error(j.error);
    await load();
    return j;
  }
  return { data, error, loading, load, mutate };
}

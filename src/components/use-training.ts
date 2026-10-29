"use client";
import { useCallback, useEffect, useState } from "react";
import {
  practiceRequest,
  PRACTICE_CHANGE,
  practicePrefix,
} from "@/lib/local-practice";
import type { Activity, PlanInput, Submission } from "@/lib/training";
export type Report = {
  estimatedLevel: null;
  status: string;
  message: string;
  correct?: number;
  total?: number;
  items?: { correct: boolean; explanation: string; type?: string }[];
  transcript?: string;
};
export type TrainingData = {
  warnings?: string[];
  plans: PlanInput[];
  activities: Activity[];
  submissions: {
    id: string;
    payload: Submission;
    created_at: string;
    report: Report;
  }[];
};
export function useTraining(local = false, owner = "guest") {
  const [data, setData] = useState<TrainingData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const r = await practiceRequest(
        local,
        "/api/training",
        {
          cache: "no-store",
        },
        owner,
      );
      const j = await r.json();
      if (!r.ok) throw Error(j.error);
      if (!local && owner !== "guest" && j.ownerId !== owner)
        throw Error("La cuenta ha cambiado. Recarga la página.");
      setData(j);
      setError(
        j.warnings?.length
          ? "Hay registros antiguos o inválidos que no pueden interpretarse. El resto del historial está disponible."
          : "",
      );
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [local, owner]);
  useEffect(() => {
    const abort = new AbortController();
    practiceRequest(
      local,
      "/api/training",
      {
        cache: "no-store",
        signal: abort.signal,
      },
      owner,
    )
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        return j;
      })
      .then((j) => {
        if (abort.signal.aborted) return;
        if (!local && owner !== "guest" && j.ownerId !== owner)
          throw Error("La cuenta ha cambiado. Recarga la página.");
        setData(j);
        setError(
          j.warnings?.length
            ? "Hay registros inválidos excluidos del historial."
            : "",
        );
      })
      .catch((e) => {
        if (!abort.signal.aborted) {
          setData(null);
          setError(e instanceof Error ? e.message : "Error de conexión");
        }
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [local, owner]);
  useEffect(() => {
    if (!local) return;
    const changed = () => {
      void load();
    };
    const storage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith(practicePrefix(owner))) changed();
    };
    window.addEventListener(PRACTICE_CHANGE, changed);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(PRACTICE_CHANGE, changed);
      window.removeEventListener("storage", storage);
    };
  }, [local, owner, load]);
  async function mutate(body: unknown, method = "POST") {
    const r = await practiceRequest(
      local,
      "/api/training",
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          !local && owner !== "guest"
            ? { ...(body as object), expectedOwner: owner }
            : body,
        ),
      },
      owner,
    );
    const j = await r.json();
    if (!r.ok) throw Error(j.error);
    await load();
    return j;
  }
  return { data, error, loading, load, mutate };
}

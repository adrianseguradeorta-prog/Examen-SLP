"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TrainingData } from "./use-training";
import { catalogs, taskHref, taskState } from "@/lib/task-rotation";
import type { TaskSkill } from "@/lib/task-catalog";
import { practiceRequest } from "@/lib/local-practice";
export function TaskPicker({
  skill,
  version,
  data,
  disabled = false,
}: {
  skill: TaskSkill;
  version: string;
  data: TrainingData | null;
  disabled?: boolean;
}) {
  const router = useRouter();
  return (
    <label>
      Tarea de {skill}
      <select
        value={version}
        disabled={!data || disabled}
        onChange={(e) => router.push(taskHref(skill, e.target.value))}
      >
        {catalogs[skill].map((t) => (
          <option value={t.version} key={t.version}>
            {t.title} · {data ? taskState(data, skill, t.version) : "Cargando"}
          </option>
        ))}
      </select>
    </label>
  );
}
export function useOpenedTask(
  local: boolean,
  owner: string,
  skill: TaskSkill,
  version: string,
  enabled: boolean,
) {
  const [warning, setWarning] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void practiceRequest(
      local,
      "/api/training",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "exposure",
          data: { id: crypto.randomUUID(), skill, version, stage: "opened" },
          ...(!local ? { expectedOwner: owner } : {}),
        }),
      },
      owner,
    )
      .then(async (r) => {
        if (!r.ok && active)
          setWarning(
            "No se pudo registrar que abriste esta tarea; conserva tu trabajo antes de salir.",
          );
      })
      .catch(() => {
        if (active) setWarning("No se pudo registrar esta apertura.");
      });
    return () => {
      active = false;
    };
  }, [local, owner, skill, version, enabled]);
  return warning;
}

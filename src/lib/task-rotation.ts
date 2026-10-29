import type { TrainingData } from "@/components/use-training";
import type { Submission, TaskExposure } from "./training";
import {
  readingTasks,
  listeningTasks,
  writingTasks,
  type TaskSkill,
} from "./task-catalog";
import { speakingTasks } from "./speaking-content";
export const catalogs = {
  reading: readingTasks,
  listening: listeningTasks,
  writing: writingTasks,
  speaking: speakingTasks,
};
export function taskState(
  data: TrainingData,
  skill: TaskSkill,
  version: string,
) {
  const completed = data.submissions.some(
    (s) => s.payload.kind === skill && s.payload.version === version,
  );
  const opened = data.exposures?.some(
    (e) => e.skill === skill && e.version === version && e.stage === "opened",
  );
  const known =
    completed ||
    data.exposures?.some(
      (e) =>
        e.skill === skill && e.version === version && e.stage === "solutions",
    );
  return known
    ? "Repetición para práctica"
    : opened
      ? "Abierta · sin entrega"
      : "Tarea nueva";
}
export function nextTask(data: TrainingData, skill: TaskSkill) {
  // Resume opened but unfinished material before offering another new task.
  const tasks = catalogs[skill];
  return (
    tasks.find(
      (t) => taskState(data, skill, t.version) === "Abierta · sin entrega",
    ) ??
    tasks.find((t) => taskState(data, skill, t.version) === "Tarea nueva") ??
    tasks[0]
  );
}
export function taskHref(skill: TaskSkill, version: string) {
  const base = skill === "listening" ? "/listening" : "/diagnostic";
  const hash = skill === "listening" ? "" : `#${skill}`;
  return version === catalogs[skill][0].version
    ? base + hash
    : `${base}?${skill}=${encodeURIComponent(version)}${hash}`;
}
export function knownSolutions(
  exposures: TaskExposure[],
  submissions: { payload: Submission }[],
  skill: TaskSkill,
  version: string,
) {
  return (
    exposures.some(
      (e) =>
        e.skill === skill && e.version === version && e.stage === "solutions",
    ) ||
    submissions.some(
      (s) => s.payload.kind === skill && s.payload.version === version,
    )
  );
}
export function independentSamples(
  data: TrainingData,
  skill: "reading" | "listening",
) {
  if (data.warnings?.length || data.submissions.length >= 50) return [];
  const rows = data.submissions.filter((s) => s.payload.kind === skill);
  const versions = [...new Set(rows.map((s) => s.payload.version))];
  return versions.flatMap((version) => {
    const group = rows.filter((s) => s.payload.version === version);
    const earliest = group.map((s) => s.created_at).sort()[0];
    // Equal timestamps do not establish order; count at most one eligible first sample.
    const first = group.find(
      (s) =>
        s.created_at === earliest &&
        (s.payload.kind === "reading" || s.payload.kind === "listening") &&
        s.payload.priorExposure === "none" &&
        !(
          s.payload.kind === "listening" &&
          (s.payload.solutionsKnown || s.payload.transcriptViewed)
        ),
    );
    return first ? [first] : [];
  });
}

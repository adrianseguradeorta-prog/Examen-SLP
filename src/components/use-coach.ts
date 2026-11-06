"use client";
import { useEffect, useState } from "react";
import {
  COACH_CHANGE,
  coachKey,
  readCoach,
  saveCoach,
} from "@/lib/coach-store";
import { emptyCoach, type Coach } from "@/lib/coach-model";
import {
  DIAGNOSTIC_IDENTITY_EVENT,
  DIAGNOSTIC_IDENTITY_KEY,
} from "@/lib/diagnostic-identity";
export function useCoach(enabled = true, owner = "guest") {
  const [snapshot, setSnapshot] = useState<{
    data: Coach;
    raw: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const load = () => {
      try {
        setSnapshot(readCoach(localStorage, owner));
        setError("");
      } catch {
        setSnapshot(null);
        setError(
          "No se puede leer el perfil o las revisiones locales. No sobrescribas datos; conserva una copia.",
        );
      }
    };
    const lock = () => setLocked(true);
    const storage = (e: StorageEvent) => {
      if (!e.key || e.key === DIAGNOSTIC_IDENTITY_KEY) lock();
      else if (e.key === coachKey(owner)) {
        lock();
        setError(
          "Otra pestaña cambió el perfil o las revisiones. Recarga antes de continuar.",
        );
      }
    };
    queueMicrotask(load);
    window.addEventListener(COACH_CHANGE, load);
    window.addEventListener("storage", storage);
    window.addEventListener(DIAGNOSTIC_IDENTITY_EVENT, lock);
    window.addEventListener("slp-local-replaced", lock);
    return () => {
      window.removeEventListener(COACH_CHANGE, load);
      window.removeEventListener("storage", storage);
      window.removeEventListener(DIAGNOSTIC_IDENTITY_EVENT, lock);
      window.removeEventListener("slp-local-replaced", lock);
    };
  }, [enabled, owner]);
  async function update(fn: (value: Coach) => Coach) {
    if (!enabled || !snapshot || locked)
      throw Error("Recarga para verificar tu espacio local antes de guardar.");
    const write = () => {
      const saved = saveCoach(
        localStorage,
        owner,
        snapshot.raw,
        fn(snapshot.data),
      );
      setSnapshot(saved);
      window.dispatchEvent(new Event(COACH_CHANGE));
    };
    if (navigator.locks)
      await navigator.locks.request(`slp-local:${owner}`, write);
    else write();
  }
  return {
    coach: snapshot?.data ?? emptyCoach(owner),
    ready: !!snapshot && !locked,
    error: locked
      ? error || "El espacio cambió. Recarga antes de continuar."
      : error,
    update,
  };
}

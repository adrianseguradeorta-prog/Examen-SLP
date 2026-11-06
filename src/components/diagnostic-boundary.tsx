"use client";
import { useEffect, useState } from "react";
import {
  DIAGNOSTIC_IDENTITY_KEY,
  DIAGNOSTIC_IDENTITY_EVENT,
} from "@/lib/diagnostic-identity";
export function DiagnosticBoundary({
  owner,
  children,
}: {
  owner: string | null;
  children: React.ReactNode;
}) {
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    const lock = () => setLocked(true);
    const storage = (e: StorageEvent) => {
      if (!e.key || e.key === DIAGNOSTIC_IDENTITY_KEY) lock();
    };
    window.addEventListener(DIAGNOSTIC_IDENTITY_EVENT, lock);
    window.addEventListener("storage", storage);
    // A restored browser history page must verify the current account again.
    window.addEventListener("pagehide", lock);
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined")
        channel = new BroadcastChannel(DIAGNOSTIC_IDENTITY_EVENT);
    } catch {
      // Storage/current-page events remain available if this API is blocked.
    }
    if (channel) channel.onmessage = lock;
    return () => {
      window.removeEventListener(DIAGNOSTIC_IDENTITY_EVENT, lock);
      window.removeEventListener("storage", storage);
      window.removeEventListener("pagehide", lock);
      channel?.close();
    };
  }, []);
  if (!owner || locked)
    return (
      <div className="notice">
        No se muestran muestras privadas sin verificar la cuenta.{" "}
        <button onClick={() => window.location.reload()}>
          Verificar sesión de nuevo
        </button>
      </div>
    );
  return children;
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Account({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="card">
      <h2>Iniciar sesión</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const data = new FormData(e.currentTarget);
          try {
            const r = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: data.get("email"),
                password: data.get("password"),
              }),
            });
            const j = await r.json();
            if (r.ok) {
              router.push("/");
              router.refresh();
            } else setMessage(j.error);
          } catch {
            setMessage("No hay conexión. Inténtalo de nuevo.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            minLength={8}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="button" disabled={!connected || busy}>
          {busy ? "Conectando…" : "Entrar"}
        </button>
      </form>
      <p role="status">
        {message ||
          (!connected ? "Acceso pendiente de conectar Supabase." : "")}
      </p>
      <button
        className="text-button"
        onClick={async () => {
          await fetch("/api/auth", { method: "DELETE" });
          sessionStorage.clear();
          router.push("/");
          router.refresh();
        }}
      >
        Cerrar sesión
      </button>
      <button
        className="text-button"
        onClick={() => {
          document.documentElement.classList.toggle("dark");
        }}
      >
        Cambiar claro / oscuro
      </button>
    </section>
  );
}

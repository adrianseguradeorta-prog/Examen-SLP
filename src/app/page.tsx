import Link from "next/link";
import { ArrowRight, Mic, Clock3, Target, Check } from "lucide-react";
import { planWeek } from "@/lib/domain";
import { configured, database } from "@/lib/supabase";
export default async function Home() {
  const connected = configured();
  const user = connected
    ? (await (await database()).auth.getUser()).data.user
    : null;
  const plan = planWeek();
  return (
    <>
      <div className="eyebrow">EL CAMINO HACIA TU OBJETIVO</div>
      <div className="page-title">
        <div>
          <h1>Tu inglés, un paso más allá.</h1>
          <p>De 3.2.2.2 a 3.3.3.3. Hoy empezamos por tu voz.</p>
        </div>
        <span className="pill">
          <Target size={15} /> Objetivo 3333
        </span>
      </div>
      {!user && (
        <div className="notice">
          <span>
            {connected
              ? "Inicia sesión para recuperar tu entrenamiento."
              : "Tu espacio está preparado. Conecta tu cuenta para empezar a guardar progreso."}
          </span>
          <Link href="/settings">
            Configurar <ArrowRight size={15} />
          </Link>
        </div>
      )}
      <section className="hero">
        <div>
          <div className="eyebrow">PRIORIDAD 01 / SPEAKING</div>
          <h2>
            No solo responder.
            <br />
            Sostener una idea.
          </h2>
          <p>
            Practica cómo justificar tu postura, reaccionar a una objeción y
            explorar qué pasaría si las condiciones cambiaran.
          </p>
          <Link className="button light" href="/speaking">
            Abrir Speaking Lab <ArrowRight size={18} />
          </Link>
          <div className="hero-meta">
            <Clock3 size={15} /> Sesiones de 15–25 min <span>•</span> Tres modos
            de práctica
          </div>
        </div>
        <div className="voice-art" aria-hidden="true">
          {[
            20, 38, 58, 31, 78, 110, 65, 150, 100, 54, 86, 130, 70, 42, 90, 51,
            32,
          ].map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
          <span>FIND YOUR VOICE</span>
        </div>
      </section>
      <div className="section-title">
        <h2>Tu punto de partida</h2>
        <span>Perfil declarado · pendiente de diagnóstico</span>
      </div>
      <div className="skill-grid">
        {[
          ["Listening", "3", "Mantener"],
          ["Speaking", "2", "Prioridad"],
          ["Reading", "2", "Desarrollar"],
          ["Writing", "2", "Desarrollar"],
        ].map(([s, n, t]) => (
          <article className="skill-card" key={s}>
            <span>
              {s}
              <small>{t}</small>
            </span>
            <strong>
              {n}
              <em>→ 3</em>
            </strong>
            <p>Sin evaluación registrada</p>
          </article>
        ))}
      </div>
      <div className="two-col">
        <section className="card">
          <div className="section-title">
            <h2>Una semana con intención</h2>
            <span>Plan inicial</span>
          </div>
          <p className="muted">
            6 h 30 min · Se ajustará cuando haya evidencias.
          </p>
          {Object.entries(plan).map(([s, m]) => (
            <div className="plan-row" key={s}>
              <span>{s === "review" ? "Repaso y vocabulario" : s}</span>
              <div className="plan-track">
                <i style={{ width: `${(m / 180) * 100}%` }} />
              </div>
              <b>{m} min</b>
            </div>
          ))}
        </section>
        <section className="card">
          <div className="eyebrow">TU SIGUIENTE PASO</div>
          <h2>Construye una base sólida.</h2>
          <div className="steps">
            <p>
              <Check size={18} /> Explora las primeras clases originales.
            </p>
            <p>
              <Mic size={18} /> Prepara una respuesta con hipótesis.
            </p>
            <p>
              <Target size={18} /> Conecta tu cuenta y realiza el diagnóstico.
            </p>
          </div>
          <Link className="text-link" href="/library">
            Ir a la biblioteca <ArrowRight size={17} />
          </Link>
          <p className="muted small">
            El diagnóstico completo aún está en desarrollo. No mostraremos un
            nivel estimado sin evidencia suficiente.
          </p>
        </section>
      </div>
    </>
  );
}

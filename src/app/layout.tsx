import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Mic,
  PenLine,
  BookOpen,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import "./globals.css";
export const metadata: Metadata = {
  title: "SLP 3333 · Entrenamiento",
  description:
    "Entrenamiento personal de inglés STANAG 6001. Estimaciones, nunca certificación oficial.",
  appleWebApp: { capable: true, title: "SLP 3333", statusBarStyle: "default" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <aside className="sidebar">
          <Link className="brand" href="/">
            SLP<span>3333</span>
            <small>LANGUAGE TRAINING</small>
          </Link>
          <div className="nav-label">TU ENTRENAMIENTO</div>
          <nav>
            {[
              ["/", "Hoy", Compass],
              ["/speaking", "Speaking Lab", Mic],
              ["/diagnostic", "Diagnóstico", Compass],
              ["/plan", "Plan y actividad", BookOpen],
              ["/writing", "Writing Lab", PenLine],
              ["/library", "Biblioteca", BookOpen],
              ["/settings", "Cuenta y conexión", Settings],
            ].map(([href, label, Icon]) => {
              const I = Icon as typeof Compass;
              return (
                <Link key={String(href)} href={String(href)}>
                  <I size={19} />
                  {String(label)}
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-note">
            <span className="dot" /> Una meta. Cuatro destrezas.
            <strong>3 · 3 · 3 · 3</strong>
            <p>Entrena para producir inglés con independencia.</p>
            <ArrowUpRight size={20} />
          </div>
        </aside>
        <div className="workspace">
          <header>
            <span>
              PERSONAL TRAINING / <b>ENGLISH</b>
            </span>
            <Link href="/settings" className="profile">
              AS
            </Link>
          </header>
          <main>{children}</main>
          <footer>
            SLP 3333 TRAINER{" "}
            <span>
              Preparación independiente · No certifica niveles oficiales
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}

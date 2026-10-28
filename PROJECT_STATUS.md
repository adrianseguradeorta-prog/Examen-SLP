# PROJECT_STATUS

Actualizado: 2026-10-28. Primer incremento de implementación, autorizado por el usuario. Rama `feat/training-foundation`.

## DONE

- Investigación/diseño conservados con limitaciones y referencias.
- Next.js/React/TypeScript con versiones fijas y lockfile.
- Interfaz responsive, dashboard sin progreso inventado, light/dark, manifest inicial.
- Cuatro clases originales, Reading de tres preguntas con feedback y seis chunks.
- Speaking: selección de modos y prueba local de micrófono/reproducción, sin gasto IA.
- Login/logout Supabase; Writing con contador, descarga, autosave servidor y detección de conflictos.
- Migración PostgreSQL: borradores, versiones, RLS y función de guardado con revisión optimista.
- Reglas iniciales de planificación y guarda longitudinal conservadora (no evaluador habilitado).
- CI lint/typecheck/tests/build e instrucciones para conectar servicios.

## IN PROGRESS

- Base de producto; aún no es plataforma completa para uso diario durante nueve meses.

## TODO

- Conectar Supabase/Vercel/OpenAI cuando el usuario cree proyectos y configure secretos.
- Diagnóstico, persistencia de plan y perfil, Error Bank, SRS, Reading/Listening guardados, mocks e informes.
- Voz WebRTC real, cuotas servidor, grabación privada, reconexión y evaluación posterior.
- Borrado/exportación, recuperación offline, recuperación de contraseña y backups antes de producción.
- Contenido inicial completo, admin editorial, pruebas físicas y calibración humana.

## KNOWN ISSUES

- Sin servicios configurados: login y guardado cloud no probados contra Supabase gestionado.
- Writing sin conexión conserva texto solo en pestaña; hay descarga explícita y aviso de salida, no recuperación offline.
- Solo se recupera el borrador más reciente; selector de historial pendiente.
- Manifest inicial sin service worker ni iconos Apple completos: no declarar PWA validada.
- Speaking es prueba local, no conversación IA. No habilitada evaluación de nivel.
- Normativa/convocatoria concreta y análisis de muestras pendientes según investigación.
- No pruebas físicas iPhone ni QA visual de navegador realizadas.

## DECISIONS NEEDED

- No nuevas aprobaciones menores para seguir. Usuario solicitó preparar sin cuentas cloud.
- Antes de almacenar audio: confirmar conservación y privacidad; costes externos dentro del presupuesto revisado.

## NEXT STEPS

Conectar servicios siguiendo docs/deployment/CONNECT_SERVICES.md, validar dos dispositivos y construir el flujo completo de voz con presupuesto y recuperación. No llamar terminado a Speaking ni a la plataforma con esta base.

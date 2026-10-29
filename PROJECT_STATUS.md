# PROJECT_STATUS

Actualizado: 2026-10-29. Cuarto incremento de implementación, autorizado por el usuario. Rama `feat/training-foundation`.

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
- Plan de 36 semanas guardado por versiones, carga de 6–7 h, calendario y señalización de semanas posteriores al examen.
- Registro manual de actividades con resumen, deduplicación de reintentos y borrado por propietario.
- Muestras iniciales de diagnóstico: Reading original con corrección servidor sin nivel SLP; Writing guardado pendiente de revisión.
- Segunda migración de planes/actividades/muestras, validación de datos almacenados y permisos RLS.
- 39 pruebas locales pasaban antes de este incremento, además de lint, TypeScript y build de producción.
- Error Bank persistente manual: patrones deduplicados, ejemplos por sesión, frecuencia, estados y borrado con recálculo.
- Recomendaciones de práctica según recurrencia, con abstención si el historial está incompleto.
- Tercera migración con escritura atómica, aislamiento, reintentos y borrado en cascada.
- Writing recupera borradores desde `localStorage` tras recarga o cierre, conserva cambios locales ante conflictos remotos y separa el almacenamiento por usuario autenticado o invitado.
- Logout elimina la identidad local activa de Writing sin borrar los borradores de otros usuarios.
- Pruebas unitarias añadidas para aislamiento de claves, recuperación local, selección local/remota y rechazo de datos locales inválidos.

## IN PROGRESS

- Base de producto; aún no es plataforma completa para uso diario durante nueve meses.

## TODO

- Conectar Supabase/Vercel/OpenAI solo cuando el usuario lo autorice y configure secretos.
- Completar diagnóstico de cuatro destrezas, perfil editable, adaptación automática del calendario, detección IA de errores, SRS, Listening, mocks e informes.
- Voz WebRTC real, cuotas servidor, grabación privada, reconexión y evaluación posterior.
- Borrado/exportación, recuperación de contraseña y backups antes de producción.
- Offline completo de la aplicación (app shell/service worker); la recuperación local de borradores de Writing ya está implementada.
- Contenido inicial completo, admin editorial, pruebas físicas y calibración humana.

## KNOWN ISSUES

- Sin servicios configurados: login y guardado cloud no probados contra Supabase gestionado. Aplicar las tres migraciones en orden cuando se conecte.
- Plan inicial sin adaptación automática. Actividades declaradas, resúmenes UTC y límites de carga de historial explícitos.
- Diagnóstico todavía parcial y sin calibración; texto de muestra sin autosave (descarga disponible).
- Writing conserva localmente el borrador, pero un conflicto de revisión requiere decisión manual; no se sobrescribe automáticamente la copia local.
- El almacenamiento local depende del navegador/dispositivo actual; la sincronización entre dispositivos requiere el backend.
- Solo se recupera el borrador remoto más reciente; selector de historial pendiente.
- Manifest inicial sin service worker ni iconos Apple completos: no declarar PWA validada.
- Speaking es prueba local, no conversación IA. No habilitada evaluación de nivel.
- Normativa/convocatoria concreta y análisis de muestras pendientes según investigación.
- No pruebas físicas iPhone ni QA visual de navegador realizadas.
- Error Bank depende de observaciones declaradas, no detección IA. Historial limitado por consulta: se omiten estados/recomendaciones si falta información.

## DECISIONS NEEDED

- No nuevas aprobaciones menores para seguir. Usuario solicitó preparar sin cuentas cloud.
- Antes de almacenar audio: confirmar conservación y privacidad; costes externos dentro del presupuesto revisado.

## NEXT STEPS

Validar este incremento con CI (tests, lint, TypeScript y build) y seguir completando funciones que no requieran servicios externos. Mantener Supabase, Vercel y OpenAI sin conectar hasta autorización expresa.

# PROJECT_STATUS

Actualizado: 2026-10-29. Quinto incremento: práctica diaria utilizable sin servicios externos, autorizado por el usuario. Rama `feat/training-foundation`.

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
- Cuarto incremento validado en GitHub Actions: `npm ci`, lint, TypeScript, tests y build de producción pasan.

- Pantalla Hoy: siguiente ejercicio con enlace, duración orientativa y explicación; primera sesión guiada de unos 40 minutos.
- Modo local explícito cuando Supabase no está configurado: planes/versiones, actividades, muestras entregadas y Error Bank en el navegador, con validación de datos y reintentos sin duplicar registros.
- Registro de práctica terminada desde Hoy o Plan: el usuario declara destreza y minutos reales; la recomendación utiliza el registro confirmado, no la apertura de pantallas.
- Siguiente práctica según semana activa y reparto de minutos del plan; propuesta general si faltan datos, aviso si el calendario no está vigente y abstención ante historial parcial/inválido.
- Diagnóstico Reading utilizable sin cuenta: cuatro preguntas originales, corrección en el servidor local, explicación por tipo de pregunta y orientación hacia otra lectura. No se asignan niveles; repetir soluciones no aporta evidencia independiente.
- Speaking guiado: tres temas, cuatro preguntas fijas por tema, reflexión posterior y enlaces a registro/Error Bank. No graba, no escucha y no evalúa. Se conserva la prueba previa opcional de micrófono, exclusivamente temporal en memoria.
- Exportación JSON del historial local desde Hoy; Writing mantiene su propia descarga y recuperación sin cambios respecto a la rama oficial validada.
- 62 pruebas locales pasan (18 nuevas), lint, TypeScript y build de producción. Verificación de este incremento ejecutada localmente; no atribuirle un resultado nuevo de GitHub Actions sin comprobarlo.
- Guía de usuario: docs/product/EMPEZAR_A_PRACTICAR.md.

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
- El plan mantiene las 36 semanas y la carga fijada; Hoy selecciona práctica según registros, pero no reprograma el calendario ni estima progresión de nivel. Actividades declaradas, fechas/resúmenes UTC y límites de historial explícitos.
- Diagnóstico parcial y sin calibración: Reading ofrece feedback limitado a una muestra; Writing queda pendiente de revisión. Antes de entregar, el formulario diagnóstico no tiene autosave (descarga de texto disponible); usar Writing Lab para una escritura interrumpible.
- Writing conserva localmente el borrador, pero un conflicto de revisión requiere decisión manual; no se sobrescribe automáticamente la copia local.
- El almacenamiento local depende del navegador/dispositivo actual; la sincronización entre dispositivos requiere el backend.
- Solo se recupera el borrador remoto más reciente; selector de historial pendiente.
- Manifest inicial sin service worker ni iconos Apple completos: no declarar PWA validada.
- Speaking ofrece preguntas fijas para hablar en voz alta y la prueba temporal de micrófono. No hay conversación IA, transcripción, evaluación ni almacenamiento de audio.
- Normativa/convocatoria concreta y análisis de muestras pendientes según investigación.
- No pruebas físicas iPhone ni QA visual de navegador realizadas. El smoke HTTP local quedó bloqueado por el entorno (`listen EPERM` al abrir 127.0.0.1:3100); no se declara validado por esa comprobación. Tests de contratos/rutas, lint, TypeScript y build sí pasan.
- El modo local es un espacio personal de invitado del navegador, sin cifrado ni cuentas. No se importa a cloud automáticamente ni es fallback ante un error de autenticación. Borrar datos del sitio o usar navegación privada puede eliminar registros; Writing usa un espacio independiente.
- Historial local exportable a JSON, pero importación/restauración todavía pendiente. No hay transacciones entre pestañas para operaciones compuestas de Error Bank: registrar/borrar observaciones desde una sola pestaña.
- Error Bank depende de observaciones declaradas, no detección IA. Historial limitado por consulta: se omiten estados/recomendaciones si falta información.

## DECISIONS NEEDED

- No nuevas aprobaciones menores para seguir. Usuario solicitó preparar sin cuentas cloud.
- Antes de almacenar audio: confirmar conservación y privacidad.
- Presupuesto IA pendiente de aclaración (documentos con 45/60 USD y propuesta 100/150 USD); no se ha elegido cifra ni modificado límites. Ninguna llamada de pago en este incremento.

## NEXT STEPS

Empezar con la guía EMPEZAR_A_PRACTICAR, recoger observaciones de uso y validar el flujo en navegador/iPhone real. Después ampliar contenido, diagnóstico y calendario según evidencias de práctica. Mantener Supabase, Vercel y OpenAI sin conectar hasta autorización expresa.

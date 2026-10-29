# PROJECT_STATUS

Actualizado: 2026-10-29. Sexto incremento: diagnóstico inicial de cuatro destrezas y Listening local. Rama `feat/training-foundation`. Sin servicios conectados ni despliegue.

## DONE

### Base y práctica diaria conservadas

- Investigación, diseño y documentación de fuentes con límites explícitos.
- Next.js/React/TypeScript con versiones fijas, lockfile, CI y diseño responsive claro/oscuro; manifest inicial.
- Cuatro clases originales, Reading de Biblioteca, expresiones y Speaking guiado con preguntas fijas. Se conserva la prueba previa de micrófono de 15 segundos.
- Writing Lab mantiene **sin cambios** la recuperación local validada en la rama oficial: usuario/invitado, cierre/recarga, copia descargable, autosave servidor preparado y conflictos de revisión explícitos. No se ha rehecho este editor.
- Plan inicial de 36 semanas por versiones, carga de 6–7 horas, fecha del examen opcional y registro manual de actividad con reintentos idempotentes.
- Error Bank manual, patrones deduplicados, frecuencia, estados por oportunidades y recomendaciones conservadoras; no detección IA.
- Modo local explícito sin Supabase: planes, actividades, muestras entregadas y Error Bank en registros independientes del navegador. Nunca se usa como fallback silencioso ante un error cloud.
- Hoy ofrece la siguiente práctica, explicación, enlace, registro de minutos y descarga JSON del historial local. Se conserva la sesión breve de 40 minutos y la guía EMPEZAR A PRACTICAR.
- El incremento previo estaba terminado; se verificaron sus 62 tests, lint, TypeScript y build antes de ampliar el diagnóstico. No se duplicó su implementación.

### Diagnóstico operativo en local

- Flujo Reading → Writing → Listening → Speaking, resumen por destreza e historial de muestras con fecha y versión.
- Reading mantiene las cuatro preguntas originales y conserva respuestas, corrección por función, fecha y versión. Una lectura no determina un nivel.
- Writing diagnóstico recupera su borrador al recargar/cerrar. Reutiliza el parser de recuperación existente, con clave separada por identidad y de Writing Lab. Guarda en cada edición, ofrece descarga y conserva el texto ante fallos de entrega/almacenamiento. La entrega cierra una muestra inmutable; solo confirma el cierre tras ACK del adaptador. No hay evaluador automático.
- Listening Lab funcional: MP3 original de unos 49,5 segundos, cinco preguntas, repetición/pausa, entrega, corrección, explicaciones y transcripción posterior. Audio sintetizado localmente con Flite/FFmpeg, sin API; guion, regeneración y aviso de licencia documentados. Guarda condiciones de práctica y distingue repetir soluciones conocidas de una muestra independiente. No es modo examen.
- Speaking diagnóstico: prompts originales, preparación, grabación de hasta cinco minutos, reproducción y descarte. Audio exclusivamente en memoria; tracks cerrados y URL revocada al salir/descartar/regrabar. Sin subida ni conservación. Se registran realización declarada, ayuda, notas, interrupciones y duración del archivo solo si es fiable. No se evalúan pronunciación, fluidez ni SLP.
- Resumen distingue perfil declarado 3.2.2.2, resultado de tarea, muestra pendiente de revisión y evidencia insuficiente. **Todas las estimaciones son nulas**. Historial incompleto o corrección sin detalle impiden inferir debilidades/resultado.
- Hoy prioriza las muestras pendientes y después errores concretos de la última muestra Reading/Listening, hasta registrar práctica de esa destreza desde ese día. Luego sigue el reparto del plan, ahora con Listening funcional. No modifica las 36 semanas ni interpreta minutos como mejora.
- Aislamiento diagnóstico por identidad; modo invitado sin construir cliente cloud. Preparado para verificar propietario en servidor y bloquear muestras/editor tras cambios de cuenta; las mutaciones cloud del diagnóstico incluyen propietario esperado. No se importan muestras de invitado automáticamente.
- Cuarta migración preparada para Listening/metadatos Speaking, manteniendo RLS e inmutabilidad, sin tablas ni buckets de audio. Probada solo en PostgreSQL embebido, no aplicada a cloud.
- Guía nueva: [DIAGNÓSTICO Y PRIMERA SEMANA](docs/product/DIAGNOSTICO_Y_PRIMERA_SEMANA.md). README, guía anterior, conexión, arquitectura, esquema y pruebas actualizados.

### Validación

- `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan localmente.
- 82 tests en 12 archivos: persistencia/restauración, identidades, cuota, entrega inmutable, Listening, estados/abstención, ausencia de niveles, actividades, selección diaria, permisos y migraciones PGlite. Grabación probada con dispositivos simulados: denegación, permisos tardíos, interrupciones, duración desconocida, límite temporal, fallo y liberación de recursos.
- Se conservan las pruebas originales de Writing. No se han introducido llamadas de pago, WebRTC IA ni servicios externos.
- Son los comandos del workflow CI ejecutados localmente; no se atribuye una nueva ejecución verde de GitHub Actions sin publicarla y comprobarla.

## IN PROGRESS

- Base de práctica utilizable y recogida inicial de muestras. Aún no es una plataforma completa ni un diagnóstico SLP validado para nueve meses.

## TODO

- Revisión de uso en navegador e iPhone físicos, permisos, reproducción MP3 y grabación/recuperación tras interrupciones reales.
- Banco editorial amplio, revisión humana de materiales y calibración con evidencias oficiales cuando estén disponibles y sean utilizables legalmente.
- Evaluadores Writing/Speaking, estimación longitudinal, perfil editable, motor adaptativo completo, SRS, mocks e informes.
- Sincronización cloud, exportación/borrado de cuenta, backups e importación/restauración de copias antes de producción.
- Conversación IA y reconexión solo en un incremento autorizado; almacenamiento de audio requiere decisión posterior expresa.
- PWA/offline completo y administración editorial.

## KNOWN ISSUES

- **No se asigna SLP**: Reading/Listening son tareas breves no calibradas; Writing queda pendiente de revisión y Speaking no conserva audio revisable. Un resultado perfecto no prueba nivel 3.
- Listening usa una sola voz sintética y un anuncio corto; no representa diversidad de acentos, conversación ni comprensión sostenida. Repetirlo es repaso.
- Reading/Listening sin entregar y notas Speaking sin registrar solo viven en la pestaña. El audio oral se pierde al salir/recargar por diseño. Navegadores con duración no finita o interrupción muestran duración no disponible.
- Writing diagnóstico se edita desde una sola pestaña; no hay resolución de ediciones simultáneas en ese nuevo borrador. Un aviso de cuota/bloqueo exige descargar una copia. Borrar una muestra cerrada del historial no elimina silenciosamente su copia aún visible en el editor.
- Writing Lab conserva su control remoto de revisiones y conflictos, sin sincronización real mientras no se conecte Supabase. Selector de historial remoto pendiente.
- Almacén local personal del navegador, sin cifrado ni cuentas locales: invitado es compartido en el mismo perfil. Borrar datos del sitio, navegación privada o cambiar origen/puerto/navegador puede eliminar u ocultar el progreso. No hay sincronización con iPhone ni importación automática a cloud.
- Exportación JSON del historial local disponible; no incluye borradores ni audio. Importación pendiente. Error Bank y borrador diagnóstico deben editarse desde una sola pestaña.
- El plan no reprograma fechas. El repaso de errores se considera registrado por destreza/día, no por una prueba de reparación. Historial limitado, fechas/resúmenes UTC y abstención con datos incompletos.
- Sin Supabase gestionado, Auth/Storage y cambios de cuenta entre dispositivos no están validados contra un servicio real. Las cuatro migraciones son preparación futura.
- No hay QA visual/E2E de navegador ni pruebas físicas iPhone realizadas. El smoke HTTP del incremento previo quedó bloqueado por el entorno (`listen EPERM` al abrir 127.0.0.1:3100); no se declara aprobado. Tests de contratos/rutas, lint, TypeScript y build sí pasan.
- La aplicación local debe seguir ejecutándose para entregar/corregir. Sin service worker/offline completo ni iconos Apple completos; no declarar PWA validada.
- Normativa/convocatoria concreta y análisis de muestras siguen pendientes según investigación.

## DECISIONS NEEDED

- Supabase, Vercel y OpenAI siguen sin conectar por instrucción del usuario. No desplegar.
- Antes de conservar audio: acordar finalidad, retención y privacidad. En este incremento solo existe audio efímero del usuario.
- Presupuesto IA pendiente de aclarar: documentos con 45/60 USD frente a propuesta 100/150 USD. No se ha escogido cifra, cambiado límites ni hecho llamadas de pago.

## NEXT STEPS

Completar las cuatro muestras con la guía DIAGNÓSTICO Y PRIMERA SEMANA, registrar tiempo real y recoger observaciones de uso. Validar el flujo en navegador/iPhone físico antes de afirmar compatibilidad completa. Después ampliar contenido/revisión y adaptación con evidencias, manteniendo servicios externos desconectados hasta autorización.

# Estrategia de pruebas y gates

Estado del sexto incremento: **82 pruebas Vitest en 12 archivos**, lint, TypeScript y build de producción pasan localmente. El incremento previo (práctica diaria) se comprobó primero con sus 62 pruebas y los mismos checks. Se conservan las pruebas originales de recuperación Writing; ese editor no se ha rehecho. Son pruebas de dominio, contratos y PostgreSQL embebido, no E2E de navegador ni validación contra servicios externos. No se afirma una nueva ejecución de GitHub Actions sin comprobarla.

Cobertura añadida: corrección Listening por función, asset original y correspondencia de transcripción, cuatro estados diagnósticos, abstención con información parcial, cero asignación automática de SLP aun con repeticiones perfectas, muestras pendientes/recomendaciones concretas, restauración del borrador diagnóstico y aislamiento por identidad, cuota y borrador corrupto, entregas inmutables/reintentos, actividades separadas de muestras, rechazo de campos de audio/niveles, arranque invitado sin construir Supabase, identidad verificada, propietario esperado en API y migración con RLS. Grabador con dobles de MediaRecorder/MediaStream: denegación de permiso, permiso que llega tras desmontar, revocación de URLs/tracks, interrupciones, duración no finita, límite de cinco minutos y error de grabación; no fetch de audio.

Limitaciones: las pruebas de restauración recrean el almacenamiento/adaptador; no simulan un cierre forzoso de Safari. No se ha escuchado/validado pedagógicamente el audio con evaluadores humanos. La comprobación HTTP de la app compilada del incremento previo no pudo abrir un puerto local (`listen EPERM`). No hay QA visual, interacción real con MediaRecorder ni iPhone físico. La matriz siguiente incluye objetivos futuros, no una afirmación de cobertura completa.

| Área | Prueba significativa | Criterio de aceptación |
|---|---|---|
| Auth | Login, expiración, revocación, recuperación, cuenta deshabilitada | No acceso con token inválido; misma identidad entre dispositivos |
| Permisos | Dos usuarios reales de test, IDOR API/SQL/Storage, cambio user_id, admin spoof | Cero lectura/escritura cruzada y claves de examen inaccesibles |
| Sincronización | PC pregunta 7 → iPhone; offline y conflicto Writing; retry duplicado | Respuestas persistidas, conflicto visible, ninguna duplicación |
| Borradores | Cierre forzoso, conexión caída antes/después de ACK | No perder datos confirmados; pendientes señalados |
| Progreso | Pestañas simultáneas, cambio horario/zona, sesión pausada | Sin doble conteo ni streak falso |
| Planner | Semana corta, brechas opuestas, sin historial, listening estable | Respeta carga, mínimos, actividades fijadas y explica cambios |
| Errores | Patrón repetido, falso positivo, evitación de estructura | Dedupe, reversión y estado por oportunidades reales |
| SRS | Reintentos, reloj distinto, pasivo vs activo | Revisiones únicas y no ascenso activo por reconocimiento |
| IA | Schema inválido, cita inventada, prompt injection, audio no evaluable | Rechazo/abstención, nunca nivel inventado |
| Mock | Timer manipulado, ayuda solicitada, API directa, reload, interrupción | Reloj servidor, sin claves ni ayudas, integridad documentada |
| Persistencia | Job se cae tras guardar antes de notificar, lease expira | Resultado exactamente una vez a nivel dominio |
| Voz | Pruebas físicas de SPEAKING.md, subir/ensamblar/reproducir | Audio del alumno correcto, huecos detectados, turnos naturales |
| Privacidad | Borrar audio/sesión/cuenta durante job y tras restore | Derivados eliminados/recalculados, objetos y tombstones coherentes |
| Costes | Dos sesiones simultáneas, timeout proveedor, cuota agotada | Reserva atómica, reconciliación y cierre controlado |
| Contenido | Versiones, clave ambigua, edición durante intento | Histórico inmutable y publicación revisada |
| Accesibilidad | Teclado, foco, lector pantalla, contraste, móvil | Flujos principales operables y estados comprensibles |

Tests unitarios para reglas y transiciones; integración con PostgreSQL/RLS/Storage reales de test; E2E Playwright desktop/WebKit para flujos. WebKit emulado no equivale a Safari iOS físico. Probar APIs con dos identidades, no solo UI. Fixtures deterministas para modelos, evals online separadas y coste limitado.

## Casos SLP mínimos

- Respuesta léxicamente sofisticada pero superficial: no nivel 3 solo por vocabulario.
- Producción larga sin responder tarea: incumplimiento explícito.
- Una sesión 3 entre varias 2+: perfil longitudinal no asciende solo por último resultado.
- Ausencia de tarea abstracta: not_observed, no not_met.
- Pronunciación extranjera inteligible: no penalización automática.
- Transcripción limpia de audio muy defectuoso: abstención en acústica y limitación de evaluación.
- Alumno pide ayudas en Examiner: no se proporcionan; si modelo incumple, integridad degradada.
- Tarea Reading con dos respuestas defendibles: retirar del banco, no culpar al alumno.
- Listening 3 declarado: mostrar separado de estimación comprobada.
- Borrar evidencia determinante: recomputar resultado, no mantener certeza falsa.

Liberación: gates técnicos verdes + revisión de calibración + pruebas físicas + recuperación ensayada + costes medidos. Mantener informe de versión, dispositivo, pasos, esperado, observado y evidencia de fallo. No marcar PASS por diseño escrito.


## Revisión manual pendiente: diagnóstico sin servicios

1. Sin variables Supabase/OpenAI, abrir Hoy y completar Reading/Writing/Listening/Speaking. Verificar teclado, navegación y feedback.
2. Escribir Writing diagnóstico, recargar y cerrar/abrir. Comprobar restauración, entrega cerrada, nueva muestra, descarga y separación respecto a Writing Lab. Probar cuota bloqueada y conservar el texto antes de salir.
3. Escuchar el MP3 completo en Chrome/Firefox/Safari; entregar cinco respuestas y comprobar explicación/transcripción, repetición marcada como repaso e historial tras recarga.
4. Con permiso de micrófono grabar, detener, escuchar y registrar notas. Salir/recargar/descartar debe revocar el audio; confirmar que no se escribe ni se envía un blob. Comprobar interrupción y duración desconocida en dispositivos reales.
5. Registrar minutos una sola vez, volver a Hoy y revisar la razón de la propuesta. Ningún resultado debe ascender el perfil declarado.
6. Antes de futura conexión cloud: verificar dos cuentas reales, cambio de sesión en otra pestaña y navegación atrás sin mostrar borradores de otra identidad. Cualquier fallo de auth debe bloquear, nunca importar invitado.

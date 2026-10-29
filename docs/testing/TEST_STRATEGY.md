# Estrategia de pruebas y gates

Estado del séptimo incremento: **97 tests Vitest en 13 archivos + 12 pruebas de navegador Playwright/Chromium**, con lint, TypeScript y build verdes. [CI verificada del código en 05a6ba4](https://github.com/adrianseguradeorta-prog/Examen-SLP/actions/runs/40956630897). Se mantienen las pruebas originales de Writing Lab y su implementación intacta. PGlite prueba cinco migraciones y RLS en PostgreSQL embebido, no Supabase gestionado.

Las 15 pruebas de dominio/contratos añadidas cubren recuperación Reading/Listening, notas Speaking sin audio, aislamiento por identidad/versión, cuota/datos inválidos, limpieza solo de la copia confirmada, compatibilidad de Writing diagnóstico, catálogo/corrección por versión, exposición persistente tras borrar resultados, reintentos, independencia desconocida/duplicada, rotación y selección diaria, así como protección API/SQL.

Los 12 recorridos de navegador corren contra el servidor de producción: apertura/Hoy/navegación recomendada, Reading con entrega y repetición, cambio de tarea/cierre de pestaña, Listening con reproducción real del MP3 (acelerada), Writing Lab/descarga, Writing diagnóstico por tareas, Speaking con MediaRecorder y dispositivo sintético, denegación simulada de permiso, Error Bank/Plan/actividad/exportación, aislamiento de claves/señal de sesión, cuota simulada y otra pestaña. Se comprueban errores de página, hidratación, respuestas HTTP inesperadas y solicitudes externas. No se detectaron esos errores en los recorridos aprobados.

El arnés usa Python >=3.11, unittest y Playwright 1.62.0 (única dependencia específica de navegador); no cambia el runtime de Next ni requiere Python para estudiar. Ejecutar `python3 -m pip install -r e2e/requirements.txt`, `python3 -m playwright install chromium`, construir sin configuración de servicios con `npm run build` y ejecutar `npm run test:e2e`. CI usa Python 3.12 e instala dependencias de Chromium. El runner rechaza archivos/variables de servicios antes de abrir el servidor. En caso de fallo, CI adjunta log y capturas de fixtures sintéticos durante siete días, sin grabaciones de audio ni vídeo.

Limitaciones: el executor local no puede abrir loopback (`listen EPERM`); `npm run test:e2e` se intentó allí y **no pasó**. La evidencia E2E válida es la ejecución remota de GitHub Actions. Chromium automatizado no equivale a Chrome físico, Safari/WebKit, iPhone, auriculares o llamadas reales. No se ha validado humanamente la calidad pedagógica del audio. Auth cloud, cambios reales de cuenta y sincronización multidispositivo siguen pendientes. Todos los ensayos físicos de [PHYSICAL_QA.md](PHYSICAL_QA.md) permanecen PENDIENTES. La matriz siguiente incluye objetivos futuros, no cobertura ya conseguida.

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

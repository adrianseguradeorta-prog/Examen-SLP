# PROJECT_STATUS

Actualizado: 2026-11-06. Noveno incremento: preparación del piloto local PC/iPhone. Rama `feat/training-foundation`. Sin servicios conectados ni despliegue.

## Noveno incremento — implementado, CI remota pendiente

- Partida comprobada local/remota: `434effed6b42cf091610ee1f64167fa929f4e701`. No se han rehecho perfil, adaptación, SRS, Error Bank, diagnóstico ni copias.
- Lanzador HTTPS LAN en Node sin nuevas dependencias de aplicación: selecciona IPv4 privada real, valida certificado/IP/clave/fecha, mantiene Next en loopback y HTTPS en esa interfaz:3443; rechaza pares públicos/Host/Origin ajenos. Preparación con mkcert, compilación explícita sin servicios, claves/configuración ignoradas por Git. No crea túneles ni abre router/firewall. Inicio habitual limitado a loopback.
- [HTTPS_LOCAL](docs/testing/HTTPS_LOCAL.md): instalación, confianza y retirada de certificados, red, permisos Safari, cambios de origen y límites de almacenamiento independiente PC/iPhone. Instalación en dispositivos del usuario PENDIENTE.
- Corregida sobrescritura de Writing diagnóstico desde otra pestaña: comparación de copia esperada, bloqueo, descarga del texto anterior y recuperación tras recargar. Writing Lab original intacto.
- Correcciones concretas de uso: checkboxes fuera del estilo de inputs de ancho completo; controles táctiles de 44 px, campos de 16 px, límites de desbordamiento, sidebar desplazable, foco visible, salto al contenido y contraste de texto secundario/objetivo. Corregido mensaje obsoleto que afirmaba que no existía restauración.
- Revisión técnica de 3 Reading, 3 Listening, 3 Writing y 4 Speaking/16 prompts: preguntas/claves/explicaciones coherentes; transcripciones iguales a guiones y audios reproducibles con igualdad de PCM decodificado. Sin cambios al banco/versiones. [Auditoría y límites](docs/testing/CONTENT_AUDIT_V1.md); no calibración humana.
- [PILOTO_7_DIAS](docs/testing/PILOTO_7_DIAS.md): 390 minutos orientativos ajustables al perfil, práctica principal PC, datos de prueba iPhone, copias con fecha, restauración aislada y plantilla de incidencias. Todos los ensayos físicos continúan PENDIENTES.
- Validado localmente: lint, TypeScript, **147 tests / 18 archivos**, build. E2E local intentado y bloqueado por `listen EPERM`; no se considera aprobado. Instalación local de WebKit se interrumpió con el entorno offline. CI conserva las 18 E2E anteriores y añade conflicto Writing, 5 WebKit móviles y un ensayo HTTPS con certificado temporal: **25 pruebas configuradas**, ejecución remota pendiente.
- No conexiones Supabase/Vercel/OpenAI, APIs pagadas, despliegue, cuentas nuevas ni conservación de audio. Certificados temporales de pruebas no se publican ni instalan en confianza del sistema.

## Octavo incremento — DONE: publicado y CI remota verde

- HEAD de partida remoto verificado: `199f5f1be029ad134621c72d173768f5bb7c465d`. Se conserva el séptimo incremento y Writing Lab sin rehacerlo.
- Perfil editable y versiones: declarado/objetivo separados, fecha opcional, disponibilidad 30–1.260 min, prioridad, zona horaria y días orientativos. Aislamiento por identidad y confirmación de guardado local.
- Motor puro rules-v1 sin IA: dos últimas muestras independientes de comprensión con dificultad repetida en ocho semanas; transferencia máxima de 20 min desde margen flexible, mínimos conservados, abstención e historial intacto. No nivel inferido por porcentajes/minutos.
- Propuestas semanales explicadas con razones/evidencia, aceptar/rechazar/revertir, versión anterior e invalidación por perfil/plan/semana. No reprograma las 36 semanas ni comprime deuda.
- Hoy integra diagnóstico pendiente, reparación recurrente, SRS vencido, dificultad repetida y reparto/rotación; limita la sesión al tiempo disponible. Resumen semanal: actividad/minutos declarados, cobertura, independencia, errores y revisiones.
- Vocabulario/SRS funcional, 1/3/7/14/30, historial conservado, reconocimiento/producción separados y ayuda explícita. Error Bank → tarjeta solo por decisión y validación manual; transferencia a tarea. Nunca marca dominio automático.
- Backup completo versionado de identidad, con borradores/exposiciones y sin audio/credenciales. Validación estricta, 5 MiB, vista previa, reemplazo confirmado, rollback/recuperación por diario y borrado selectivo sin `localStorage.clear()`. Otras identidades quedan intactas.
- **Validación local:** lint y TypeScript sin errores; **136 tests Vitest / 16 archivos**; build producción; **18 E2E Chromium**, manteniendo las 12 anteriores. Pruebas con micrófono simulado, no QA físico. Restricción de puerto local resuelta mediante permiso de red del proceso de pruebas; guard sin servicios intacto.
- Guías: [MI SEMANA ADAPTADA](docs/product/MI_SEMANA_ADAPTADA.md), [COPIA DE SEGURIDAD](docs/product/COPIA_DE_SEGURIDAD.md), [arquitectura local](docs/architecture/LOCAL_ADAPTATION.md). Documentación de conexión actualizada sin conectar nada.
- Publicado en `25eda84fcc18e632732a251d597c3fcfaf133e70` mediante cuatro commits lógicos. Árboles remotos comparados con los validados localmente: coinciden. Rama local/remota alineada sin force push ni cambios a main.
- **CI remota verde:** [ejecución 41831824649](https://github.com/adrianseguradeorta-prog/Examen-SLP/actions/runs/41831824649), sobre ese SHA: npm ci, lint, TypeScript, **136 tests / 16 archivos**, build y **18 E2E** completados con éxito. Esta actualización documental registra la evidencia; no cambia código de aplicación.

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
- 97 tests Vitest en 13 archivos (82 del incremento anterior y 15 nuevas pruebas): persistencia/restauración, identidades, cuota, entrega inmutable, Listening, estados/abstención, ausencia de niveles, actividades, selección diaria, permisos y migraciones PGlite. Grabación probada con dispositivos simulados: denegación, permisos tardíos, interrupciones, duración desconocida, límite temporal, fallo y liberación de recursos.
- Se conservan las pruebas originales de Writing. No se han introducido llamadas de pago, WebRTC IA ni servicios externos.
- Práctica diaria publicada primero en `9ecd7d1a2fa5c0023d3c08871f305d07900488ec` y CI remota verde antes de publicar el diagnóstico: [ejecución 40918524288](https://github.com/adrianseguradeorta-prog/Examen-SLP/actions/runs/40918524288).
- Diagnóstico/Listening publicados en `430a2a553ea27fda76abefd6f5066604dd5f64cf`; CI remota verde: [ejecución 40918994011](https://github.com/adrianseguradeorta-prog/Examen-SLP/actions/runs/40918994011). Se verificaron `npm ci`, lint, TypeScript, tests y build en GitHub Actions, además de localmente.
- Publicación mediante conector GitHub ante bloqueo del transporte Git del entorno. Los árboles de archivos de cada commit remoto se compararon con los validados localmente; coinciden exactamente. Rama local y remota alineadas, sin force push, merge a main ni despliegue.

### Uso frecuente: implementado y verificado

- Borradores de Reading/Listening guardados al seleccionar respuestas y recuperados por identidad/tarea tras recarga, cambio de ruta o reapertura. Entrega confirmada retira solo su copia pendiente; cuota/datos inválidos/cambio en otra pestaña no se anuncian como guardado.
- Notas Speaking y ayuda declarada recuperables; grabaciones y duración temporal siguen efímeras. Tras recargar se exige otra grabación antes de entregar.
- Writing Lab intacto; Writing diagnóstico añade tres tareas con borradores separados conservando la clave original.
- Banco versionado: 3 Reading, 3 Listening originales con audio, 3 Writing diagnósticos y 4 tareas Speaking/16 prompts reutilizando contenido existente. Biblioteca y Writing Lab siguen disponibles como práctica adicional.
- Apertura y soluciones conocidas registradas por identidad/tarea, separadas de las entregas. Las exposiciones sobreviven al borrado de resultados; repeticiones y datos antiguos no aumentan la evidencia independiente. Máximo una primera muestra por versión; ninguna estimación SLP.
- Hoy continúa material abierto o propone tareas nuevas dentro del reparto de minutos. Incluye orientación para la primera semana y mantiene el plan provisional/abstención.
- Quinta migración preparada para nuevas versiones/exposiciones, no aplicada a cloud. Independencia cloud se mantiene desconocida hasta implementar transacción/sincronización verificadas.
- Suite Playwright/Chromium contra producción: 12 pruebas de navegador pasan en GitHub Actions, con Python unittest, sin servicios externos y con micrófono simulado. Cubren Hoy/navegación, Reading, Writing Lab/diagnóstico, Listening, Speaking simulado, Error Bank, plan, actividad, exportación, recarga, cierre de pestaña, cambios de ruta, aislamiento de claves, cuota y edición en otra pestaña. No se detectaron errores de hidratación en estos recorridos. No acredita dispositivos físicos.
- Procedimiento físico PC/iPhone en docs/testing/PHYSICAL_QA.md; **todos los ensayos físicos PENDIENTES**.

- CI remota del séptimo incremento: `05a6ba48a4a3e59c1729122ee8ca5ac3a1a80e75`, [ejecución 40956630897](https://github.com/adrianseguradeorta-prog/Examen-SLP/actions/runs/40956630897). Instalación, lint, TypeScript, 97 tests, build y 12 E2E pasan. La primera ejecución detectó dos errores del arnés de pruebas (desplegable cerrado y simulación de cuota); se corrigieron y se repitió toda la suite, sin saltar pruebas.

## IN PROGRESS

- Base de práctica utilizable y recogida inicial de muestras. Aún no es una plataforma completa ni un diagnóstico SLP validado para nueve meses.

## TODO

- Revisión de uso en navegador e iPhone físicos, permisos, reproducción MP3 y grabación/recuperación tras interrupciones reales.
- Banco editorial amplio, revisión humana de materiales y calibración con evidencias oficiales cuando estén disponibles y sean utilizables legalmente.
- Evaluadores Writing/Speaking, estimación longitudinal, adaptación validada más amplia, mocks e informes. Perfil, reglas locales y SRS v1 operativos.
- Sincronización cloud y exportación/borrado de cuenta. Copias/restauración y borrado local ya operativos; backups cloud y migración de entidades nuevas pendientes.
- Conversación IA y reconexión solo en un incremento autorizado; almacenamiento de audio requiere decisión posterior expresa.
- PWA/offline completo y administración editorial.

## KNOWN ISSUES

- **No se asigna SLP**: Reading/Listening son tareas breves no calibradas; Writing queda pendiente de revisión y Speaking no conserva audio revisable. Un resultado perfecto no prueba nivel 3.
- Listening dispone de tres anuncios cortos y una sola voz sintética; no representa diversidad de acentos, conversación ni comprensión sostenida. Repetirlo es repaso.
- Reading/Listening sin entregar y notas Speaking sin registrar ahora se guardan por tarea/identidad en el navegador. No se guarda la posición del reproductor; al volver se exige escucharlo de nuevo. El audio oral se pierde al salir/recargar por diseño. Navegadores con duración no finita o interrupción muestran duración no disponible.
- Writing diagnóstico bloquea ediciones detectadas en otra pestaña y conserva el texto para descargar; no fusiona copias simultáneas. Un aviso de cuota/bloqueo exige descargar una copia. Borrar una muestra cerrada del historial no elimina silenciosamente su copia aún visible en el editor.
- Writing Lab conserva su control remoto de revisiones y conflictos, sin sincronización real mientras no se conecte Supabase. Selector de historial remoto pendiente.
- Almacén local personal del navegador, sin cifrado ni cuentas locales: invitado es compartido en el mismo perfil. Borrar datos del sitio, navegación privada o cambiar origen/puerto/navegador puede eliminar u ocultar el progreso. No hay sincronización con iPhone ni importación automática a cloud.
- Copia completa con borradores disponible en Perfil y copias; el JSON antiguo de Hoy sigue siendo parcial y no importable. Copias sin cifrar, máximo 5 MiB, misma identidad y reemplazo, no merge. Cerrar otras pestañas al restaurar/borrar; quota/corrupción pueden bloquear recuperación y requieren conservar una copia externa. Error Bank y borrador diagnóstico se editan desde una pestaña.
- El plan no reprograma fechas; días habituales orientativos. Perfil/Hoy/actividad nuevos usan zona elegida; entregas históricas conservan UTC. Adaptación conservadora con umbral de 50 muestras/1.000 actividades; futuro soporte longitudinal/paginación pendiente. Reconocimiento y uso son declarados, no verificados.
- Sin Supabase gestionado, Auth/Storage y cambios de cuenta entre dispositivos no están validados contra un servicio real. Las cinco migraciones son preparación futura.
- Las pruebas físicas siguen pendientes. Las 18 E2E Chromium pasan ahora localmente con permiso para el puerto; los bloqueos EPERM de intentos anteriores no se confunden con pruebas aprobadas. CI remota del octavo incremento verificada y enlazada arriba.
- La aplicación local debe seguir ejecutándose para entregar/corregir. Sin service worker/offline completo ni iconos Apple completos; no declarar PWA validada.
- Normativa/convocatoria concreta y análisis de muestras siguen pendientes según investigación.

## DECISIONS NEEDED

- Supabase, Vercel y OpenAI siguen sin conectar por instrucción del usuario. No desplegar.
- Antes de conservar audio: acordar finalidad, retención y privacidad. En este incremento solo existe audio efímero del usuario.
- Presupuesto IA pendiente de aclarar: documentos con 45/60 USD frente a propuesta 100/150 USD. No se ha escogido cifra, cambiado límites ni hecho llamadas de pago.

## NEXT STEPS

Siguiente incremento prioritario: ejecutar el piloto preparado con PC/iPhone físicos, recoger incidencias y corregir los fallos reproducibles antes de integrar servicios. Mantener QA físico pendiente hasta disponer de evidencias. Presupuesto IA y conservación de audio siguen sin decidir.

## PROGRESO ORIENTATIVO DEL PROYECTO

Estimación manual de alcance y madurez; no se calcula por líneas de código, número de tests ni progreso lingüístico. Las barras son aproximaciones para planificación, no criterios de aceptación.

| Área | Progreso orientativo | Trabajo pendiente principal |
|---|---|---|
| Incremento actual | █████████░ 90 % | Preparación implementada; CI remota y publicación por verificar, piloto físico pendiente |
| Práctica local y UX | ████████░░ 80 % | Uso sostenido y accesibilidad |
| Contenido y administración | ██░░░░░░░░ 20 % | Banco amplio y revisión editorial |
| Cloud, sincronización y seguridad | ██░░░░░░░░ 20 % | Auth real, permisos, conflictos y operación |
| Voz conversacional IA | █░░░░░░░░░ 10 % | Conversación, reconexión, latencia y cuotas |
| Evaluación y calibración | █░░░░░░░░░ 10 % | Revisión cualificada y evidencias longitudinales |
| Adaptación y SRS | ██████░░░░ 60 % | Validación pedagógica, retención, sincronización y límites de historial |
| Simulacros e informes | █░░░░░░░░░ 10 % | Mocks completos y reportes periódicos |
| QA, PWA y operación | █████░░░░░ 45 % | Dispositivos físicos, Safari, offline y operación productiva |
| Aplicación completa | ████░░░░░░ ≈35 % | Voz, evaluación fiable y sincronización siguen siendo las mayores incertidumbres |

Estimación manual conservadora de alcance, no métrica calculada ni avance lingüístico. Esfuerzo técnico restante: **400–680 horas / 10–17 semanas** a tiempo completo, más revisión de especialistas para calibración. No es fecha comprometida; depende de autorización futura de servicios y pruebas físicas. No incluye app nativa. No se ha realizado gasto de IA ni cambiado el presupuesto.

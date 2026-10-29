# QA físico PC / iPhone

**Todos los ensayos físicos están PENDIENTES.** Codex no ha utilizado un PC de usuario ni un iPhone físico. Playwright/Chromium automatizado y su micrófono sintético no acreditan permisos, auriculares, interrupciones de iOS, calidad de captura ni uso real de Safari.

## Preparación y registro

1. Descargar la rama `feat/training-foundation` y anotar el SHA probado, fecha, persona, dispositivo, sistema operativo y versión exacta del navegador. Usar notas/textos de prueba, sin información sensible.
2. En PC, con Node.js 24: `npm ci`, después `npm run dev`. Dejar la terminal abierta. Abrir `http://localhost:3000`. No configurar Supabase, Vercel u OpenAI. Usar siempre el mismo origen/puerto y un perfil normal, no incógnito.
3. Para iPhone se necesita **una dirección HTTPS local de la app con certificado confiable en Safari**, accesible desde la misma red. `localhost` en el teléfono no apunta al PC. Una IP doméstica con HTTP no habilita correctamente las APIs seguras de micrófono/identificadores. Aún no se proporciona ni se ha validado ese acceso: prepararlo en una sesión de QA local con certificado de confianza, sin despliegue ni servicios cloud. Hasta disponer de él, mantener los ensayos iPhone como PENDIENTES. No declarar un rechazo por origen inseguro como prueba de que el grabador falla en HTTPS.
4. El almacenamiento de la dirección HTTPS del teléfono será distinto del `localhost` del ordenador. No se espera sincronización. Crear muestras de prueba por separado.
5. Marcar PASS solo después de ejecutar todos los pasos de la fila y observar el resultado. Marcar FAIL si falla y anotar pasos, mensajes, hora, versión y si se pudo recuperar el trabajo. Si no se pudo ejecutar, mantener PENDIENTE y explicar el motivo. No adjuntar grabaciones personales.

Registro: SHA ______ · fecha ______ · persona ______ · dispositivo/SO ______ · navegador/versión ______ · URL/origen ______ · auriculares ______.

## Desktop

| Ensayo y procedimiento | Resultado esperado | Estado: PENDIENTE / PASS / FAIL | Observaciones |
|---|---|---|---|
| Chrome: abrir Hoy, seguir «Empezar este ejercicio», ir a Plan y volver | Navegación sin pantalla vacía ni errores visibles; tarea identificable | PENDIENTE | No ejecutado físicamente |
| Safari macOS, cuando esté disponible: repetir la navegación anterior | Mismo flujo utilizable; anotar versión | PENDIENTE | No ejecutado físicamente |
| Reading: elegir dos respuestas, recargar, cambiar de ruta, volver; después cerrar y reabrir | Respuestas y tarea recuperadas; entregar conserva resultado y retira borrador | PENDIENTE | No ejecutado físicamente |
| Listening: escuchar cada uno de los tres audios con altavoces; pausar y repetir | Voz inteligible, audio completo, sin cortes; corrección tras entregar | PENDIENTE | Revisar también naturalidad/calidad editorial |
| Listening: marcar respuestas, recargar | Respuestas restauradas; reproducción comienza de nuevo y exige llegar al final antes de entregar | PENDIENTE | No se recupera posición del reproductor |
| Writing Lab: escribir, recargar, cerrar/reabrir, descargar copia | Texto idéntico, copia descargable, sin dependencia cloud | PENDIENTE | No ejecutado físicamente |
| Writing diagnóstico: escribir en dos tareas distintas, alternar, entregar una y recargar | Borradores separados; muestra entregada cerrada, otra pendiente intacta | PENDIENTE | No ejecutado físicamente |
| Micrófono: denegar permiso, recuperar permiso en el navegador y volver a grabar | Error comprensible, notas conservadas, posible reintento | PENDIENTE | No ejecutado físicamente |
| Speaking: grabar 30–60 s, detener, escuchar con altavoces y auriculares | Audio audible; duración solo si fiable; registrar notas sin conservar audio | PENDIENTE | No comparar micrófono físico con simulación |
| Speaking: escribir notas, recargar y cerrar/reabrir antes de entregar | Notas recuperadas; audio ausente; exige nueva grabación para entregar | PENDIENTE | No ejecutado físicamente |
| Dos pestañas: editar Reading/Listening en la segunda y volver a la primera | Primera bloquea la copia antigua y pide recargar; no pisa respuestas | PENDIENTE | Writing diagnóstico sigue recomendado en una pestaña |
| Error Bank/Plan: guardar observación, plan y actividad, recargar | Registros conservados y minutos no duplicados | PENDIENTE | No ejecutado físicamente |
| Exportar historial desde Hoy y texto desde Writing | Descargas legibles; el JSON no contiene audio ni borradores pendientes | PENDIENTE | No hay importación todavía |

## iPhone / Safari

| Ensayo y procedimiento | Resultado esperado | Estado: PENDIENTE / PASS / FAIL | Observaciones |
|---|---|---|---|
| Abrir URL HTTPS local confiable en Safari | Hoy y formularios utilizables; sin advertencia de origen inseguro | PENDIENTE | Acceso HTTPS local aún por preparar |
| Reading/Listening: responder, recargar, ir a Hoy y volver | Respuestas pendientes recuperadas en el mismo origen | PENDIENTE | No ejecutado físicamente |
| Writing: escribir en ambos editores, cerrar pestaña, reabrir URL | Texto recuperado; mensajes de guardado coherentes | PENDIENTE | Probar también cierre de Safari desde selector de apps |
| Permiso de micrófono: denegar y conceder desde Safari/Ajustes | Sin pérdida de notas; mensaje y reintento utilizables | PENDIENTE | No ejecutado físicamente |
| Grabar, detener y reproducir una respuesta | Audio audible y botón de registro funcional; no evaluación automática | PENDIENTE | Anotar duración disponible/no disponible |
| Escuchar los tres Listening, pausar y repetir | Audio completo y controles táctiles funcionales | PENDIENTE | No ejecutado físicamente |
| Auriculares usados habitualmente: conectar antes de grabar y escuchar | Entrada/salida esperadas, sin eco excesivo; anotar modelo/conexión | PENDIENTE | Probar Bluetooth/cable solo si se dispone de ellos |
| Girar vertical/horizontal con respuesta pendiente | Controles y texto visibles; respuestas conservadas | PENDIENTE | No ejecutado físicamente |
| Durante Speaking: bloquear pantalla, volver; cambiar de app; interrupción de llamada si es viable | Interrupción indicada o duración no atribuida; no presentar audio incompleto como captura normal | PENDIENTE | No provocar llamadas ni enviar mensajes desde Codex |
| Recargar después de grabar sin entregar | Audio desaparece; notas guardadas sobreviven; grabar de nuevo para entregar | PENDIENTE | Audio efímero por diseño |
| Cerrar/reabrir Safari después de entregar | Muestra/notas/resultado persisten; voz anterior no se puede recuperar | PENDIENTE | No ejecutado físicamente |
| Añadir a inicio, si Safari lo permite; abrir desde icono y repetir recuperación | Registrar si el origen/almacén se comparte; no asumirlo | PENDIENTE | Manifest inicial; PWA/offline completo no implementados |
| Intentar volver a la app con el servidor local apagado | Documentar límite: no se promete carga offline ni corrección sin servidor | PENDIENTE | No borrar almacenamiento como parte del ensayo |

## Ante un fallo

Dejar la pestaña abierta si aún contiene texto no confirmado. Descargar Writing o copiar respuestas/notas antes de tocar los datos del sitio. No borrar almacenamiento ni alternar orígenes para intentar recuperar una copia. Registrar el fallo y el SHA, repetir con texto de prueba y corregir antes de marcar PASS. La evidencia física se añadirá a esta tabla solo después de recibir resultados reales.

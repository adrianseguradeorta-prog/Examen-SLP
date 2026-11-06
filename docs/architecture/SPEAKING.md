# Speaking Lab y viabilidad iPhone

## Ruta recomendada para el spike

WebRTC audio bidireccional entre navegador y OpenAI Realtime; backend autentica, reserva presupuesto y configura sesión por modo mediante interfaz unificada SDP o credencial efímera. No es micrófono → STT → respuesta escrita. Modelo de voz oye audio y responde con audio; transcripción auxiliar y evaluación posterior tienen responsabilidades distintas. Fuentes T01–T03.

Comparar `gpt-realtime-2.1` y `gpt-realtime-2.1-mini` con las mismas tareas; modelo pequeño candidato Teacher, completo candidato Examiner. No asumir que uno evalúa mejor por precio. Incluir GPT-Live en benchmark si su modalidad delegada aporta turnos mejores. Gemini Live es alternativa real; pipeline STT/LLM/TTS es fallback de práctica con degradación visible, no satisface por sí solo aceptación de Speaking natural.

## Sesión y modos

Estado `preflight → connecting → active → reconnecting/interrupted → uploading → evaluating → reviewed`, con error recuperable. Preflight: HTTPS, permiso solicitado tras pulsación, test de nivel de micrófono, salida y auriculares, disponibilidad de red/cuota y consentimiento.

Teacher: seleccionar una función objetivo, dejar desarrollar respuesta, feedback después de turno completo o bloque acordado. Corregir uno/dos aspectos prioritarios, pedir reformulación y transferencia a tema nuevo. Puede enseñar; toda intervención asistida queda marcada y no eleva estimación longitudinal.

Examiner: warm-up, comprobar desempeño de nivel base, profundizar según contenido del usuario, explorar funciones superiores, cambiar contexto y cerrar. Una pregunta por turno. Sin traducción, corrección, ejemplos modelo, completar frases ni vocabulario. Pedir aclaración para obtener evidencia es admisible; ofrecer solución no. Agenda de cobertura es privada, no lista rígida recitada. No evaluar opiniones políticas o conocimientos de defensa, sino desempeño lingüístico.

Challenging: mismo contrato, mayor profundidad. Extraer afirmación del usuario y plantear una objeción pertinente, cambiar condición o pedir consecuencias. Máximo dos follow-ups intensivos seguidos como regla inicial; alternar temas para evitar convertir la prueba en interrogatorio de conocimientos. Respetuoso, dificultad adaptada a evidencia, no agresión.

Ejemplo original de rama: afirmación sobre sistemas autónomos → responsabilidad en error → cambio entre entrenamiento y conflicto → comparación con error humano → reformulación de límites de la propia postura. El modelo elige rama a partir de lo realmente dicho, conserva IDs de turnos y no atribuye al usuario argumentos ausentes.

## Grabación y evaluación

Capturar pista del alumno por separado de salida del examinador para no medir WPM del modelo. MediaRecorder y MIME detectado en ejecución; no asumir AAC/webm universal. Chunks secuenciados con hash y timestamps monotónicos; conservar cabecera/inicialización y ensamblar/transcodificar en servidor: un fragmento no es necesariamente reproducible por sí solo. Subidas confirmadas al Storage privado; índice de segmentos persistido.

Persistir eventos y transcripción provisional, luego versión revisada alineada con audio. Timestamps del proveedor y límites de turnos no equivalen a alineación exacta por palabra. Reproducción de frase usa offsets verificados; si no hay alineación fiable, reproducir turno y etiquetar precisión aproximada. No fabricar marcas temporales.

WPM = palabras del alumno / tiempo definido (tiempo total de intervención y tiempo de voz como métricas distintas). Pausas/fillers requieren audio/VAD y transcripción que no los suprima; documentar sensibilidad y confianza. Autocorrecciones y patrones lingüísticos a partir de evidencia. Pronunciación y prosodia requieren análisis de audio especializado/humano; una transcripción correcta no prueba pronunciación correcta. Si evaluador de texto no acepta audio, devolver `not_observed` en esos criterios. Estructuras evitadas son hipótesis basadas en oportunidades, nunca hecho por ausencia en una sesión.

Supervisor servidor conserva instrucciones, cobertura y cierre; un prompt del cliente no es barrera de seguridad. No enviar al cliente herramientas de ayuda en Examiner. Modelo puede incumplir: registrar violaciones y marcar tarea asistida/inválida, no prometer prevención perfecta por prompt.

## iPhone: problemas, impacto y mitigación

| Problema / estado de conocimiento | Impacto | Workaround propuesto | Beneficio de app nativa |
|---|---|---|---|
| Permisos y autoplay, confirmado por plataforma | Audio puede no comenzar | Inicio explícito, test y reintento guiado; HTTPS | Control de sesión de audio más directo |
| Background/bloqueo: comportamiento dependiente de versión; incidencia histórica T09 no prueba universal | Captura/conexión puede suspenderse | Sesión en foreground, aviso claro, guardar chunks continuamente, detectar visibility/track mute/ended | Audio session/background modes más controlables, sujeto a iOS |
| Llamada, Siri, cambio de auriculares | Ruta o micrófono interrumpidos | Escuchar cambios, comprobar señal, reacquirir con gesto y nuevo segmento | Integración con interrupciones y rutas nativas |
| Wi-Fi ↔ datos móviles | ICE desconectado, pérdida de turnos | Estado visible, reconexión acotada, nuevo peer si preciso; no puntuar hueco como silencio lingüístico | Mejor observabilidad; red sigue pudiendo fallar |
| Cache expulsada o cierre forzoso | Draft/chunk no sincronizado puede perderse | Confirmar cloud, outbox y aviso de pendientes; no confiar en background sync | Almacenamiento más controlable |
| Codecs/MediaRecorder | Archivo no reproducible o duración incorrecta | Feature detection, ensamblado y prueba de reproducción en ambos dispositivos | Captura/transcodificación más predecible |
| Safari y PWA instalada difieren | Sesión/auth/audio pueden comportarse distinto | Probar ambos; mismo usuario en backend sin asumir cookies compartidas | Un cliente nativo reduce variación de navegador |

Manifest, iconos y shell cacheado; service worker no cachea APIs privadas, claves de examen o respuestas de audio firmadas por defecto. Screen Wake Lock solo si está disponible y autorizado; no garantiza actividad en segundo plano. Mantener interfaz accesible al reconectar. Interrumpir mock conserva evidencia pero altera integridad.

## Prueba física obligatoria posterior

**No realizada en esta fase: no hay app ni dispositivo iPhone disponible.** Probar iPhone del usuario (modelo/iOS registrados), otro iPhone si posible, Safari/PWA, auricular Bluetooth/cable/sin auricular, iPad y desktop Safari/Chrome. Registrar versión, red, permiso, duración, salida, evento, latencia y pérdidas.

Escenarios: 30 min entrevista; interrupción del modelo por usuario; pausa larga del alumno; negación/revocación permiso; bloqueo 30 s; llamada entrante; Siri; Bluetooth desconectado; Wi-Fi/datos; modo avión; recarga; cierre forzoso; subir chunks con timeout; sesión token caducado; cuota agotada. Umbral de producto a validar: mediana respuesta audible <1.5 s y p95 <3 s en red estable, sin cortes sistemáticos de frases; no son promesas del proveedor. Cero pérdida de chunks con ACK; localizar y comunicar cualquier hueco. Si falla foreground de forma recurrente, revisar proveedor/transporte antes de app nativa; si falla requisito de background imprescindible, pedir decisión de alcance.

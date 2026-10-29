# Entrega ejecutiva — investigación y diseño inicial

Fecha: 2026-10-28. Repositorio oficial clonado y vacío al inicio. Esta entrega contiene documentación y decisiones propuestas; no contiene aplicación, despliegue, calibración empírica ni prueba física de iPhone.

## SLP

Nivel 3 exige desempeño sostenido de funciones complejas, no vocabulario llamativo. Entrenaremos argumentación, hipótesis, objeciones y discurso extenso; comprensión implícita y postura del autor/hablante; escritos desarrollados y coherentes. Las cuatro destrezas se valoran por separado. El salto de 2+ a 3 requiere consistencia. Base: [ATrainP-5](https://natobilc.org/wp-content/uploads/2024/11/ATrainP-5-EDA-V2-E.pdf) y [criterios BILC](https://www.natobilc.org/documents/LanguageTesting/STANAG%206001%20Speaking%20Assessment%20Criteria.pdf).

## Prueba española y fuentes

Localizadas OM 2/2022 e Instrucción 60/2022 en publicaciones oficiales BOD. Se han distinguido de borradores de consulta y de normativa Guardia Civil. No se ha verificado íntegramente toda modificación ni la convocatoria específica: tiempos, ítems, extensión de Writing y reglas de reproducción siguen abiertos. No incorporar números de academias o pruebas extranjeras como requisitos españoles.

BILC publica referencias orales de 2 (Sung), 2+ (Omar) y 3 (Mildred), además de muestras escritas. Identificadas, no analizadas acústicamente ni usadas para calibrar todavía. Ejemplos de Ludovika y Macedonia son útiles como material público de referencia, no réplicas españolas. Registro de acceso, enlaces y decisiones en [fuentes](../research/SOURCES.md).

## Arquitectura y stack

Propuesta: Next.js + React + TypeScript, Supabase PostgreSQL/Auth/Storage y Vercel. API versionada y dominio independiente de React para permitir nativa después. Base central para datos; Storage privado para audio. GitHub solo código y documentación. Jobs durables y supervisor de voz; validar si hosting basta o hace falta proceso persistente antes de contratar otro servicio.

## Database y sincronización

Esquema relacional con usuario, planes/versiones, actividades/intentos, respuestas, sesiones/turnos/audio, escritos/versiones, evaluaciones/evidencias, errores/ocurrencias, vocabulario/revisiones, mocks, snapshots e informes. Permisos por usuario y referencias consistentes. Reintentos idempotentes, revisiones optimistas, outbox local temporal y conflicto visible; no localStorage como verdad. Un dispositivo muestra lo confirmado en servidor por otro. Audio con chunks y ACK, recuperación con huecos explícitos.

## IA y Speaking

Teacher, Examiner, evaluadores, planner, generador, analizador de errores y de progreso tienen contratos separados. Teacher enseña después de permitir responder; Examiner no ayuda; Challenging introduce objeciones pertinentes según respuesta. Voz bidireccional WebRTC con OpenAI Realtime, comparar alternativas actuales durante spike. Evaluación posterior independiente con evidencia verificable y abstención; no convertir transcripción en diagnóstico de pronunciación.

## iPhone

PWA técnicamente viable para foreground mediante WebRTC, captura autorizada y grabación con formatos detectados. Bloqueo, llamadas, Bluetooth y cambios de red requieren pruebas físicas. No garantizar conversación en segundo plano ni ausencia de pérdida de datos aún no sincronizados. No se han hecho pruebas reales en esta fase documental. Nativa solo si un problema medido justifica su coste.

## Aprendizaje y evaluación

Plan 36 semanas, 390 min iniciales/semana: Speaking 180, Writing 80, Reading 60, Listening 40, revisión 30. Adaptación por brechas y oportunidades, no porcentajes globales. Error Bank distingue repetición de error y control demostrado; vocabulario reconocido no equivale a uso espontáneo. Una sesión buena no asciende el perfil. Mínimos longitudinales propuestos están pendientes de pilotaje; no son norma BILC.

## Costes y riesgos

Estimación $60–130/mes sin impuestos ni calibración humana, para ~520 min de voz/mes. Objetivo recomendado $100 y techo operativo $150, pendientes de aprobación. Nueve meses ~$540–1,170 bajo los mismos supuestos. [Cálculos y límites](../deployment/COSTS_AND_DELIVERY.md).

Riesgos prioritarios: falsos 3, corpus insuficiente, fuga de ayudas durante examen, errores ASR, interrupciones iOS, cambios de API/precios, duración de sideband y pérdida/conflicto de datos. Cada uno tiene pruebas/mitigaciones diseñadas; ninguno queda resuelto solo por documentarlo.

## Decisiones a aprobar

1. Stack y servicios propuestos, con spike de voz antes del desarrollo extenso.
2. Presupuesto objetivo/techo y eventual coste separado de revisión humana.
3. Retención de audio 90 días con evidencias seleccionadas conservadas, o todos los audios durante nueve meses; historial propuesto 12 meses y región UE preferida con límites del proveedor IA.
4. Evaluación conservadora y validación humana antes de afirmar nivel 3 fiable.
5. Simulacros etiquetados como entrenamiento hasta disponer de convocatoria verificada.

Información posterior necesaria: fecha de examen, convocatoria/organismo y versión/modelo iPhone para probar. No bloquear diseño por decisiones menores.

## Roadmap

Cerrar fuentes pendientes → aprobar PRD/arquitectura/datos/IA → UX y spike físico de voz → cuenta/sincronización/diagnóstico/plan → Speaking completo → adaptación y labs → mocks → analytics/admin/contenido → calibración y pruebas → staging/restore → producción → piloto PC/iPhone. No iniciar implementación principal sin aprobación del usuario.

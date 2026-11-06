# Piloto de siete días — Examen-SLP

**Objetivo:** comprobar que puedes estudiar de forma regular y recuperar tu trabajo. No validar ni certificar un SLP. El progreso principal permanece en PC; el iPhone se usa inicialmente con datos de prueba. Todos los ensayos físicos siguen **PENDIENTES** hasta que el usuario registre resultados reales.

## Preparación (antes del día 1)

1. Usa la rama `feat/training-foundation`. Anota el commit con `git rev-parse --short HEAD`, si tienes Git; si descargaste ZIP, anota el SHA mostrado en GitHub.
2. Con Node.js 24, en la carpeta del proyecto: `npm ci` (primera vez), después `npm run dev`. Abre **http://localhost:3000** en tu navegador habitual. Mantén la terminal abierta. No configures servicios ni claves.
3. Abre **Perfil y copias**, confirma disponibilidad, zona horaria, niveles declarados y prioridad. Si no tienes examen fechado, déjalo vacío. Guarda y recarga para comprobar que se conserva.
4. Exporta una **copia completa** antes de cualquier prueba. Renombra el archivo, por ejemplo `slp-antes-piloto-2026-11-06.json`, y guárdalo fuera del repositorio. No borres tu copia anterior.
5. Para iPhone, sigue [HTTPS_LOCAL.md](HTTPS_LOCAL.md). No asumas que HTTP con la IP del PC permite usar el micrófono. Preparación del certificado y pruebas físicas: PENDIENTES.

## Tiempo de práctica

La tabla es una propuesta de **390 minutos (6 h 30 min)**, compatible con la configuración inicial: Speaking 180, Writing 80, Reading 60, Listening 40 y repaso 30. No añadas ese tiempo encima de lo que ya propone Hoy. Usa las actividades de la tabla como contenido para el bloque recomendado.

Si tu perfil tiene menos tiempo, reduce los bloques proporcionalmente y reparte el diagnóstico entre más días. Si solo dispones de 30 minutos esa semana, no intentes completar un diagnóstico de 45–50 minutos en ese presupuesto. No recuperes deuda ni aumentes horas por una prueba pendiente. Una semana aceptada en Plan tiene prioridad sobre esta tabla orientativa.

La instalación, las comprobaciones técnicas y escribir incidencias **no cuentan como entrenamiento lingüístico**. Puedes dividir cada día en dos sesiones. Al terminar registra minutos realmente practicados una sola vez, en Hoy o Plan; el repaso/SRS se atribuye a la destreza trabajada, sin añadirlo de nuevo como otra actividad.

| Día | Práctica lingüística orientativa | Minutos | Comprobación física (PENDIENTE) |
|---|---|---:|---|
| 1 | Diagnóstico inicial: Reading 10, Writing 20, Listening 10, Speaking 15. Si ya lo completaste, usa una tarea nueva; no repitas para fabricar evidencia. | 55 | Guarda Writing a mitad, recarga y comprueba el texto. Exporta copia después. |
| 2 | Speaking: tecnología, desarrollar una postura y responder a objeciones 30. Reading: segunda tarea con justificación de respuestas 20. Error Bank/SRS 5. | 55 | Cierra y reabre la pestaña con respuestas Reading sin entregar. Comprueba recuperación antes de entregar. |
| 3 | Speaking: energía y consecuencias hipotéticas 30. Writing: segunda tarea 20. Listening: segundo audio 10. Repaso 5. | 65 | Desde iPhone con HTTPS confiable: permite micrófono, graba, escucha y descarta usando notas de prueba. No se transfiere progreso al PC. |
| 4 | Speaking: liderazgo y trabajo flexible 30. Reading: tercera tarea 15. SRS 5. | 50 | Comprueba controles táctiles, teclado y orientación en iPhone; registra cualquier desplazamiento o botón inaccesible. |
| 5 | Speaking: nueva respuesta sobre tecnología 30. Writing: tercera tarea 20. Listening: tercer audio 10. Error Bank/SRS 5. | 65 | Prueba auriculares y pausa/reproducción. Guarda notas antes de probar una interrupción; audio efímero, sin promesa de captura en segundo plano. |
| 6 | Speaking: repetir tema comunitario con otro argumento 30. Reading: repasar inferencias 15. Listening: repasar un audio 10. SRS 5. | 60 | Prueba una copia en un **perfil de navegador de prueba**, no sobre el progreso principal. Exporta primero lo que haya en ese perfil. |
| 7 | Speaking: explicar qué te costó y justificar una prioridad 15. Writing Lab: recomendación breve 20. Repaso 5. | 40 | Revisa el resumen semanal, acepta o rechaza una propuesta solo tras leerla, y exporta una nueva copia completa. Conserva la del día 1. |

Al agotarse las tres tareas independientes Reading/Listening, repetir sirve para practicar y **no aumenta evidencia independiente**. Una respuesta nueva sobre un tema Speaking tampoco permite una estimación automática. No hay profesor o examinador IA conectado: habla de forma independiente y usa los prompts locales.

## Qué interpretar

- Un acierto es el resultado de esa pregunta, no tu nivel SLP.
- «Evidencia insuficiente» conserva el plan provisional: no es un suspenso.
- SRS separa reconocimiento y uso propio declarado; ayuda o imitación no equivalen a producción independiente.
- Anota errores en Error Bank solo si puedes identificarlos con un ejemplo. Crear una revisión es opcional y exige que tú compruebes la corrección.
- Aceptar/rechazar una semana no borra tus actividades ni reescribe el calendario de 36 semanas.

## Prueba segura de restauración

1. En el navegador principal, exporta una copia completa y conserva las anteriores. Nunca subas esos archivos a GitHub.
2. Usa un perfil de navegador local de prueba, separado del habitual, con textos ficticios. No necesitas una cuenta cloud. El modo invitado comparte el perfil del navegador: **no es una cuenta privada**.
3. Exporta también los datos del perfil de prueba antes de reemplazarlos.
4. Importa la copia, lee el resumen y confirma **Reemplazar**. Comprueba perfil, borrador, resultados y vocabulario. No hay merge.
5. Si falla, no borres datos del sitio para «arreglarlo». Conserva el archivo y registra el error. Si el texto sigue visible pero no está confirmado como guardado, descárgalo o cópialo antes de recargar.

## Registro de incidencias

Copia este formato en un archivo de notas. Comparte solo texto de prueba y capturas sin datos privados; no adjuntes audio, backups completos, certificados ni claves.

```text
Fecha/hora:
Commit o versión probada:
Dispositivo/modelo y sistema operativo:
Navegador y versión exacta:
Origen usado (localhost o HTTPS local; puede ocultarse la IP al compartir):
Acción realizada y pasos para repetir:
Resultado esperado:
Resultado observado y mensaje literal:
¿Se repite? Sí / No / No probado:
¿Se conservan datos tras recargar o reabrir?:
¿Se puede descargar/copiar el trabajo o restaurar una copia?:
Estado: PENDIENTE / PASS / FAIL
Observaciones (auriculares, interrupción, red, orientación):
```

Comunica el registro en esta conversación o como incidencia del repositorio, sin información personal. Si hay pérdida de trabajo o una restauración incorrecta, deja de usar ese flujo con datos reales hasta resolverlo.

## Cierre del piloto

Completa [PHYSICAL_QA.md](PHYSICAL_QA.md) con resultados reales, no con resultados de CI. Entrega al menos: dispositivo/navegador, versión, pruebas realizadas, incidencias y si se recuperaron los datos. El siguiente incremento debe resolver los fallos observados en este piloto antes de conectar servicios. Si no pudiste preparar el iPhone, mantén sus filas PENDIENTES y continúa el piloto PC.

# PROJECT_STATUS

Actualizado: 2026-10-28 UTC. Fase activa: investigación y diseño inicial entregables; implementación no iniciada.

## DONE

- Repositorio oficial clonado y verificado vacío; rama `docs/research-design`.
- .gitignore y .env.example sin secretos; identidad Git existente conservada.
- Investigación inicial con fuentes y limitaciones de acceso; lectura de descriptores ATrainP-5.
- Identificación de referencias públicas calificadas 2/2+/3, sin fingir análisis de grabaciones.
- PRD, roadmap, UX conceptual, arquitectura y alternativas, sincronización y esquema relacional.
- Diseño IA, Speaking en tres modos, estimación longitudinal, calibración pendiente, mocks, adaptación, Error Bank y analytics.
- Seguridad/retención propuestas, matriz iPhone, testing, CI/CD diseñado y costes con hipótesis.
- Commits documentales pequeños por bloque; ninguna aplicación o infraestructura implementada.

## IN PROGRESS

- Pendiente de revisión y aprobación del usuario; no se está implementando software.

## TODO

- Aprobar decisiones significativas antes de implementar.
- Recuperar íntegramente documentación española actualizada y convocatoria aplicable.
- Acceder/escuchar/anotar muestras BILC y examinar Writing; obtener derechos y corpus suficiente.
- Realizar calibración humana y evals holdout; no habilitar certeza de nivel por diseño solamente.
- Construir spike de voz y ejecutar pruebas físicas iPhone/PC tras aprobación.
- Implementar fases del roadmap, contenido inicial, CI/CD real y despliegue.

## KNOWN ISSUES

- Algunas fuentes Defensa/BILC respondieron 403/500/502/503; extractos indexados no equivalen a revisión íntegra.
- Formato exacto de convocatoria española no confirmado; no fijar tiempos oficiales.
- Sin API keys/proyectos cloud creados; disponibilidad real y consumo de modelos no probados.
- Sin iPhone conectado ni aplicación: ninguna prueba física o funcional realizada.
- Sin corpus humano calibrado: no hay evidencia de precisión de un evaluador IA.
- Coste de worker persistente, backups de objetos y calibración humana por concretar.

## DECISIONS NEEDED

Ver [registro](docs/decisions/DECISION_LOG.md): stack/servicios, presupuesto, retención y procesamiento, metodología de evaluación y condiciones de mocks. Fecha exacta de examen y convocatoria aún pendientes.

## NEXT STEPS

Presentar resumen ejecutivo y esperar aprobación solicitada expresamente por el usuario. Después cerrar incertidumbres prioritarias, fijar decisiones y comenzar spike de voz y base sincronizada. No continuar automáticamente con implementación.

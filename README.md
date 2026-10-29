# SLP 3333 Trainer

Plataforma personal propuesta para preparar inglés STANAG 6001: perfil inicial declarado 3.2.2.2 → objetivo 3.3.3.3, durante aproximadamente nueve meses, 6–7 horas semanales y prioridad Speaking.

**Estado: práctica diaria, diagnóstico inicial de cuatro destrezas y Listening utilizables localmente; sin despliegue ni servicios cloud conectados.** Las estimaciones futuras no certificarán oficialmente un SLP. Ninguna arquitectura o suscripción queda contratada con esta entrega.

Para empezar hoy: [DIAGNÓSTICO Y PRIMERA SEMANA](docs/product/DIAGNOSTICO_Y_PRIMERA_SEMANA.md). Si prefieres comenzar con una sesión breve, consulta [EMPEZAR A PRACTICAR](docs/product/EMPEZAR_A_PRACTICAR.md).

## Documentación

- [Entrega ejecutiva](docs/product/EXECUTIVE_SUMMARY.md)
- [Investigación y fuentes](docs/research/SOURCES.md)
- [Estado del repositorio](docs/research/REPOSITORY.md)
- [PRD y aceptación](docs/product/PRD.md)
- [Roadmap](docs/product/ROADMAP.md)
- [Arquitectura, alternativas y sincronización](docs/architecture/ARCHITECTURE.md)
- [Speaking e iPhone](docs/architecture/SPEAKING.md)
- [Seguridad y conservación](docs/architecture/SECURITY.md)
- [Modelo de datos](docs/database/SCHEMA.md)
- [IA y contratos](docs/ai/AI_DESIGN.md)
- [Evaluación y calibración](docs/slp/ASSESSMENT.md)
- [Plan adaptativo, errores y analítica](docs/product/LEARNING_SYSTEM.md)
- [Pruebas](docs/testing/TEST_STRATEGY.md)
- [Costes y despliegue](docs/deployment/COSTS_AND_DELIVERY.md)
- [Decisiones pendientes](docs/decisions/DECISION_LOG.md)
- [Estado del proyecto](PROJECT_STATUS.md)

## Ejecutar y conectar

Node.js 24. Ejecutar `npm ci` y `npm run dev`. Validar con `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

[Instrucciones de conexión a Supabase/Vercel/OpenAI](docs/deployment/CONNECT_SERVICES.md).

Sin credenciales funcionan Hoy, plan de 36 semanas, actividades, Error Bank, clases, Reading, Writing y Speaking guiado. El diagnóstico reúne Reading corregido, Writing con borrador recuperable y entrega cerrada, Listening original con audio/preguntas/corrección y Speaking con grabación y reproducción **solo en memoria**. La constancia oral conserva notas y duración cuando es fiable, nunca audio. El resumen distingue el perfil declarado de los resultados concretos; no asigna niveles SLP. Hoy prioriza muestras pendientes y propone repaso con errores observados, sin reprogramar el calendario.

Writing Lab conserva intacta su recuperación por usuario/invitado y el control de revisiones preparado para cloud. Los borradores diagnósticos usan claves independientes por identidad. Persistencia local no significa sincronización entre dispositivos. Pendientes: evaluadores calibrados, conversación IA, SRS, mocks, banco editorial amplio, cloud y pruebas físicas de iPhone. Manifest inicial, sin offline completo.

## Desarrollo posterior

Repositorio oficial: https://github.com/adrianseguradeorta-prog/Examen-SLP

El usuario aprobó continuar con la implementación y pidió preparar el proyecto sin servicios creados. Versiones y lockfile fijados; checks CI y cuatro migraciones preparados (sin aplicación cloud). `.env.example` contiene solo nombres y valores vacíos. No guardar datos personales de estudio, grabaciones del usuario ni credenciales en Git. El único audio versionado es contenido didáctico original sintético, con [procedencia documentada](docs/content/LISTENING_V1.md). Los documentos expresan propuestas, salvo hechos acompañados de fuentes.

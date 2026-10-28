# SLP 3333 Trainer

Plataforma personal propuesta para preparar inglés STANAG 6001: perfil inicial declarado 3.2.2.2 → objetivo 3.3.3.3, durante aproximadamente nueve meses, 6–7 horas semanales y prioridad Speaking.

**Estado: primer incremento implementado y compilable; no desplegado ni conectado a servicios cloud.** Las estimaciones futuras no certificarán oficialmente un SLP. Ninguna arquitectura o suscripción queda contratada con esta entrega.

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

Implementado: interfaz responsive, clases originales, Reading con feedback, prueba local de micrófono, login Supabase y borradores Writing versionados con RLS. Sin credenciales, guardado cloud no disponible. Añadido: Error Bank manual persistente con estados basados en oportunidades y recomendaciones, y plan versionado de 36 semanas, registro manual de actividades y muestras iniciales de diagnóstico Reading/Writing con historial y borrado. Aún pendientes: voz conversacional, evaluadores, diagnóstico completo de cuatro skills, SRS, detección automática de errores, mocks, informes y despliegue. Manifest inicial, sin service worker/offline completo ni pruebas físicas iPhone.

## Desarrollo posterior

Repositorio oficial: https://github.com/adrianseguradeorta-prog/Examen-SLP

El usuario aprobó continuar con la implementación y pidió preparar el proyecto sin servicios creados. Versiones y lockfile fijados; checks CI y primera migración incluidos. `.env.example` contiene solo nombres y valores vacíos. No guardar datos de estudio, audios ni credenciales en Git. Los documentos expresan propuestas, salvo hechos acompañados de fuentes.

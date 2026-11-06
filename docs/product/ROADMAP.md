# Roadmap con puertas de aceptación

No hay estimación de fecha de entrega contractual. Orden basado en riesgos, manteniendo las fases solicitadas y adelantando la prueba de voz antes de invertir en toda la interfaz.

| Fase | Entregable | Puerta de salida |
|---|---|---|
| 1 Investigación | Fuentes oficiales, incertidumbres, muestras identificadas | Revisión inicial documentada; cerrar fuentes pendientes antes de calibración |
| 2 PRD | Flujos y aceptación | Aprobación del alcance |
| 3 Arquitectura | Stack, alternativas, límites de proveedores | Aprobar servicios y gasto |
| 4 Datos | Esquema, relaciones, RLS, retención | Aprobar privacidad; probar migraciones después |
| 5 IA | Contratos, modos, calibración y evaluación longitudinal | Aprobar metodología provisional |
| 6 UX | Prototipos de Hoy, Speaking, feedback y borrador | Validación móvil/desktop, accesibilidad |
| 7 MVP base | Auth, sincronización, contenido versionado, diagnóstico y plan | Dos dispositivos, dos usuarios de prueba sin fugas |
| 8 Speaking | Spike temprano WebRTC; después tres modos y análisis | iPhone físico y PC; grabación recuperable; voz dinámica |
| 9 Adaptación | Error Bank, SRS, reglas y recomendaciones | Reproducible, explicable, no inventa mejora |
| 10 Simulacros | Cuatro labs y motor examen | Sin ayudas; tiempos/condiciones versionados |
| 11 Analytics | Informes y evidencia longitudinal | Historial reconstruible y sin métricas ficticias |
| 12 Contenido | Banco editorial inicial y admin | Tareas revisadas, claves inequívocas y derechos |
| 13 Testing | Seguridad, recuperación, evals y calibración humana | Gates críticos aprobados |
| 14 Deployment | Staging, backup/restore, producción HTTPS | CI verde, costes y privacidad aceptados |
| 15 Uso real | PC/iPhone, una semana piloto y correcciones | Criterios del PRD y del encargo verificados |

Las fases 1–5 tienen propuestas documentales, no validación operativa. El estudio de fuentes no termina la calibración. Antes de fase 7, realizar spike de fase 8 tras aprobación; si voz falla en iPhone, revisar arquitectura antes de completar labs. Clases y contenido se producen durante desarrollo; fase 12 verifica la entrega inicial completa, no deja MVP vacío.

Puerta actual: detenerse tras esta entrega, presentar decisiones y esperar aprobación. No crear cuentas de pago ni migraciones aplicadas en esta fase.

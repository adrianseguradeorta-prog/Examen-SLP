# Costes y entrega cloud — estimación 2026-10-28

USD/mes, sin IVA, cambio a EUR, dominio, revisión humana ni desarrollo. Tarifas públicas consultadas en T04/T11/T12; no presupuesto contractual ni consumo medido. Revalidar antes de contratar.

## Hipótesis reproducibles

6.5 h/semana × 4.33 = 28.15 h de estudio/mes. Plan inicial: 2 h/semana de voz en vivo = ~520 min/mes; el resto es estudio, escritura, lectura, escucha y revisión. 3 h/semana completas de voz elevarían este bloque un 50% aproximadamente, antes de efectos del contexto.

| Servicio/modelo candidato | Tarifa pública base consultada |
|---|---|
| Supabase Pro | Desde $25/mes; un proyecto Micro cubierto por crédito de compute, sujeto a límites |
| Vercel Hobby / Pro | $0 personal según términos / $20 base más uso |
| gpt-realtime-2.1 audio | $32 entrada / $64 salida por millón de tokens |
| gpt-realtime-2.1-mini audio | $10 entrada / $20 salida por millón |
| GPT-Live 1 | $0.05/min de sesión, backend/herramientas aparte |
| gpt-6.1-sol texto Standard corto | $2 entrada / $10 salida por millón |
| gpt-6-luna texto Standard corto | $0.10 entrada / $0.50 salida por millón |
| gpt-4o-mini-transcribe / gpt-4o-transcribe | Aproximadamente $0.003 / $0.006 por minuto |

Realtime no se factura únicamente por minutos de reloj. Fórmula real: suma tokens de audio/texto input/output/cache × tarifa + herramientas. Conversación larga puede volver a procesar contexto. No convertir 520 minutos directamente en tarifa garantizada.

Escenario ilustrativo para dimensionar, no tasas de tokenización verificadas de estos modelos: alumno habla 60%, IA 40%; suponiendo 600 tokens/min de entrada y 1200 de salida, tokens audio nuevos = 187,200 entrada + 249,600 salida. Coste completo = $5.99 + $15.97 = **$21.96**; mini = **$6.86**. Excluye relectura de contexto, texto, cache y sesiones fallidas. Sustituir supuestos por `usage` real durante spike. Alternativa GPT-Live: 520 × $0.05 = **$26**, más backend.

Evaluaciones ejemplo: 40 al mes × (12k input + 3k output) con sol = 40 × ($0.024 + $0.030) = **$2.16**, antes de razonamiento facturado, reintentos y dobles revisiones. 200 tareas rutinarias × (2k input + 500 output) con luna ≈ **$0.09**. Reservar $5–15 para evaluación/generación/informes inicialmente; validar tamaño de contexto. Transcribir 312 min del alumno = $0.94–1.87, o $1.56–3.12 si se procesan 520 min. No transcribir dos veces sin necesidad.

## Presupuesto propuesto

- IA voz, análisis y margen de contexto/reintentos: **$30–70**.
- Supabase producción: **$25**.
- Vercel: **$0–20** según plan admisible.
- Worker/supervisor y copias/operación: **reserva $5–15**, no tarifa cotizada; servicio concreto pendiente del spike.
- Total orientativo: **$60–130/mes**; nueve meses **$540–1,170**, manteniendo hipótesis.

Recomendación de control a aprobar: objetivo $100/mes y techo operativo $150/mes. Configurar cuotas por servicio y presupuesto reservado por sesión; alertas 50/80/95%; no iniciar sesiones que no quepan. El límite de la app no garantiza límite de factura de terceros: reconciliar consumo real y mecanismos de spend cap de proveedor. Si se alcanza presupuesto, conservar acceso a historial/contenido y desactivar llamadas pagadas con aviso. No sustituir silenciosamente evaluador por uno peor.

## Audio y almacenamiento

64 kbit/s mono de referencia: 0.48 MB/min. 520 min ≈250 MB/mes por pista; dos pistas ≈500 MB/mes, ~4.5 GB en nueve meses sin borrado. 128 kbit/s duplica. Reproducciones, copias, chunks y transcodificaciones añaden egress/espacio. Cuota Storage Pro publicada 100 GB; no asumir backup de objetos incluido. Retención elegida cambia tamaño. Free con 1 GB Storage se queda corto al crecer y pausa por inactividad; adecuado para prototipo, no recomendación de nueve meses sin plan de respaldo.

## CI/CD diseñado, no configurado todavía

Primera implementación añadirá GitHub Actions con permisos mínimos y dependencias/actions fijadas: install con lockfile → lint → typecheck → unit/domain → integración PostgreSQL/RLS → contratos IA con fixtures → build → smoke/E2E. No llamadas de pago en tests por defecto. Secret scanning, migraciones y comprobación de dependencias. Eval suite humana/holdout al cambiar prompt/rúbrica/modelo, separada de tests sintéticos.

Protección de rama y checks requeridos; previews sin datos reales; no desplegar producción directamente por cualquier push. Promoción explícita del mismo SHA/artifact que pasó gates, mediante workflow dependiente de checks y entorno production. Evitar que integración automática Vercel despliegue antes de CI. Migraciones expand/contract, prueba de restore y rollback a release compatible; rollback de código no deshace datos destructivos.

Entornos: desarrollo local + staging + producción con proyectos/secretos separados según presupuesto; segundo proyecto Pro añade coste no incluido en base de un proyecto. Alternativa staging efímero local para reducir coste, sin compartir datos privados de producción. Confirmar SMTP para auth, dominio/HTTPS, región, monitorización redacted, alertas de jobs y gasto. Las pruebas físicas y restore bloquean declarar producción apta para uso diario.

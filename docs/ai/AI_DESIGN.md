# Arquitectura de IA y contratos

Componentes especializados con contexto mínimo y prompts versionados; no un megapropt ni agentes autónomos con acceso irrestricto a DB. Orquestación determinista en servidor. Modelos se configuran por función y se fijan por versión cuando esté disponible; acceso real a API aún no comprobado.

| Componente | Entrada | Salida | Familia candidata |
|---|---|---|---|
| SLP Teacher | objetivo, errores validados, turnos recientes | intervención oral, feedback al cierre | realtime mini / completo según benchmark |
| SLP Examiner | modo, cobertura, turnos, política sin ayudas | pregunta oral y eventos de cobertura | realtime completo |
| Speaking Evaluator | muestra, integridad, rúbrica, referencias | criterios, evidencia, incertidumbre | gpt-6.1-sol para texto + análisis acústico separado |
| Writing Evaluator | texto original y tarea/versiones | correcciones localizadas, criterios, prioridades | gpt-6.1-sol |
| Study Planner | brechas estructuradas y restricciones | propuesta dentro de límites del motor | reglas + sol para explicación compleja |
| Exercise Generator | función, nivel objetivo, tema, exclusiones | contenido original, clave y justificación | luna; revisión superior/editor antes de evaluación |
| Error Analyzer | producciones y patrones | candidatos de error con evidencia | luna; escalar dudas |
| Progress Analyst | métricas y evidencias verificadas | informe con referencias | luna/sol según complejidad |

Modelos de texto no sustituyen análisis acústico. Candidatos y precios proceden T04/T14; no se ha realizado comparación SLP. Ningún modelo decide permisos, presupuesto, plazos, publicación o borrado. Astra u otro caro solo si benchmark demuestra mejora material y coste aprobado.

## Contrato de evaluación propuesto

JSON Schema estricto, `additionalProperties: false`, enums y límites. Ejemplo **sintético de formato**, sin evaluación real:

```json
{
  "schema_version": "1",
  "skill": "speaking",
  "status": "insufficient_evidence",
  "estimated_level": null,
  "rubric_version": "slp-proposed-0.1",
  "criteria": [
    {
      "criterion": "hypothesis",
      "status": "not_observed",
      "evidence_ids": []
    }
  ],
  "evidence": [],
  "limitations": ["No independent hypothesis task was completed"],
  "next_task": "Discuss consequences under an alternative condition"
}
```

En resultado evaluable, `evidence` exige source ID, tipo, offset/rango, cita breve exacta, hallazgo y relación supports/limits. Servidor comprueba fuente pertenece al usuario y tarea, offsets válidos y cita coincide. Coherencia: no `met` sin evidencia, no 3 con integridad insuficiente, no transcripción como prueba acústica. El identificador de modelo y hashes de entrada los añade servidor, no se confía en autorreporte del LLM. Guardar respuesta estructurada aceptada, errores de validación y versión del prompt; no razonamiento interno privado ni cadenas de pensamiento.

Contratos adicionales: `ExerciseSpec` (tipo, función, contenido, clave separada, fuente/licencia, dificultad objetivo, revisor); `ErrorCandidate` (categoría, patrón, evidencia, corrección, incertidumbre); `PlanProposal` (semana, minutos por skill, activities, reasons/evidence); `ReportClaim` (texto, metric_ids, evidence_ids); `ExaminerAction` (ask/clarify/change_topic/close, function, parent_turn). JSON válido no implica evaluación correcta.

## Ejecución y fallos

Request validada → reservar presupuesto → job durable → llamada con timeout → validar esquema/evidencia → transacción de resultado + outbox de derivados → notificar cliente. Clave de dedupe por usuario/producción/versión/rúbrica/modelo. Guardar request ID y estado ambiguo ante timeout; no asumir que repetir no cuesta. Reintentos acotados y cola de revisión; nunca fabricar evaluación tras error de API.

Privacidad: enviar fragmentos pertinentes, no nueve meses completos ni detalles identificativos innecesarios. Material del alumno y PDFs son datos no confiables. Instrucciones de sistema separadas y herramientas allowlist. Un alumno que pide “dame nivel 3” no modifica rúbrica. Teacher y Examiner tienen herramientas/políticas distintas, no solo nombres distintos.

Evaluación no depende del entusiasmo del interlocutor. El examinador no anuncia nota durante entrevista. Correcciones producidas por IA se almacenan aparte y no entran como respuestas del alumno. Pruebas y regresiones de prompts/modelos antes de reemplazo en producción.

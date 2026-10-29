# Aprendizaje, adaptación y analítica — diseño

## Semana inicial: 390 minutos

Speaking 180; Writing 80; Reading 60; Listening 40; revisión/vocabulario 30. Clases y revisión de feedback se incluyen en esos bloques para evitar doble cómputo. De los 180 min de Speaking, presupuesto inicial: 120 min de conversación en vivo y 60 de preparación/revisión/repetición. Cambiar esta mezcla cambia costes.

Semanas 1–4 diagnóstico y brechas; 5–12 avance funcional hacia 2+; 13–24 trabajo hacia 3; 25–32 consolidación y tareas nuevas; 33–36 simulacros y ajuste final. No asignar ascensos por fecha. Si el diagnóstico revela otra necesidad, registrar plan revisado y conservar el anterior. Fecha de examen fija puede exigir reducir alcance y priorizar, no prometer recuperación de meses perdidos.

## Motor adaptativo v1

Reglas transparentes antes que aprendizaje automático. Entrada: evidencia reciente por función, errores validados y oportunidades, autonomía, tareas y temas cubiertos, exposición previa, disponibilidad y rendimiento bajo presión. Salida: plan versionado con minutos, actividades, explicación, evidencias y versión de política.

1. Filtrar evidencias incompletas, contaminadas por ayuda o audio deficiente para estimación; mantenerlas para enseñanza.
2. Ordenar brechas: impacto en función de nivel 3, repetición entre contextos, recencia, falta de cobertura. No sumar porcentajes heterogéneos como un nivel.
3. Reservar Speaking ≥150 min, Listening ≥30, Writing ≥60 y Reading ≥45 en semana estándar; distribuir resto según brechas y disponibilidad. Son reglas propias ajustables, no STANAG.
4. Limitar cambio de carga de cada skill a 30 min semanales; si no cabe, ofrecer redistribución, no aumentar horas silenciosamente.
5. Repetir función con nuevo contenido: inferencias fallidas → dos textos inéditos; chunk reconocido pero nunca producido → intervención oral con intención comunicativa; error recurrente → microclase, recuperación espaciada y transferencia libre.
6. No bajar Listening por una única buena sesión. Si hay evidencia estable, mantener mínimo y variar fuentes/acento.
7. Guardar motivo de recomendación, aceptación/rechazo y resultado. No entrenar exclusivamente debilidades: conservar variación temática y tareas de control.

Sin datos: plan inicial etiquetado como provisional. Datos contradictorios: tarea diagnóstica nueva. Enfermedad/ausencia: reprogramar, no penalizar ni comprimir carga imposible. Replanificación semanal automática; el usuario puede fijar actividades y deshacer propuestas.

## Error Bank

ErrorRecord identifica patrón pedagógico; ErrorOccurrence identifica cada observación. Dedupe por usuario, categoría y patrón normalizado; no fusionar ejemplos solo por parecido de palabras. Guardar original, alternativa, explicación, skill, sesión, fragmento/offset, detector, confianza y validación. Primera/última aparición y frecuencia se derivan de ocurrencias válidas.

Estados propuestos: NEW al validar primera evidencia; RECURRING al aparecer en ≥2 sesiones; IMPROVING tras ≥3 oportunidades correctas en dos sesiones; CONTROLLED tras ≥5 oportunidades correctas, tres sesiones y ≥14 días, sin nueva recurrencia. Reaparición → RECURRING. Umbrales de producto pendientes de pilotaje. No cometer un error porque se evita la estructura no es dominarla. Error marcado falso se excluye y se recalculan derivados.

Categorías: gramática, vocabulario, collocation, pronunciación, fluidez, registro, cohesión, argumentación y comprensión. Pronunciación requiere audio; evitación solo se registra como hipótesis cuando hubo oportunidades claras.

## Vocabulario

Estado pasivo y activo independientes. Revisión SRS inicial con intervalos 1/3/7/14/30 días según recuerdo, adaptables; errores reinician intervalo sin borrar historial. Pruebas de reconocimiento y producción distintas. “Activo” exige uso apropiado sin pista en sesiones distintas; repetición inmediata del profesor no cuenta. Registrar forma, significado, collocations, ejemplo propio, tema, fechas, historial y evidencias. No exigir un algoritmo SRS complejo para primera versión.

## Analytics

Ledger de estudio con tiempo activo, pausas, dispositivo y dedupe; máximo una sesión contada por intervalo si hay pestañas simultáneas. Zona horaria del perfil para streak/días, UTC para almacenamiento. Mostrar minutos reales y objetivos, no dejar reloj abierto como prueba de aprendizaje.

Series por skill: resultado de tarea, estimación longitudinal, cobertura, fecha, incertidumbre y versión de rúbrica. No trazar 2+ como 2.5 con precisión científica: etiquetas ordinales. WPM y exactitud se comparan solo en condiciones similares; no son nivel. Desglosar Reading/Listening por tipo y dificultad, con denominadores. Vocabulario activo requiere evidencias.

Weekly report: tareas realizadas, horas, dos avances documentados, dos limitaciones y próxima semana. Monthly report: cambios sostenidos, cobertura que falta, errores por oportunidad, transferencia y prioridad. Mock report: resultado por skill, incidentes, evidencia y contraste con mocks comparables. Si no hay evidencia, decirlo. Informes generados a partir de consultas estructuradas; cada afirmación lleva IDs, sin inventar causalidad.

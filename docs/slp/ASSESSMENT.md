# Evaluación explicable y calibración

Fuentes: S01/S03/S07 en [registro](../research/SOURCES.md). Este documento define una metodología de producto propuesta, **no un algoritmo oficial ni un evaluador ya validado**.

## Qué discriminar

Nivel 2: buen funcionamiento sobre situaciones concretas. 2+: capacidades más amplias con desempeño superior irregular. 3: sostener funciones abstractas, justificar, hipotetizar y desarrollar discurso con control suficiente. En Writing importa desarrollar ideas y relacionarlas; en Reading/Listening comprender argumento, actitud e información implícita, incluidos temas nuevos. No se exige acento nativo ni perfección absoluta. Vocabulario difícil, velocidad y longitud no sustituyen competencia. No asumir conversión automática CEFR.

Rúbrica analítica apoya juicio holístico: contenido/contexto, tarea/función, precisión/inteligibilidad y organización discursiva. Subcriterios ayudan a explicar gramática, rango, cohesión, registro y argumentación. No promediar para compensar incapacidad de sostener funciones con riqueza léxica.

## Evaluación de una sesión

1. Verificar muestra: tarea, ayuda, integridad, cobertura, longitud útil y calidad de audio. Si insuficiente, abstenerse de nivel; no inventar 2+ por defecto.
2. Extraer evidencia identificable antes de proponer nivel. Cada hallazgo enlaza turno, intervalo de audio, versión de texto u opción/ítem y distingue apoyo/limitación.
3. Criterios `met`, `partial`, `not_met`, `not_observed`. No observado no equivale a fallo. Diferenciar errores sistemáticos de lapsus y de errores ASR.
4. Emitir estimación ordinal, razones, contraevidencia, límites y siguiente tarea. “Performance consistent with Level 2+” y “Evidence of Level 3 performance” nunca certificación.
5. Validar estructuralmente y semánticamente las citas en servidor. Una cita inexistente invalida el resultado. Evaluación conservadora adicional para casos frontera; discrepancia produce revisión, no escoger la nota más alta.

Reading/Listening: aciertos por tipo de pregunta, dificultad y texto/audio. Un test generado no calibrado no permite convertir 80% en nivel 3. Mostrar evidencia de comprensión, cobertura e incertidumbre; etiqueta estimada solo tras estudio del banco y tareas suficientes. No juzgar la corrección gramatical de una explicación como comprensión si respuesta objetiva basta.

## Evidencia longitudinal: regla candidata v0.1

No es una regla BILC. Para mostrar Estimated Level 3 en Speaking/Writing exigir inicialmente ≥3 sesiones independientes sin ayuda, ≥3 temas, ≥2 semanas, últimas 6 semanas; funciones críticas observadas repetidamente en más de una tarea, sin contradicción importante reciente sin resolver. Speaking incluye respuesta espontánea a objeción/hipótesis; Writing textos con argumentación completa. Nivel 3 de una sesión puede figurar como evidencia, sin ascenso inmediato del perfil.

Estos mínimos son guardas de ingeniería, no prueba de validez. Someter a pilotaje y aprobación antes de activarlos. No compensar falta de cobertura contando muchas repeticiones del mismo tema. Ayuda, texto memorizado conocido o prompt repetido impiden contar independencia. Para Reading/Listening exigir diferentes textos/audios, familias de pregunta y dificultad revisada; cantidad final por decidir tras pilotaje. Mientras no haya banco calibrado, mostrar desempeño por función, no nivel preciso.

Al faltar práctica reciente: marcar estimación desactualizada; no bajar nivel automáticamente. Contradicción seria: pedir nueva evidencia y señalar incertidumbre. Rúbrica/modelo nuevo: mantener evaluaciones históricas y versión; recalcular en paralelo si autorizado sin reescribir originales. No usar listening 3 declarado como resultado observado.

## Calibración real prevista

Inventario de referencias identificadas en S02 y muestras de S08. No se han escuchado/calificado los snippets ni examinado individualmente los Writing: quedan pendientes de acceso y derechos. Por tanto **no afirmar calibración completada**.

Procedimiento: obtener corpus legal de entrevistas completas/escritos, separar por hablante y tema; dos evaluadores humanos conocedores de STANAG, ciegos al resultado IA, más adjudicación de desacuerdos. Anotar funciones/evidencia y niveles 2/2+/3. Separar desarrollo, validación y holdout por persona; no usar el mismo snippet en prompt y test. Las referencias públicas sirven como anclas, no como único examen de validez.

Medir matriz de confusión ordinal, acuerdo exacto/adyacente, falsos 3, abstenciones y desacuerdo humano; intervalos de confianza y denominadores. No proclamar fiabilidad con cuatro muestras. Propuesta inicial de estudio: 60 producciones completas balanceadas por nivel y skill productiva, sujeto a disponibilidad/licencias/coste; tamaño definitivo con asesor experto. Dos ejecuciones del mismo modelo no son evaluadores independientes.

Criterio inicial de liberación: ningún falso 3 en batería adversarial obligatoria y falsos 3 ≤5% en conjunto humano no-3, con intervalo reportado; si muestra no permite sostener conclusión, no habilitar nivel 3 longitudinal automático. Umbral es decisión de producto pendiente, no norma. Revisar sesgo por acento, tema familiar, longitud, calidad de grabación y necesidad de acomodaciones.

Casos obligatorios: texto largo con léxico raro pero sin argumento; habla rápida superficial; gramática correcta memorizada; buen argumento con errores sistemáticos; nativo acento extranjero inteligible; fallo ASR; audio truncado; pregunta no cubre hipótesis; opinión impopular bien defendida. No penalizar postura o acento por sí mismos.

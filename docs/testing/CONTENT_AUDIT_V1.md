# Revisión técnica/editorial del banco inicial — incremento 9

Revisión de código, textos y guiones; **no es calibración humana STANAG ni una prueba de calidad auditiva en un dispositivo físico**. No se ha creado contenido masivo ni cambiado versiones/soluciones para alterar el historial.

## Comprensión

Se contrastaron las 12 preguntas Reading y las 15 Listening con sus textos/guiones. Cada pregunta tiene tres opciones, una clave compatible con el texto y una explicación relacionada. No se encontró una contradicción que justificase sustituir las claves. Los distractores son frecuentemente muy evidentes: el banco es útil para probar entrenamiento y recuperación, pero no acredita dificultad de nivel 3.

| Tarea | Comprobación de significado |
|---|---|
| sensors-v1 | Detección, comunicación y actuación; propuestas compatibles con competencia por presupuesto; datos de contacto como problema diferente del sensor. |
| training-time-v1 | Disponibilidad formal distinta de acceso real; horarios y reserva anticipada; evitar cargar el coste a compañeros. |
| repair-cafe-v1 | Beneficios sociales/aprendizaje distintos de evidencia ambiental; talleres ocupan tiempo; seguimiento para observar transferencia. |
| library-evenings-v1 | Mantener acceso nocturno y ajustar atención; jueves con personal; revisión en seis semanas. |
| energy-meeting-v1 | Calefacción una hora más tarde; clima más suave como explicación alternativa; entrada fría y combinación de contadores/condiciones. |
| mentoring-v1 | Dos encuentros semanales durante el primer mes; preguntas sin vergüenza; temas comunes sin identificar personas. |

`tests/content-audit.test.ts` comprueba todas las alternativas contra las claves revisadas, tipo de pregunta, explicación y no atribución de nivel; comprueba además igualdad exacta entre las transcripciones devueltas y los guiones de generación.

## Audios originales

Los tres MP3 se regeneraron **solo en una carpeta temporal**, sin API, a partir de los guiones con Flite/FFmpeg y los mismos parámetros. La comparación de audio PCM decodificado dio igualdad en los tres casos. Los originales del repositorio no se modificaron. Esto verifica correspondencia técnica de generación, no comprensión auditiva humana, pronunciación natural ni compatibilidad física.

| Archivo | Duración ffprobe (s) | SHA-256 del MP3 auditado |
|---|---:|---|
| library-evenings-v1.mp3 | 49.502041 | a64789dc8ba8f36687b13c3d384bde7886b3eb931a5b572188e2a9c46ea484a0 |
| energy-meeting-v1.mp3 | 43.807347 | 61c0c204482759b7552899e77381ec4ee0d067c4aaddf2e2bb5a5034247cd1e8 |
| mentoring-v1.mp3 | 45.191837 | 782d25ab78d48a91feb574f8eda79aaadabf1d24ec7224452255aac291e878b7 |

Persiste la limitación de una sola voz sintética y audios cortos. Intelligibilidad con altavoces, auriculares, interrupciones y Safari iPhone: PENDIENTE de escucha física.

## Producción

Se revisaron las tres tareas Writing (servicios públicos, reparto de formación y energía comunitaria): requieren recomendación, argumentos y objeción/comparación sin conocimientos técnicos especializados ni límite de palabras atribuido como oficial. Las cuatro tareas Speaking contienen 16 prompts distintos, repartidos entre narración, opinión argumentada, objeción e hipótesis. Son prompts fijos para producción independiente, no una entrevista IA ni evaluación de pronunciación/fluidez.

No se han detectado soluciones contradictorias en estas tareas abiertas porque no tienen una clave de respuesta única. Su adecuación pedagógica y calibración por especialistas siguen pendientes. El uso de recuerdos personales debe limitarse a ejemplos no sensibles; no se requieren detalles militares reales.

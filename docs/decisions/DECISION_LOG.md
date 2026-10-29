# Registro de decisiones — 2026-10-28

Todas las propuestas significativas requieren aprobación del usuario; las menores ya adoptadas se limitan a organización de documentación y Git.

| ID | Estado | Decisión y motivo |
|---|---|---|
| D01 | Adoptada | Trabajar en repositorio oficial clonado y rama documental; sin código de producto |
| D02 | Propuesta | Next.js/TypeScript + Supabase/PostgreSQL/Auth/Storage + Vercel; pocas piezas para un usuario |
| D03 | Propuesta | PWA primero; WebRTC directo con proveedor y control servidor; spike físico antes de interfaz extensa |
| D04 | Propuesta condicionada | Worker/supervisor persistente si límites del hosting lo requieren; proveedor/coste se decide tras spike |
| D05 | Propuesta | OpenAI principal, modelos por tarea y selección mediante benchmark, sin entrenamiento propio |
| D06 | Necesita aprobación | Región UE preferida, proveedores y retención: audio 90 días, evidencia seleccionada hasta examen+30 días, historial 12 meses |
| D07 | Necesita aprobación | Estimación conservadora, abstención y evidencia longitudinal; revisión humana para calibrar, no nota oficial |
| D08 | Necesita aprobación | Mocks de entrenamiento hasta verificar convocatoria española; interrupciones preservadas sin ocultar condiciones alteradas |
| D09 | Necesita aprobación | Presupuesto objetivo $100 y techo operativo $150/mes, con estimación $60–130; costes humanos aparte |
| D10 | Pendiente de información | Fecha real, convocatoria/organismo y disponibilidad de evaluador humano cualificado; no impide aprobar diseño base |
| D11 | Adoptada | No subir audios, datos personales de estudio, PDFs de terceros o secretos a Git |
| D12 | Propuesta | Sin CRDT inicial: control optimista + versiones y resolución explícita de conflicto |

Aprobar D02/D03/D05 no autoriza cualquier servicio futuro: D04 requiere concretar coste si hace falta. D06 implica decidir si se desea conservar todos los audios nueve meses en lugar de borrado a 90 días. D07 requiere reconocer que mínimos de sesiones son hipótesis de producto, sujetas a validación. Registrar fecha y alcance de aprobación en este archivo antes de implementar.

## Actualización autorizada — 2026-10-28

El usuario respondió «Perfecto, continua con el programa» tras propuesta de objetivo $45/mes y límite operativo $60/mes. Confirmó no tener proyectos y pidió preparar proyecto e instrucciones. Se inicia implementación local en repositorio oficial, sin contratar ni desplegar servicios. La aprobación sustituye la puerta de parada inicial; no implica servicios de pago creados ni validación de metodología. Retención todavía no aplicada: no se guardan audios cloud.

## 2026-10-29 — recuperación y QA de uso frecuente

- Recuperación de respuestas Reading/Listening y notas Speaking en claves separadas por identidad, destreza y versión. Entregas cerradas siguen inmutables; limpiar borrador solo tras confirmación. No persistir audio ni estado del reproductor. Writing Lab se conserva intacto; Writing diagnóstico añade separación por tarea preservando su clave original.
- Exposición separada de resultados: abrir no prueba atención; borrar un intento no borra conocimiento de soluciones. Como máximo una primera muestra por versión, sin ascenso SLP. Historial parcial/antiguo: abstención. Entrega cloud independiente requiere transacción futura; de momento se conserva «unknown» en servidor.
- Playwright con Python y `unittest`: una dependencia de pruebas (`playwright==1.62.0`), disponible en el entorno, sin añadir dependencias al runtime Next. Se ejecuta contra build de producción en CI, con micrófono sintético y peticiones externas bloqueadas. La alternativa Node sería más homogénea con el frontend, pero requiere otro paquete; se prioriza una dependencia verificable y pequeña en alcance. Python solo se exige a quien ejecute E2E, no para estudiar.
- Los puertos loopback están bloqueados en el executor local (`listen EPERM`); no se afirma E2E local aprobado. La validación real de navegador se ejecuta en GitHub Actions. QA físico permanece pendiente en PHYSICAL_QA.md.

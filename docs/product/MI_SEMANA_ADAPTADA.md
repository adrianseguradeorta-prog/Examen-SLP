# MI SEMANA ADAPTADA

La aplicación funciona sin cuentas cloud ni IA. Iníciala con Node.js 24: la primera vez ejecuta `npm ci`; después `npm run dev` y abre **http://localhost:3000**. Mantén la aplicación en marcha para entregar Reading/Listening. Sigue usando el mismo navegador y puerto.

1. Abre **Perfil y copias → Mi perfil de entrenamiento**. Confirma los niveles que tú declaras, objetivos, minutos semanales, prioridad, zona horaria y días habituales. Puedes dedicar menos de seis horas. La fecha de examen es opcional. Guarda: cada edición conserva una versión anterior, pero no altera actividad pasada.
2. Si aún faltan muestras, completa Reading, Writing, Listening y Speaking desde **Hoy**. Puedes repartir los 45–50 minutos iniciales entre dos días. Los textos y respuestas pendientes se recuperan; el audio oral se pierde al salir, deliberadamente.
3. En **Plan y actividad → Mi semana adaptada**, compara reparto actual y propuesta. Lee las razones y pulsa **Aceptar semana** o **Rechazar propuesta**. Aceptar conserva la versión anterior; **Volver al reparto anterior** crea una nueva decisión sin borrar historial. El calendario base de 36 semanas permanece visible debajo.
4. Vuelve a **Hoy** para una acción principal. Prioriza muestras pendientes, reparación de errores recurrentes, SRS vencido, dificultades repetidas y, después, reparto del plan y tareas nuevas. Si agotaste la disponibilidad registrada, recomienda revisar o descansar. No traslada deuda de semanas anteriores.
5. Al acabar, registra los **minutos que realmente has practicado**, una sola vez, en Hoy o Plan. Son tiempos declarados, no mediciones automáticas. El repaso/SRS se cuenta dentro de la destreza practicada: Speaking si produces frases oralmente, por ejemplo.

## Por qué cambia el reparto

Son reglas internas de entrenamiento, no descriptores oficiales. Para mover minutos por comprensión se requieren errores del mismo tipo en las **dos últimas tareas independientes de esa destreza durante ocho semanas**. Tareas repetidas, exposición desconocida o Listening con transcripción/soluciones conocidas no justifican el cambio. Una sola tarea puede orientar una revisión, pero no determina nivel ni permite reducir carga por supuesto dominio.

La política transfiere como máximo **20 minutos por propuesta**, desde margen flexible y sin acumular incrementos por aceptar varias veces. La referencia de 360 minutos contiene Speaking 150, Writing 80, Reading 60, Listening 40 y repaso 30. Por debajo de 360 se reduce proporcionalmente. El tiempo adicional se asigna a la prioridad elegida. Estos mínimos son una política del producto; no son una obligación STANAG.

El reparto semanal es una referencia, no una obligación de completar horas extra. Si ya excediste un bloque, se conserva lo realizado y Hoy limita las sesiones al saldo total. No se sacrifican retrospectivamente los mínimos de otras destrezas para hacer cuadrar lo que ya estudiaste.

**Evidencia insuficiente** significa que faltan muestras independientes, correcciones compatibles o historial fiable para una conclusión. Se mantiene una orientación provisional y no se inventa un SLP. Las muestras breves disponibles tampoco permiten atribuir nivel 3 aunque todas sean correctas. Writing necesita revisión cualificada; Speaking local no evalúa pronunciación o fluidez.

Sin perfil guardado se utiliza la disponibilidad del último plan base (390 minutos si tampoco hay plan). Tras guardar perfil, su disponibilidad tiene prioridad en Hoy. Un cambio de perfil o de versión del plan deja la adaptación previa en el historial y requiere revisar una nueva propuesta. Cada semana vuelve al reparto base hasta aceptar su propuesta; no se altera automáticamente el calendario de 36 semanas.

## Vocabulario y SRS

En **Vocabulario y SRS**, añade un chunk de la biblioteca o una expresión propia con una pista de significado, ejemplo y tema. La primera recuperación queda pendiente inmediatamente. Intenta recuperarla antes de revelar la expresión. Después registra:

- **Reconocimiento**: recordaste su significado.
- **Producción**: produjiste una frase propia sin mirar. Incluye esa frase y el contexto.
- Si miraste, recibiste ayuda o repetiste un modelo, marca la ayuda.

Los aciertos sin ayuda en fechas vencidas programan 1, 3, 7, 14 y 30 días. Un fallo o ayuda reinicia a un día. Repetir antes de tiempo no avanza el intervalo. Se conserva todo el historial. «Uso independiente declarado» sigue siendo tu observación, no una revisión automática ni dominio certificado. Nunca se marca una expresión como dominada por pulsar un botón.

En **Error Bank**, anota solo errores que puedas identificar con un ejemplo real. **Preparar una revisión de esta corrección** abre un formulario; tú decides si es entrenable, escribes la forma correcta y confirmas que la has comprobado. No hay conversión automática. Usa después el enlace a otra tarea para transferirla. Si agotaste el banco, será práctica repetida. No registres una oportunidad correcta en Error Bank si solo imitaste el ejemplo.

## Limitaciones de uso

Edita desde una pestaña. Los cambios de perfil/SRS en otra pestaña bloquean la copia anterior hasta recargar. El invitado no es una cuenta privada: personas que comparten perfil de navegador comparten ese espacio. No hay sincronización PC/iPhone, análisis IA ni evaluación SLP. Los días elegidos son orientativos; no hay agenda automática de sesiones ni notificaciones. Los resúmenes antiguos de entregas conservan timestamps UTC; las actividades nuevas usan el día del perfil. Cambiar zona no refecha el historial.

Con historial incompleto (incluido el umbral conservador de 50 muestras o 1.000 actividades), Hoy se abstiene de adaptar. Los registros siguen conservados; ampliar estos límites con paginación y reglas longitudinales será trabajo posterior. Haz una [copia completa](COPIA_DE_SEGURIDAD.md) semanalmente y antes de borrar datos.

Para probar una semana completa sin aumentar tu disponibilidad, sigue [PILOTO_7_DIAS](../testing/PILOTO_7_DIAS.md). El acceso iPhone requiere [HTTPS local](../testing/HTTPS_LOCAL.md), no sincroniza con PC y no debe sustituir tu progreso principal durante las pruebas.

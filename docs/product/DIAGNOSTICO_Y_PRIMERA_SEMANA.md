# DIAGNÓSTICO Y PRIMERA SEMANA

Esta versión permite empezar sin cuentas cloud ni claves API. Sirve para recoger muestras y orientar la práctica; no certifica ni estima tu SLP. El perfil 3.2.2.2 que aparece es el que has declarado, no una evaluación de la aplicación.

## 1. Entrar

En el ordenador, necesitas Node.js 24. Abre una terminal en la carpeta **Examen-SLP** de esta entrega y ejecuta:

```sh
npm ci
npm run dev
```

La primera orden instala la aplicación y necesita Internet; normalmente solo se repite al actualizarla. En las sesiones siguientes basta con `npm run dev`. Deja la terminal abierta y entra en **http://localhost:3000**. No rellenes claves ni conectes servicios. Si ya hay un archivo de configuración de servicios de otro uso, utiliza una copia de la aplicación sin esas variables para esta práctica local.

Utiliza siempre la misma dirección, puerto, navegador y perfil. Cambiarlos abre otro espacio de datos. Si el puerto 3000 está ocupado, cierra la otra instancia antes de comenzar. No hay todavía sincronización entre ordenador e iPhone; `localhost` en el iPhone no abre la aplicación del ordenador. La grabación requiere permiso de micrófono y un contexto seguro (localhost en el ordenador o HTTPS); no basta con abrir una dirección HTTP de la red doméstica. La validación en iPhone físico está pendiente.

## 2. Primera sesión: primero las muestras

Abre **Hoy → Completar diagnóstico de cuatro destrezas**, o **Diagnóstico** desde el menú. Recomendamos las cuatro muestras antes de la rutina semanal. Dedica unos **45–50 minutos**, o reparte Reading/Writing y Listening/Speaking entre dos días. Son tiempos de práctica sugeridos, no condiciones oficiales de examen.

1. **Reading — 10 minutos.** Lee «Warnings are only the beginning», responde cuatro preguntas y pulsa **Entregar muestra de Reading**. Revisa cada explicación y localiza la evidencia en el texto. Las respuestas solo se conservan después de entregar.
2. **Writing — 15–20 minutos.** En el apartado Writing del diagnóstico, responde al enunciado sobre servicios públicos sin traductor ni modelo. Escribe tu postura, razones y una objeción. El texto se guarda al escribir: comprueba el mensaje **Copia local disponible** antes de salir. Pulsa **Entregar muestra cerrada** cuando termines. Ya no se edita; para otra respuesta utiliza **Crear otra muestra**. Puedes descargar el texto. Este borrador es independiente de Writing Lab.
3. **Listening — 8–10 minutos.** Abre **Listening Lab**. Escucha «A trial worth changing» (unos 50 segundos), responde cinco preguntas y pulsa **Entregar respuestas**. Puedes pausar y repetir; debe llegar al final al menos una vez. Después consulta las explicaciones y, si lo necesitas, la transcripción. Es audio sintético original, no una muestra oficial ni una entrevista natural. Las respuestas sin entregar no se recuperan tras cerrar.
4. **Speaking — 8–10 minutos.** Vuelve a **Diagnóstico → Speaking**. Prepara ideas un minuto, sin guion; pulsa **Iniciar grabación efímera** y responde a las cuatro preguntas de «A community decision» durante unos 3–4 minutos. Detén la grabación y escúchala. Añade observaciones honestas, indica si consultaste ayuda, confirma que realizaste la tarea y pulsa **Registrar realización sin conservar audio**. La grabación se detiene como máximo a los cinco minutos. No cambies de pestaña ni bloquees la pantalla mientras grabas: puede interrumpirse. Si no hay micrófono compatible, puedes hablar siguiendo los prompts y registrar minutos; la muestra oral seguirá pendiente.

**El audio de tu voz desaparece al salir, recargar, descartar o grabar de nuevo.** Registrar la realización conserva las notas, nunca la grabación. No hay transcripción ni corrección oral automática. La duración puede aparecer como no disponible; no significa que hayas hecho mal el ejercicio.

## 3. Interpretar el resumen

En **Diagnóstico → Cuatro destrezas, evidencia separada**:

- **Sin muestra**: falta entregar esa tarea.
- **Evidencia parcial**: hay un resultado concreto Reading/Listening. Los aciertos y errores describen esas preguntas, no tu nivel general.
- **Pendiente de revisión**: has entregado Writing, pero no hay una evaluación cualificada.
- **Realización registrada · evidencia insuficiente**: completaste Speaking y guardaste las notas; sin audio conservado ni revisión no se evalúa tu rendimiento oral.
- **Evidencia insuficiente** también aparece si faltan datos fiables. Es la respuesta correcta cuando no se puede estimar un nivel.

Una recomendación puede decir que fallaste dos de dos preguntas de inferencia de una muestra. Revisa esas preguntas; no interpretes que fallarás todas las inferencias de otros textos. Acertar todo tampoco prueba SLP 3. Repetir contenido después de ver soluciones es repaso, no evidencia independiente. Ninguna pantalla certifica STANAG/SLP.

## 4. Pasar a la primera semana

Vuelve a **Hoy** después de cada sesión. En **He terminado una práctica: registrar minutos**, registra por separado los minutos reales de cada destreza. También puedes hacerlo en **Plan y actividad**: elige un solo lugar para no duplicarlos. Entregar una muestra no suma minutos automáticamente.

En **Plan y actividad**, guarda el inicio y una carga de 6, 6,5 o 7 horas; la fecha del examen es opcional. Con 6,5 horas el reparto inicial es Speaking 180 minutos, Writing 80, Reading 60, Listening 40 y revisión 30. Son objetivos semanales, no una obligación de completar todo en una sesión ni una predicción de mejora.

Durante la primera semana:

- Completa las muestras que falten. Hoy las prioriza en el orden anterior.
- Revisa las explicaciones de Reading/Listening que hayas fallado y registra el repaso. Esa anotación permite volver al reparto de tiempo; no demuestra por sí misma que el error esté resuelto.
- Los días siguientes sigue **Práctica de hoy**: Speaking guiado, Writing Lab, la lectura de Biblioteca o Listening. Usa las clases y expresiones para producir tus propios ejemplos. El banco inicial es pequeño; cambia tus argumentos al repetir tareas y considera las repeticiones repaso.
- Revisa **Error Bank** unos cinco minutos al terminar. Añade solo errores realmente observados y ejemplos exactos. Si tienes una duda sin confirmar, anótala como observación de la sesión, no como diagnóstico automático.
- Al final de la semana revisa los minutos y los ejemplos. El plan sigue siendo provisional: Hoy orienta la siguiente práctica pero no reescribe las 36 semanas ni estima progresión de nivel.

## 5. Qué se conserva

| Dato | Conservación en este navegador |
|---|---|
| Writing Lab | Borrador recuperable existente, separado por identidad |
| Writing diagnóstico | Borrador al escribir y muestra cerrada al entregar, con identificador estable para reintentos |
| Reading/Listening | Respuestas, fecha, versión y corrección después de entregar; Listening incluye condiciones de repetición y exposición a soluciones |
| Speaking diagnóstico | Realización declarada, notas, ayuda/interrupciones y duración si es fiable; **nunca audio** |
| Plan, actividades y Error Bank | Registros guardados y su historial local |
| Respuestas Reading/Listening sin entregar, notas Speaking sin registrar | Solo en la pestaña; no se recuperan |

Comprueba los mensajes de guardado. Si se agota o bloquea el almacenamiento, descarga el texto antes de salir: la aplicación no anuncia éxito cuando no puede guardarlo. Edita el borrador diagnóstico desde una sola pestaña. Una muestra cerrada se puede borrar del historial; su copia de texto puede seguir en el editor y no se borra silenciosamente.

Usa **Hoy → Descargar historial local** para guardar un JSON de planes, actividades, muestras y Error Bank. Descarga los borradores desde sus editores por separado. Aún no hay importación/restauración de ese JSON. No uses navegación privada ni borres los datos del sitio si quieres conservar el progreso; los datos locales no están cifrados y el modo sin cuenta comparte un espacio de invitado dentro del mismo perfil del navegador.

## 6. Qué sigue pendiente

Evaluación cualificada de Writing/Speaking, calibración SLP, estimación longitudinal de nivel, conversación IA, banco editorial amplio, simulacros, motor adaptativo completo, sincronización entre dispositivos, importación de copias y uso completamente offline. No hay servicios externos conectados, gasto por IA ni despliegue. La aplicación local debe seguir en marcha para entregar y corregir. Las pruebas automatizadas no sustituyen la validación en un navegador y en un iPhone físico.

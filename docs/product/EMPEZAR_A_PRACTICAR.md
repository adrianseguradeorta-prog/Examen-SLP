# EMPEZAR A PRACTICAR

Puedes empezar en el ordenador sin cuentas, claves API ni suscripciones. Esta versión sirve para practicar y llevar un registro personal; no certifica ni estima tu nivel SLP.

## 1. Arrancar

Necesitas Node.js 24 instalado. En la carpeta **Examen-SLP de esta entrega**, abre una terminal y ejecuta:

```sh
npm ci
npm run dev
```

La primera orden instala lo necesario y requiere Internet; normalmente solo tendrás que repetirla al actualizar la aplicación. Para volver a practicar otro día basta con `npm run dev`.

Deja esa ventana abierta y entra en **http://localhost:3000** desde el navegador del ordenador. No necesitas rellenar `.env.local` ni conectar servicios. Utiliza siempre el mismo navegador, perfil y dirección: cambiar `localhost` por otra dirección o cambiar el puerto abre un almacenamiento distinto. Si el puerto 3000 está ocupado, cierra la otra instancia antes de empezar.

## 2. Primera sesión: unos 40 minutos

Abre **Hoy**. Encontrarás la siguiente práctica propuesta, su duración aproximada y el motivo. Para la primera sesión sigue esta secuencia:

1. **Reading — 10 minutos.** Entra en **Diagnóstico**, lee «Warnings are only the beginning» y contesta las cuatro preguntas. Pulsa **Entregar muestra de Reading**. Lee las explicaciones y busca la frase del texto que justifica cada respuesta. Repetir este mismo texto después de conocer las soluciones sirve de repaso, no de nueva prueba de nivel.
2. **Speaking — 15 minutos.** Abre **Speaking Lab**, apartado **Práctica oral guiada**. Elige «Technology and public decisions». Habla 1–2 minutos por pregunta y avanza: experiencia, postura, objeción e hipótesis. No escribas antes tus respuestas. No hace falta activar el micrófono: esta actividad no graba ni escucha tu voz. Las preguntas son fijas, no un examinador IA.
3. **Writing — 10 minutos.** Entra en **Writing Lab** y responde a la tarea sobre trabajo flexible en instituciones públicas. Expresa una recomendación, una razón y una objeción. Relee lo que has producido. El editor conserva el borrador local; pulsa también **Descargar copia** al terminar.
4. **Error Bank — 5 minutos.** Registra un error que realmente hayas observado, con categoría, destreza y ejemplo exacto. Puedes nombrar la sesión `practica-1`. Si no sabes si algo está mal, no lo declares como error confirmado. No hay corrector automático.

## 3. Marcar la práctica y preparar la semana

Vuelve a **Hoy** y abre **He terminado una práctica: registrar minutos**. Elige la destreza que acabas de practicar y los minutos reales. Registra Reading, Speaking y Writing por separado. También puedes hacerlo desde **Plan y actividad**: elige un solo lugar para no duplicar minutos.

En **Plan y actividad**, guarda un plan con la fecha de inicio y 6, 6,5 o 7 horas semanales. La fecha del examen es opcional. La distribución reserva más tiempo a Speaking. Hoy utiliza los registros para proponer la siguiente tarea; no cambia automáticamente tu calendario ni considera que has mejorado solo por acumular minutos.

Los días siguientes empieza en **Hoy**, sigue la propuesta, registra lo realizado y revisa Error Bank al terminar. La Biblioteca contiene otra lectura, cuatro clases y expresiones que puedes aplicar después al hablar o escribir. No es todavía un banco amplio de ejercicios nuevos: al repetir contenido, trátalo como repaso.

## 4. Qué se conserva y qué debes proteger

| Función | Qué conserva sin servicios externos |
|---|---|
| Writing Lab | Borrador al escribir, también tras recargar/cerrar; mantiene el aislamiento existente por usuario/invitado |
| Plan y actividades | Planes guardados, versiones, destreza, minutos, fecha y notas |
| Diagnóstico | Respuestas y feedback Reading **después de entregar**; textos Writing **después de guardar la muestra** |
| Error Bank | Observaciones manuales, ejemplos y seguimiento calculado a partir de ellos |
| Biblioteca | No conserva las respuestas del ejercicio; registra sus minutos si quieres llevar seguimiento |
| Speaking | No conserva audio ni evalúa la voz; registra tú los minutos y observaciones |

Antes de entregar, los formularios del diagnóstico no tienen recuperación automática. Para escribir un texto que quieras interrumpir usa **Writing Lab**; si utilizas Writing del diagnóstico, guarda la muestra o descárgala antes de salir.

En **Hoy → Descargar historial local** puedes exportar planes, actividades, muestras y Error Bank a JSON. Writing se descarga por separado. La importación/restauración de ese JSON aún no está implementada.

Todo pertenece a este navegador. No hay sincronización con iPhone u otro ordenador, cifrado local ni copia cloud. Evita navegación privada, no borres los datos del sitio y no uses un perfil compartido para textos privados. Usa una pestaña para registrar/borrar observaciones. Un aviso de falta de almacenamiento significa que no se ha confirmado el guardado.

## 5. Lo que todavía falta

Conversación Teacher/Examiner con IA, corrección automática de Writing, evaluación de Speaking, diagnóstico completo, Listening evaluable, simulacros, sincronización entre dispositivos y adaptación automática de las fechas. Listening mantiene tiempo reservado en el plan, pero no dispone aún de un ejercicio evaluado.

La prueba opcional de micrófono de 15 segundos ya existente solo permite escucharte temporalmente en esa pantalla: el audio no se guarda ni se envía. No es necesaria para la sesión guiada.

La app local debe seguir ejecutándose para corregir Reading. No está validada en iPhone físico ni preparada para abrirse totalmente offline. Ningún resultado se presenta como certificación oficial SLP/STANAG.

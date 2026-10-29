# Práctica local y conexión futura de servicios

Estado: la aplicación compila sin credenciales. El usuario confirmó que todavía no tiene los proyectos y solicitó preparar código e instrucciones. No se han contratado servicios ni desplegado la aplicación. El incremento actual funciona sin conectar Supabase/Vercel/OpenAI. Las instrucciones de conexión siguientes son para una fase futura autorizada, no un requisito para practicar.

## 1. Ejecutar localmente

Node.js 24 y npm. Desde el repositorio:

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000. Sin claves se pueden consultar clases, practicar Reading, escribir/descargar un texto y hacer una prueba local de micrófono. No hay datos ficticios de progreso. Writing recupera el borrador local tras recarga/cierre. Plan, actividades, diagnóstico entregado y Error Bank también funcionan en modo local sin cuenta. Ver [EMPEZAR A PRACTICAR](../product/EMPEZAR_A_PRACTICAR.md). No hace falta crear `.env.local` para este modo.

## 2. Supabase

1. Crear cuenta y proyecto en región UE. Free basta para probar; decidir Pro al comenzar uso diario con requisitos de respaldo.
2. Ejecutar en orden `supabase/migrations/202610280001_foundation.sql` , `supabase/migrations/202610280002_training.sql` y `supabase/migrations/202610280003_error_bank.sql` en SQL Editor de un proyecto nuevo. Si ya aplicaste alguna, ejecutar solamente las pendientes, en orden. Conservar historial de migraciones; no volver a ejecutar sin comprobar lo aplicado.
3. En Authentication, desactivar registro público y crear el usuario personal desde la administración. El login actual es email/contraseña; recuperación de contraseña y MFA todavía pendientes de interfaz.
4. Copiar Project URL y publishable key a `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` o secretos del hosting. La publishable key está diseñada para cliente; la protección efectiva son RLS y los permisos SQL.
5. Configurar Site URL y URLs de redirección del despliegue. No poner secret/service-role key en variables públicas. El código actual NO necesita esa clave privilegiada.
6. Reiniciar app. Crear dos usuarios de prueba: comprobar acceso, autosave, recuperación en otro navegador, conflicto al escribir simultáneamente y aislamiento. Borrar usuarios de test al terminar.

Las migraciones implementan borradores/versiones, tabla inicial de perfil, planes, actividades y muestras del diagnóstico; no todo el esquema diseñado. No habilitar producción para nueve meses hasta implementar borrado/exportación, backups y recuperación completa.

## 3. Vercel

1. Crear cuenta y conectar el repositorio oficial. Seleccionar rama `feat/training-foundation` para revisión inicial; no asumir que main contiene la aplicación.
2. Framework Next.js, Node.js 24, instalación `npm ci`, build `npm run build`.
3. Añadir URL y publishable key de Supabase; fijar `NEXT_PUBLIC_APP_URL` al origen exacto HTTPS del despliegue. Esta URL se usa en la comprobación de Origin contra CSRF. Cambiarla también para cada entorno de preview autorizado.
4. Mantener despliegue de producción condicionado a CI verde. Desactivar despliegues automáticos de producción hasta configurar esa puerta. El workflow actual ejecuta checks, NO despliega ni configura protección de rama.
5. Verificar login, escritura, revisión de conflicto y logout desde PC/iPhone. Una respuesta HTTP correcta no sustituye esas pruebas.

Hobby solo si el uso y condiciones vigentes lo permiten; no hay contratación automática de Pro. Separar staging/datos de prueba de producción.

## 4. OpenAI — reservado para siguiente integración

No crear cuentas ni configurar facturación en este incremento. Presupuesto pendiente de aclaración: los documentos discrepan entre 45/60 USD y 100/150 USD. No se adopta cifra ni se modifican límites. No realizar llamadas con coste antes de aclararlo; este flujo local no necesita OpenAI.

Las variables OPENAI_* están reservadas: **añadir una clave no habilita conversación en esta versión**. Falta construir y probar el control de presupuesto, sesiones WebRTC, grabación fragmentada privada, reconexión y evaluación. La prueba local de micrófono no llama a OpenAI ni genera gasto. No usar una clave estándar en navegador.

## Comprobación ejecutada

Lint, typecheck, tests de dominio y migración/RLS sobre PostgreSQL embebido PGlite y build de producción. PGlite prueba SQL real pero no los servicios gestionados Auth/Storage de Supabase. No se ha verificado cuenta cloud, iPhone físico ni calidad del evaluador. Ningún diagnóstico o nivel 3 validado está habilitado.

## Segundo incremento: plan y muestras

- `/plan`: crear plan de 36 semanas con 6, 6.5 o 7 horas semanales, fecha de inicio y examen opcional. Se conserva cada versión; el plan es inicial, no adaptativo aún. Semanas posteriores al examen aparecen marcadas.
- Registrar actividades manuales por skill, fecha, minutos y nota; resumen de los últimos siete días UTC y total del historial cargado (hasta 1.000 registros). Son minutos declarados, no tiempo medido automáticamente.
- `/diagnostic`: Reading original de cuatro preguntas, corrección servidor después de entregar, muestra de Writing pendiente de revisión y acceso/borrado de muestras. No atribuye nivel SLP; Speaking/Listening siguen pendientes.
- Las claves Reading no se importan en componentes cliente. Tras ver soluciones, repetir sirve de repaso, no de evidencia independiente.
- Comprobar con dos cuentas que historial, muestras y planes no se cruzan. Reintentar la misma operación no debe duplicar registros. La API rechaza reutilizar un identificador con otro contenido.
- Se puede borrar cada actividad, plan o muestra desde su pantalla. Borrado de cuenta completa, backups y exportación global siguen pendientes.
- El texto del diagnóstico no tiene autosave; ofrece descarga y aviso al salir. No hay garantía de recuperación después de cerrar forzosamente iOS. Para escritura con recuperación automática usar Writing Lab, también sin Supabase.

Verificación local del segundo incremento: 28 pruebas (dominio, SQL/RLS y contratos API), lint, TypeScript y build. No equivale a validación contra un proyecto Supabase real o iPhone físico.

## Tercer incremento: Error Bank

Aplicar `202610280003_error_bank.sql` tras las dos anteriores. `/errors` permite registrar patrones y ejemplos manuales, añadir oportunidades correctas, consultar frecuencia/primera/última aparición y borrar observaciones o patrones completos. Un borrado recalcula las reglas desde las evidencias restantes.

Los patrones se deduplican por usuario, categoría y texto normalizado. La escritura transaccional bloquea reintentos del mismo evento y rechaza reutilizar su identificador con contenido diferente. Una oportunidad correcta requiere un error previo. No hay detector IA: las observaciones son declaradas por el usuario.

Los estados NEW/RECURRING/IMPROVING/CONTROLLED se derivan de sesiones, oportunidades sin ayuda y separación temporal. El mismo día del último error no acredita reparación independiente. No practicar no cuenta como mejora. Las recomendaciones usan categorías y recurrencia; no reprograman todavía el calendario. Si el historial recibido es parcial (máximo 500 patrones/1.000 observaciones por consulta), se omiten estados y recomendaciones hasta implementar paginación completa.

Verificación ampliada: 39 pruebas de dominio, API y PostgreSQL embebido; lint, TypeScript y build. Los controles no sustituyen pruebas contra Supabase gestionado ni iPhone físico.


## Quinto incremento: modo de práctica local

Se selecciona explícitamente en las páginas cuando `configured()` indica que Supabase no está configurado. El modo cloud existente se mantiene; un 401/503 de cloud nunca cambia silenciosamente al historial local. El espacio personal sin cuenta utiliza claves `slp:practice:v1:guest:` independientes de Writing. Al configurar servicios en el futuro será necesario reconstruir la aplicación y decidir una migración explícita; el historial local no se envía automáticamente.

Cada plan, actividad, muestra entregada y observación se guarda como registro validado/versionado separado. Un identificador no puede reutilizarse con otro contenido; falta de cuota o bloqueo de almacenamiento da error, no éxito. Registros dañados no se borran automáticamente y obligan a abstenerse de recomendaciones basadas en todo el historial. Usar una pestaña para registrar/borrar patrones: no se implementan transacciones entre pestañas para esas operaciones compuestas.

Reading se corrige mediante `/api/practice/diagnostic`, una ruta sin estado del servidor Next.js local. No usa base de datos ni IA; las claves no se importan al cliente y solo se devuelven explicaciones después de entregar una muestra válida. La app local debe seguir ejecutándose para corregir. Writing del diagnóstico solo se conserva después de entregar; el editor Writing Lab mantiene su recuperación existente sin cambios.

Hoy utiliza el plan más reciente, su semana activa y los minutos de cada destreza registrados en ese periodo. Sin plan usa una propuesta base de siete días. Falta de muestra Reading propone empezar por el diagnóstico; errores de la primera muestra sugieren otra lectura hasta que haya práctica de Reading registrada desde ese día. El resto se distribuye entre Speaking, Writing y Reading según la carga restante; empates favorecen Speaking. Error Bank añade un foco solo con observaciones de la misma destreza y datos completos. Fechas no vigentes, datos insuficientes o parciales impiden afirmar personalización suficiente. Nada de esto estima un nivel ni cambia el calendario automáticamente.

La exportación JSON de Hoy incluye este historial local, no los borradores de Writing; estos se descargan desde su editor. No hay importación ni copia cloud. La navegación privada, borrado del sitio, cambio de puerto/origen o cambio de navegador afectan a la disponibilidad de las copias. No usar un perfil compartido para textos privados.

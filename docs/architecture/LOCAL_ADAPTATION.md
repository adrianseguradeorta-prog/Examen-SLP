# Adaptación local rules-v1 y recuperación — implementado

## Fronteras

El modo local explícito usa `slp:coach:v1:<owner>` para un documento Zod estricto y versionado: perfiles append-only, decisiones semanales y tarjetas con eventos de revisión. No modifica las claves ni el control remoto del Writing Lab. La identidad autorizada por servidor sigue separada de la clave de identidad recordada del editor. No hay endpoints cloud nuevos ni migraciones aplicadas.

`saveCoach` comprueba la copia esperada y confirma guardado solo después de `setItem`; Web Locks serializa mutaciones de este documento donde está disponible. Cambios entre pestañas bloquean las ediciones anteriores. Es control optimista para uso personal, no una transacción distribuida. No editar simultáneamente ni mezclar registros de cuentas. Un perfil corrupto no impide leer el historial anterior: agrega una advertencia y bloquea inferencias; las nuevas pantallas no lo sobrescriben silenciosamente.

## Reglas

`adaptive.ts` mantiene funciones puras para reparto, semana, evidencia y siguiente práctica. Dos últimas tareas Reading/Listening independientes con función fallada en ambas, dentro de 56 días, permiten transferir hasta 20 minutos del margen sobre mínimos. Se calcula contra la base, evitando escalada al aceptar reiteradamente. Nunca usa minutos, vocabulario declarado o porcentaje global como nivel. Repeticiones/exposición desconocida y ayudas registradas no cuentan como evidencia independiente. `estimatedLevel` permanece nulo en diagnósticos.

Las semanas se anclan al inicio del plan dentro de sus 252 días; sin plan usan lunes local. Perfil y plan base referenciados por ID; decisiones aceptadas/rechazadas/revertidas conservan reparto anterior, razones, IDs de evidencia y política. La fecha y disponibilidad del perfil prevalecen tras editarlo. El perfil no cambia el calendario histórico ni las actividades. El UI verifica el historial antes de aceptar para no decidir sobre una propuesta obsoleta. Perfil/plan diferente o semana nueva requieren revisión.

Hoy prioriza cobertura diagnóstica, error recurrente manual, SRS vencido, debilidad repetida, reparto y rotación. Solo recomienda el tiempo que queda disponible; llegar al límite no implica mejora. Error Bank no altera automáticamente el reparto ni el estado de dominio. Los días disponibles son orientación, no un programador de calendario. Lectura del historial incompleto conserva la abstención anterior (50 muestras/1.000 actividades).

## SRS

Política encapsulada en `srs.ts`: 1/3/7/14/30 días; acierto sin ayuda y vencido avanza, fallo/ayuda reinicia a 1 día, repaso anticipado no avanza. Historial inmutable por ID, fechas ordenadas. Reconocimiento y producción son observaciones separadas, sin estado «dominado». Producción independiente declarada exige frase y contexto; no implica validación cualificada. Alta desde Error Bank solo con confirmación explícita del usuario y enlace al patrón.

## Copias y reemplazo

`backup.ts`: JSON `slp-local-backup`, versión 1, owner, fecha y lista de entradas. Tamaño UTF-8 máximo 5 MiB, 10.000 entradas, límite de profundidad 40, schemas estrictos y comprobación recursiva contra propiedades que parsers antiguos descartan. Rechaza `__proto__`, `constructor`, `prototype`, claves desconocidas, audio y duplicados. Campos de texto se renderizan como texto React, nunca HTML. Copias no firmadas: validación estructural, no autenticidad ni calibración.

Reemplazo confirmado de la identidad, sin merge. Un diario `slp:maintenance:v1` conserva las entradas anteriores antes de modificar claves; recuperación al arranque antes de montar editores, rollback tras fallo, eliminación del diario solo después del reemplazo completo. No existe atomicidad multi-key nativa de localStorage; ante caída entre escrituras el diario permite rollback. Deben cerrarse otras pestañas: los editores anteriores no participan en un lock transaccional global. Las pestañas activas se bloquean al recibir la señal de mantenimiento. Borrado selectivo usa la misma transacción y conserva claves ajenas. No se llama a `localStorage.clear()`.

El formato incluye borradores, revisiones y exposiciones; excluye claves de identidad/auth. Exposiciones posteriores a una copia antigua no pueden recuperarse por inferencia. Si se agota la cuota, hay corrupción o borrado completo del sitio, una copia externa sigue siendo necesaria. Retención de nuevas entidades limitada por schema (500 perfiles, 1.000 decisiones/tarjetas, 2.000 revisiones por tarjeta); se rechaza exceso en lugar de truncar historial.

La futura sincronización deberá introducir tablas, revisiones y transacciones servidor para estas entidades, junto con migración explícita de copias locales. Este documento no autoriza conexión a Supabase, Vercel u OpenAI ni conservación de audio.

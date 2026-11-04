# COPIA DE SEGURIDAD

## Exportar

Abre **Perfil y copias → Copia de seguridad → Exportar copia completa**. Descarga `slp-local-backup.json`. Guárdalo en una carpeta privada con fecha. No subas tus copias personales al repositorio.

Incluye los datos reconocidos de tu identidad local: perfil y versiones, planes, decisiones semanales, actividades, muestras y correcciones, Error Bank, vocabulario e historial SRS, tareas vistas/soluciones conocidas y borradores de Writing Lab, Writing diagnóstico, respuestas Reading/Listening y notas Speaking. El archivo declara formato, versión, propietario y fecha de exportación.

No incluye grabaciones efímeras, tokens, credenciales, cuentas cloud, estado temporal del reproductor ni claves de otras aplicaciones o identidades. Los textos y notas pueden contener información privada que tú escribas: la copia **no está cifrada**. No introduzcas secretos en los textos de práctica.

La descarga antigua **Hoy → Descargar historial local** sigue disponible para consultar registros, pero es incompleta y **no se puede importar** con este restaurador. Usa la copia completa para recuperar trabajo.

## Restaurar

1. Exporta primero el estado actual, si es legible, para poder deshacer el reemplazo.
2. Cierra todas las otras pestañas de la aplicación. No edites desde dos ventanas durante el proceso.
3. En **Perfil y copias**, selecciona el JSON de copia completa. Límite: **5 MiB**. El archivo debe pertenecer a la misma identidad; no se fusionan invitados y cuentas.
4. Comprueba el resumen de registros, borradores, perfiles, semanas y expresiones. Hasta aquí no cambia ningún dato.
5. Marca la confirmación y pulsa **Reemplazar con esta copia**, o cancela. Reemplazar elimina los datos actuales de esa identidad que no estén en la copia. No combina historiales.
6. La página se recarga. Comprueba tu perfil, borrador Writing y últimas actividades.

Formatos desconocidos, claves duplicadas/ajenas, campos inesperados, audio y objetos peligrosos se rechazan. El contenido es texto/datos y no se ejecuta. La validación no autentica al autor ni garantiza que los resultados del archivo sean verdaderos: importa solo tus propias copias sin modificar.

Antes de reemplazar se guarda temporalmente una copia del estado anterior. Si no cabe, no se comienza. Un fallo posterior intenta restaurarlo; una interrupción conserva un diario que se recupera antes de abrir los editores al volver. Hace falta espacio adicional. Si el navegador sigue denegando almacenamiento o el diario está corrupto, la aplicación bloquea la edición; conserva tus archivos y resuelve el almacenamiento antes de continuar. No es una garantía frente a que el sistema elimine todos los datos del sitio.

Restaurar una copia antigua también devuelve el registro de tareas vistas a esa fecha. La aplicación no puede recordar exposiciones posteriores que ya no estén en la copia: no uses una restauración para tratar soluciones conocidas como material nuevo. En tareas de comprensión declara que conoces las soluciones cuando corresponda.

## Borrar

Las opciones permiten borrar progreso/planes, borradores, Error Bank, SRS o perfil y semanas adaptadas. Todas requieren confirmación. Borrar progreso conserva tareas vistas para que una repetición no parezca independiente. Borrar Error Bank desvincula sus tarjetas, pero conserva las revisiones SRS; borrar perfil retira sus adaptaciones, no las actividades. **Todo mi espacio local** borra los datos reconocidos de la identidad actual, incluidas exposiciones. No borra otras identidades, claves de cuentas ni almacenamiento ajeno mediante `localStorage.clear()`.

No hay restauración automática cloud ni recuperación entre dispositivos. Puedes trasladar manualmente una copia de invitado a otro navegador con esta misma versión de la aplicación, aceptando el reemplazo; esto no es sincronización. QA físico en PC/iPhone sigue pendiente.

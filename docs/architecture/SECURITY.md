# Seguridad, privacidad y recuperación — propuesta

## Identidad y autorización

Supabase Auth, registro restringido al propietario inicial, email verificado y recuperación. Sesiones SSR mediante cookies seguras según integración oficial; verificar JWT en servidor, expiración y revocación. CSRF/origin checks en mutaciones autenticadas por cookie. Clientes nativos futuros usarán tokens según contrato público. Contraseña no manejada por aplicación propia. MFA recomendado para administración.

RLS y comprobación de pertenencia en cada API. Clave privilegiada y OpenAI solo servidor; publishable key no sustituye RLS. URLs firmadas de audio breves, no buckets públicos. Validación de tamaño/tipo de payload, rate limiting por usuario y proyecto, CSP y prevención XSS, saneamiento de contenido importado, secrets scanning en CI. No aceptar herramientas arbitrarias solicitadas por el modelo.

Amenazas a probar: IDOR, acceso a audio ajeno, usuario que se concede admin, cambio de nota desde cliente, prompt injection en respuestas/documentos, filtración de claves de examen, reintentos cobrados dos veces, robo de URL firmada, restauración que resucita datos borrados. Logs solo identificadores técnicos redacted; nunca transcripción o secretos por defecto.

## Decisiones de datos pendientes

Propuesta: base y Storage en región UE; hosting cercano. Esto no garantiza procesamiento íntegramente UE por IA. Confirmar proyecto elegible, endpoint y modelo; T05 indica límites de residencia y tracing. No activar tracing con datos personales sin revisar condiciones. No usar datos API para entrenamiento voluntario. No prometer Zero Data Retention sin aprobación del proveedor. Consentimiento explícito para grabación y envío a IA; política legible con proveedores y finalidad.

Retención propuesta a aprobar:

| Datos | Política |
|---|---|
| Audio de práctica | 90 días por defecto; selección explícita de evidencias/mocks hasta fin de preparación + 30 días |
| Transcripciones, escritos, evidencia y progreso | 12 meses renovables/exportables, suficiente para nueve meses |
| Caché/drafts locales confirmados | Eliminar tras sincronización y ventana breve; purgar al salir de cuenta |
| Chunks huérfanos | 24 horas tras reconciliación; no borrar material pendiente de recuperación |
| Trabajos fallidos | 7 días de metadatos diagnósticos mínimos; alertar sin contenido |
| Logs técnicos | 14 días propuesta |
| Backups | Según plan, inventario y expiración explícita; política de borrado aplicada tras restaurar |

Borrado granular de audio no borra automáticamente notas si el usuario no lo solicita; informar qué evidencia queda sin reproducción. Borrado de sesión elimina también fragmentos citados/derivados y recalcula snapshots. Borrado completo incluye Auth, Storage, DB, cachés y artefactos bajo nuestro control; registrar pendientes de proveedor y plazo de backups, sin prometer borrado instantáneo de registros ajenos. Exportación JSON + archivos propios con descarga temporal autorizada.

## Backups y recuperación

Backups de PostgreSQL y copias de Storage por separado: restaurar base no recupera objetos eliminados. Propuesta RPO BD 24 h y RTO 24 h para servicio personal; objetivos no garantizados hasta ensayo. Exportación cifrada a ubicación privada aprobada, no GitHub. Verificar política/coste de objetos; no contratar PITR automáticamente.

Prueba de restore antes de producción y trimestral: cuenta de prueba, audio, transcripción, relación evidencia, tombstones de borrado y revocación de tokens. No copiar datos personales a previews. Trabajos con lease, límite de intentos, cola de fallos y reanudación idempotente. Presupuesto reservado antes de lanzar llamada y reconciliado al terminar; timeout no equivale a llamada no cobrada.

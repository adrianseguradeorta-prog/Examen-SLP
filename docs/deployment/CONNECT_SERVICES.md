# Conectar servicios — primer incremento

Estado: la aplicación compila sin credenciales. El usuario confirmó que todavía no tiene los proyectos y solicitó preparar código e instrucciones. No se han contratado servicios ni desplegado la aplicación.

## 1. Ejecutar localmente

Node.js 24 y npm. Desde el repositorio:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Abrir http://localhost:3000. Sin claves se pueden consultar clases, practicar Reading, escribir/descargar un texto y hacer una prueba local de micrófono. No hay datos ficticios de progreso. Sin Supabase el borrador permanece solo en la pestaña; descargar antes de salir.

## 2. Supabase

1. Crear cuenta y proyecto en región UE. Free basta para probar; decidir Pro al comenzar uso diario con requisitos de respaldo.
2. Ejecutar `supabase/migrations/202610280001_foundation.sql` en SQL Editor de un proyecto nuevo. Conservar historial de migraciones; no volver a ejecutar sin comprobar lo aplicado.
3. En Authentication, desactivar registro público y crear el usuario personal desde la administración. El login actual es email/contraseña; recuperación de contraseña y MFA todavía pendientes de interfaz.
4. Copiar Project URL y publishable key a `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` o secretos del hosting. La publishable key está diseñada para cliente; la protección efectiva son RLS y los permisos SQL.
5. Configurar Site URL y URLs de redirección del despliegue. No poner secret/service-role key en variables públicas. El código actual NO necesita esa clave privilegiada.
6. Reiniciar app. Crear dos usuarios de prueba: comprobar acceso, autosave, recuperación en otro navegador, conflicto al escribir simultáneamente y aislamiento. Borrar usuarios de test al terminar.

La migración implementa borradores/versiones y tabla inicial de perfil, no todo el esquema diseñado. No habilitar producción para nueve meses hasta implementar borrado/exportación, backups y recuperación completa.

## 3. Vercel

1. Crear cuenta y conectar el repositorio oficial. Seleccionar rama `feat/training-foundation` para revisión inicial; no asumir que main contiene la aplicación.
2. Framework Next.js, Node.js 24, instalación `npm ci`, build `npm run build`.
3. Añadir URL y publishable key de Supabase; fijar `NEXT_PUBLIC_APP_URL` al origen exacto HTTPS del despliegue. Esta URL se usa en la comprobación de Origin contra CSRF. Cambiarla también para cada entorno de preview autorizado.
4. Mantener despliegue de producción condicionado a CI verde. Desactivar despliegues automáticos de producción hasta configurar esa puerta. El workflow actual ejecuta checks, NO despliega ni configura protección de rama.
5. Verificar login, escritura, revisión de conflicto y logout desde PC/iPhone. Una respuesta HTTP correcta no sustituye esas pruebas.

Hobby solo si el uso y condiciones vigentes lo permiten; no hay contratación automática de Pro. Separar staging/datos de prueba de producción.

## 4. OpenAI — reservado para siguiente integración

Crear proyecto API con facturación y límites; suscripción ChatGPT no incluye automáticamente gasto de API. Configurar clave solo como secreto servidor. Objetivo acordado 45 USD/mes, límite operativo propuesto 60 USD para el conjunto; los límites de proveedores deben configurarse por separado.

Las variables OPENAI_* están reservadas: **añadir una clave no habilita conversación en esta versión**. Falta construir y probar el control de presupuesto, sesiones WebRTC, grabación fragmentada privada, reconexión y evaluación. La prueba local de micrófono no llama a OpenAI ni genera gasto. No usar una clave estándar en navegador.

## Comprobación ejecutada

Lint, typecheck, tests de dominio y migración/RLS sobre PostgreSQL embebido PGlite y build de producción. PGlite prueba SQL real pero no los servicios gestionados Auth/Storage de Supabase. No se ha verificado cuenta cloud, iPhone físico ni calidad del evaluador. Ningún diagnóstico o nivel 3 validado está habilitado.

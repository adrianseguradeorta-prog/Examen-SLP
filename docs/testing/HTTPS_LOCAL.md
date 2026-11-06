# PC + iPhone: HTTPS solo en tu red local

Este procedimiento **no publica la aplicación en Internet**. El PC sirve la aplicación y debe permanecer encendido. El iPhone necesita el mismo Wi-Fi doméstico. No hay sincronización: cada navegador/origen conserva sus propios datos. El PC puede seguir usando **http://localhost:3000** sin cambiar de almacén.

Estado: procedimiento y lanzador preparados. La instalación de certificados en Windows/macOS y en un **iPhone físico permanece PENDIENTE** hasta que tú la realices. WebKit automatizado no sustituye Safari físico.

## Antes de empezar

- Guarda una **copia completa** desde Perfil y copias en tu navegador habitual. Conserva ese archivo fuera del repositorio.
- Usa Node.js 24, esta rama y una red privada de confianza. No utilices Wi-Fi público, redes de invitados que aíslan dispositivos ni una VPN para este ensayo.
- No configures Supabase, OpenAI ni archivos `.env`. El lanzador rechaza configuración de servicios.
- No abras puertos en el router, no habilites UPnP para esta aplicación y no uses túneles. Si el firewall pide permiso para Node, permite solo **red privada/local**, nunca pública; limita el puerto 3443 a la subred doméstica. No desactives el firewall.

## 1. Instalar la herramienta de certificados en el PC (una vez)

Usamos [mkcert, proyecto oficial](https://github.com/FiloSottile/mkcert). Es una herramienta gratuita de certificados locales; no exige cuenta. Instálala siguiendo su guía para tu sistema. Opciones habituales:

- Windows, PowerShell: `winget install --id FiloSottile.mkcert --exact`. Cierra y abre PowerShell después.
- macOS con Homebrew ya instalado: `brew install mkcert`.
- Linux: instala `mkcert` y las herramientas NSS según tu distribución; consulta el enlace oficial.

Después, en la terminal del PC:

```text
mkcert -install
```

Puede solicitar permiso del sistema: instala una autoridad **local de desarrollo** en la confianza del PC. No instales certificados de origen desconocido. La clave privada de esa autoridad puede emitir certificados: **nunca la copies al teléfono, al repositorio ni a un servicio externo**.

## 2. Preparar la dirección y el certificado

Abre una terminal dentro de la carpeta Examen-SLP. Instala dependencias si aún no lo has hecho (`npm ci`). Ejecuta:

```text
npm run lan:addresses
```

El programa lista las IPv4 privadas de este PC. Elige la conexión Wi-Fi/Ethernet de casa, no adaptadores VPN/virtuales. Si hay dudas, compárala con Configuración de red del PC. Supongamos que muestra **192.168.1.42**; sustituye ese ejemplo por la tuya:

```text
npm run lan:prepare -- 192.168.1.42
```

Se crea `.local-https` (carpeta oculta en algunos sistemas), excluida de Git:

- `server.pem`: certificado para tu IP.
- `server-key.pem`: **clave privada, no compartir**.
- `rootCA.crt`: certificado público de confianza que sí instalarás en el iPhone.
- `config.json`: IP elegida.

El comando no sustituye certificados/configuraciones ya existentes. Si falla a mitad, conserva la carpeta con otro nombre que empiece por `.local-https` y repite después de resolver el error.

## 3. Instalar únicamente el certificado público en el iPhone

1. Transfiere **solo `.local-https/rootCA.crt`** por un medio privado: AirDrop desde Mac o copia de archivos local/controlada desde PC. Nunca transfieras `server-key.pem` ni `rootCA-key.pem`. No necesitas enviar claves por correo ni subir archivos a una web.
2. Abre el certificado en el teléfono y acepta descargar el perfil, si iOS lo solicita.
3. En Ajustes → General → VPN y gestión de dispositivos (o «Perfil descargado»), identifica el certificado mkcert que acabas de crear e instálalo. Puede pedir el código del teléfono.
4. Ve a Ajustes → General → Información → Ajustes de confianza de certificados. Activa la confianza total **solo para esa autoridad local**. Instalar el perfil sin activar la confianza puede no ser suficiente.

Los nombres de menús dependen de iOS. Referencia: [Apple: confiar en certificados instalados manualmente](https://support.apple.com/en-us/102390). Si el dispositivo está gestionado y no permite hacerlo, deja la prueba pendiente; no eludas su política.

## 4. Arrancar y usar

Cierra el servidor `npm run dev` anterior con **Ctrl+C**, sin borrar sus datos. En la carpeta del proyecto:

```text
npm run lan:build
npm run lan
```

`lan:build` crea una compilación de producción comprobando que no haya servicios configurados. Hay que repetirlo al actualizar código o ejecutar otro build. `lan` abre HTTP **solo en 127.0.0.1:3000** y HTTPS **solo en la IP privada elegida:3443**. No escucha en todas las interfaces. Mantén la terminal abierta.

- En PC: abre **http://localhost:3000** como siempre.
- En Safari del iPhone: abre **https://192.168.1.42:3443**, sustituyendo la IP.
- No pulses «continuar de todos modos» ante un aviso de certificado: comprueba IP, fecha, perfil y confianza.
- Abre Speaking diagnóstico, pulsa iniciar grabación y permite micrófono. Graba 20–30 segundos, detén y escucha. **Esta comprobación la haces tú; todavía está pendiente.**

El teléfono usa almacenamiento diferente al PC, incluso si ambos abren la misma dirección. HTTP y HTTPS también son orígenes distintos. Para esta semana, conserva el progreso principal en PC y usa datos de prueba en el teléfono. Puedes trasladar una copia manualmente, pero restaurar **reemplaza**, no combina ni sincroniza. Mantén la misma IP/puerto para encontrar los datos del teléfono.

## Problemas frecuentes

| Lo que ocurre | Qué comprobar |
|---|---|
| No abre desde iPhone | Mismo Wi-Fi, PC despierto, terminal abierta, IP correcta, firewall privado, red sin aislamiento de clientes. No abrir router a Internet. |
| Error de certificado | Instalar `rootCA.crt`, activar confianza total, usar la IP del certificado y revisar fecha. No desactivar verificación TLS. |
| Puerto ocupado | Cierra el servidor anterior con Ctrl+C; el lanzador no usará a ciegas otro servidor en 3000. |
| Micrófono no disponible | HTTPS confiable, permiso del sitio en Safari, acceso al micrófono en Ajustes; iniciar desde un toque. Recarga después de corregir permisos, conservando antes las notas. |
| Audio se corta al bloquear o cambiar de app | Mantén Safari en primer plano y pantalla activa. iOS puede suspender captura; registra la incidencia y repite la prueba. No prometemos grabación en segundo plano. |
| No aparece progreso del PC | Es esperado: no hay cuenta cloud ni sincronización; no borres almacenamiento para resolverlo. |
| Cambió la IP del PC | Detén el servidor. Conserva una copia desde el origen anterior si sigue accesible. Renombra `.local-https` a `.local-https-anterior` y prepara la nueva IP; ejecuta `lan:build` otra vez. El certificado raíz puede seguir siendo el mismo. El origen nuevo no mostrará automáticamente datos del anterior. |

## 5. Cerrar y retirar certificados

- **Ctrl+C** en la terminal de `npm run lan` cierra HTTPS y el servidor local. Después puedes volver a `npm run dev` para usar solo localhost.
- En el iPhone, desactiva la confianza de esa autoridad y elimina su perfil en General → VPN y gestión de dispositivos. Borra el archivo público transferido si ya no lo necesitas.
- En el PC ejecuta `mkcert -uninstall` cuando no necesites esa autoridad en ninguna otra aplicación local. Esto retira la confianza, **no elimina necesariamente las claves**.
- `mkcert -CAROOT` muestra la carpeta de la autoridad. Elimina sus claves únicamente cuando confirmes que no las usa otro proyecto; no las publiques. Retira `.local-https` y sus copias privadas cuando dejen de ser necesarias.
- Retira la excepción de firewall creada para el piloto. No borres datos del navegador sin una copia completa.

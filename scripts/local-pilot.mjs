// Local-only pilot utilities. No tunnel, service configuration or certificate trust changes.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import { networkInterfaces } from "node:os";
import { resolve } from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { isIP } from "node:net";
import { X509Certificate, createPrivateKey } from "node:crypto";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";
export function privateIPv4(ip) {
  if (isIP(ip) !== 4) return false;
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  );
}
export function assertLocalOnly(root, env) {
  for (const name of [
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
    ".env.development",
    ".env.development.local",
  ])
    if (existsSync(resolve(root, name)))
      throw Error(
        "El piloto requiere una carpeta sin archivos .env de servicios. No se ha iniciado nada.",
      );
  if (
    Object.entries(env).some(
      ([k, v]) =>
        v &&
        /^(SUPABASE_|NEXT_PUBLIC_SUPABASE_|OPENAI_API_KEY$|OPENAI_BASE_URL$|NEXT_PUBLIC_APP_URL$)/.test(
          k,
        ),
    )
  )
    throw Error(
      "El piloto requiere un entorno sin variables de servicios. No se ha iniciado nada.",
    );
}
export function allowedRequest(ip, remote, host, origin, url) {
  const peer = (remote ?? "").replace(/^::ffff:/, "");
  return (
    (privateIPv4(peer) || peer === "127.0.0.1") &&
    host === `${ip}:3443` &&
    (!origin || origin === `https://${ip}:3443`) &&
    typeof url === "string" &&
    url.startsWith("/") &&
    !url.startsWith("//")
  );
}
function run(command, args, opts = {}) {
  const r = spawnSync(command, args, { stdio: "inherit", ...opts });
  if (r.error || r.status !== 0)
    throw Error(
      `No se pudo ejecutar ${command}. Revisa su instalación y los mensajes anteriores.`,
    );
  return r;
}
function assertInterface(ip) {
  if (
    !privateIPv4(ip) ||
    !Object.values(networkInterfaces())
      .flat()
      .some((n) => n?.address === ip && !n.internal)
  )
    throw Error(
      "Elige la IPv4 privada del Wi-Fi/Ethernet de este PC; no una IP pública ni 0.0.0.0.",
    );
}
async function main() {
  const root = process.cwd(),
    dir = resolve(root, ".local-https"),
    env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
  assertLocalOnly(root, env);
  const [command, ip] = process.argv.slice(2);
  if (command === "addresses") {
    console.log(
      "Direcciones privadas disponibles (elige la conexión doméstica, no VPN):",
    );
    for (const [name, entries] of Object.entries(networkInterfaces()))
      for (const n of entries ?? [])
        if (privateIPv4(n.address) && !n.internal)
          console.log(`${name}: ${n.address}`);
    return;
  }
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  if (command === "prepare") {
    assertInterface(ip);
    if (
      ["server.pem", "server-key.pem", "config.json"].some((f) =>
        existsSync(resolve(dir, f)),
      )
    )
      throw Error(
        "Ya existe una configuración HTTPS. No se sustituye: conserva esa carpeta y consulta la guía para cambiar de IP.",
      );
    const caroot = spawnSync("mkcert", ["-CAROOT"], { encoding: "utf8" });
    if (caroot.error || caroot.status !== 0)
      throw Error(
        "Instala mkcert y ejecuta mkcert -install siguiendo la guía.",
      );
    const ca = resolve(caroot.stdout.trim(), "rootCA.pem");
    if (!existsSync(ca))
      throw Error("Falta la CA local. Ejecuta mkcert -install primero.");
    run("mkcert", [
      "-cert-file",
      resolve(dir, "server.pem"),
      "-key-file",
      resolve(dir, "server-key.pem"),
      ip,
      "localhost",
      "127.0.0.1",
    ]);
    copyFileSync(ca, resolve(dir, "rootCA.crt")); // Public root only; NEVER copy rootCA-key.pem.
    writeFileSync(
      resolve(dir, "config.json"),
      JSON.stringify({ version: 1, ip }),
      { mode: 0o600 },
    );
    console.log(
      "Preparado. Transfiere SOLO .local-https/rootCA.crt a tu iPhone por un medio privado. Sigue docs/testing/HTTPS_LOCAL.md.",
    );
    return;
  }
  const next = resolve(root, "node_modules/next/dist/bin/next");
  if (command === "build") {
    run(process.execPath, [next, "build"], { env });
    writeFileSync(
      resolve(dir, "build.json"),
      JSON.stringify({
        buildId: readFileSync(resolve(root, ".next/BUILD_ID"), "utf8").trim(),
      }),
      { mode: 0o600 },
    );
    return;
  }
  if (command !== "start")
    throw Error("Usa npm run lan:addresses, lan:prepare, lan:build o lan.");
  const config = JSON.parse(readFileSync(resolve(dir, "config.json"), "utf8"));
  assertInterface(config.ip);
  if (
    config.version !== 1 ||
    Object.keys(config).some((k) => !["version", "ip"].includes(k))
  )
    throw Error("Configuración HTTPS inválida.");
  const build = JSON.parse(readFileSync(resolve(dir, "build.json"), "utf8"));
  if (
    build.buildId !==
    readFileSync(resolve(root, ".next/BUILD_ID"), "utf8").trim()
  )
    throw Error(
      "Compila primero con npm run lan:build para verificar modo local.",
    );
  const cert = readFileSync(resolve(dir, "server.pem")),
    key = readFileSync(resolve(dir, "server-key.pem")),
    x509 = new X509Certificate(cert);
  if (
    !x509.checkIP(config.ip) ||
    !x509.checkPrivateKey(createPrivateKey(key)) ||
    Date.parse(x509.validTo) <= Date.now() ||
    Date.parse(x509.validFrom) > Date.now()
  )
    throw Error(
      "Certificado no válido para esta dirección/fecha/clave. Consulta la guía.",
    );
  // Reserve loopback before spawning: do not proxy a different application already on port 3000.
  const probe = http.createServer();
  await new Promise((ok, fail) => {
    probe.once("error", fail);
    probe.listen(3000, "127.0.0.1", ok);
  });
  await new Promise((ok) => probe.close(ok));
  const child = spawn(
    process.execPath,
    [next, "start", "--hostname", "127.0.0.1", "--port", "3000"],
    { env, stdio: "inherit" },
  );
  let ready = false;
  const server = https.createServer(
    { cert, key, minVersion: "TLSv1.2" },
    (req, res) => {
      if (
        !allowedRequest(
          config.ip,
          req.socket.remoteAddress,
          req.headers.host,
          req.headers.origin,
          req.url,
        )
      ) {
        res.writeHead(403);
        res.end(
          "Acceso permitido solo desde la red privada y la dirección del piloto.",
        );
        return;
      }
      if (!ready) {
        res.writeHead(503);
        res.end("La aplicación está arrancando. Reintenta en unos segundos.");
        return;
      }
      const upstream = http.request(
        {
          hostname: "127.0.0.1",
          port: 3000,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: `${config.ip}:3443`,
            "x-forwarded-host": `${config.ip}:3443`,
            "x-forwarded-proto": "https",
          },
        },
        (r) => {
          res.writeHead(r.statusCode ?? 502, r.headers);
          r.pipe(res);
        },
      );
      let bytes = 0;
      req.on("data", (chunk) => {
        bytes += chunk.length;
        if (bytes > 150000) {
          upstream.destroy();
          if (!res.headersSent) res.writeHead(413);
          res.end("Solicitud demasiado grande.");
        }
      });
      upstream.on("error", () => {
        if (res.writableEnded) return;
        if (!res.headersSent) res.writeHead(502);
        res.end("Servidor local no disponible.");
      });
      req.on("aborted", () => upstream.destroy());
      req.pipe(upstream);
    },
  );
  server.requestTimeout = 30000;
  const stop = () => {
    ready = false;
    server.close();
    server.closeAllConnections();
    child.kill();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  child.once("error", (e) => {
    console.error(e.message);
    process.exitCode = 1;
    stop();
  });
  child.once("exit", (code) => {
    if (code) process.exitCode = 1;
    ready = false;
    server.close();
    server.closeAllConnections();
  });
  server.once("error", (e) => {
    console.error(e.message);
    process.exitCode = 1;
    stop();
  });
  // Readiness is loopback only, no public service request.
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null)
      throw Error("El servidor local no pudo arrancar.");
    try {
      const r = await fetch("http://127.0.0.1:3000", {
        signal: AbortSignal.timeout(1000),
      });
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((ok) => setTimeout(ok, 500));
  }
  if (!ready) {
    stop();
    throw Error("No respondió el servidor local.");
  }
  server.listen(3443, config.ip, () =>
    console.log(
      `PC: http://localhost:3000 · iPhone: https://${config.ip}:3443 · Ctrl+C para cerrar ambos. Sin sincronización; no abrir puertos en el router.`,
    ),
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });

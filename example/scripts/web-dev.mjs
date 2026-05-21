// One-command web dev server for the bare-RN example.
//
// Spawns Metro (`react-native start`), waits for it to come up, then serves
// a same-origin HTML shell that mounts the app via AppRegistry.runApplication
// (through index.web.js). Bare RN ships no web dev mode — this is the
// minimal Expo-equivalent.
//
// Usage:
//   bun run web:dev          # starts Metro + host, then open http://localhost:3000
//
// Env:
//   PORT        host port (default 3000)
//   METRO_PORT  Metro port (default 8081)
//   METRO_URL   use an already-running Metro instead of spawning one

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import httpProxy from 'http-proxy';

const PORT = Number(process.env.PORT ?? 3000);
const METRO_PORT = Number(process.env.METRO_PORT ?? 8081);
const EXTERNAL_METRO = process.env.METRO_URL;
const TARGET = EXTERNAL_METRO ?? `http://localhost:${METRO_PORT}`;

const APP_NAME = (() => {
  try {
    return JSON.parse(readFileSync(new URL('../app.json', import.meta.url)))
      .name;
  } catch {
    return 'MmkvExample';
  }
})();

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${APP_NAME}</title>
    <style>html,body,#root{height:100%;margin:0;padding:0;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.__DEV__ = true;
      window.global = window;
      window.process = window.process || { env: { NODE_ENV: 'development' } };
      window.__fbBatchedBridgeConfig = window.__fbBatchedBridgeConfig || { remoteModuleConfig: [] };
      window.nativeModuleProxy = window.nativeModuleProxy || new Proxy({}, { get: () => ({}) });
      window.__turboModuleProxy = window.__turboModuleProxy || (() => null);
    </script>
    <script src="/index.bundle?platform=web&dev=true&minify=false"></script>
  </body>
</html>`;

// --- Metro -----------------------------------------------------------------

let metro = null;

const startMetro = () => {
  console.log(`[web-dev] starting Metro on :${METRO_PORT} ...`);
  metro = spawn(
    'bunx',
    ['react-native', 'start', '--port', String(METRO_PORT)],
    { cwd: new URL('..', import.meta.url).pathname, stdio: 'inherit' }
  );
  metro.on('exit', (code) => {
    console.log(`[web-dev] Metro exited (${code}); shutting down`);
    process.exit(code ?? 0);
  });
};

const waitForMetro = async () => {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${TARGET}/status`);
      if (res.ok && (await res.text()).includes('packager-status:running')) {
        return;
      }
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Metro did not become ready at ${TARGET}`);
};

// --- Host server -----------------------------------------------------------

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  ws: true,
  changeOrigin: true,
});

proxy.on('error', (err, _req, res) => {
  console.error('[web-dev] upstream error:', err.message);
  if (res && !res.headersSent && typeof res.writeHead === 'function') {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end('Bad gateway: ' + err.message);
  }
});

const server = http.createServer((req, res) => {
  const accept = req.headers['accept'] || '';
  if (req.url === '/' && accept.includes('text/html')) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// --- Lifecycle -------------------------------------------------------------

const shutdown = () => {
  if (metro && !metro.killed) metro.kill('SIGTERM');
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const main = async () => {
  if (!EXTERNAL_METRO) startMetro();
  await waitForMetro();
  server.listen(PORT, () => {
    console.log(`\n[web-dev] ready -> http://localhost:${PORT}\n`);
  });
};

main().catch((err) => {
  console.error('[web-dev]', err.message);
  shutdown();
});

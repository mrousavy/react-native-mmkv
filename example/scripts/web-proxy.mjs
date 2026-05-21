// Tiny same-origin proxy in front of harness Metro so chromium can load
// HTML + bundle + the /__harness WebSocket all from a single origin.
// Used by `bun run web:proxy` while harness is running its own Metro.

import http from 'node:http';
import httpProxy from 'http-proxy';

const TARGET = process.env.HARNESS_METRO_URL ?? 'http://localhost:8081';
const PORT = Number(process.env.PROXY_PORT ?? 3000);

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>react-native-harness</title>
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
    <script src="/index.bundle?platform=web&dev=true&hot=false&lazy=true&minify=false"></script>
  </body>
</html>`;

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  ws: true,
  changeOrigin: true,
});

proxy.on('error', (err, _req, res) => {
  console.error('[web-proxy] upstream error:', err.message);
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

server.listen(PORT, () => {
  console.log(`[web-proxy] http://localhost:${PORT} -> ${TARGET}`);
});

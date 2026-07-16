const http = require('http');
const url = require('url');
const path = require('path');

const API_PORT = 3001;
const WEB_PORT = 3000;
const PROXY_PORT = 8080;

const STATIC_EXTENSIONS = new Set([
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.webp', '.avif',
]);

const CACHE_DURATION = {
  immutable: 365 * 24 * 60 * 60, // 1 year for fingerprinted assets
  mutable: 24 * 60 * 60,          // 1 day for others
};

const server = http.createServer((req, res) => {
  const isApi = req.url.startsWith('/v1/') || req.url === '/v1';
  const targetPort = isApi ? API_PORT : WEB_PORT;
  const parsed = url.parse(req.url);
  const ext = path.extname(parsed.pathname).toLowerCase();

  const proxyReq = http.request(
    {
      host: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers },
    },
    (proxyRes) => {
      const headers = { ...proxyRes.headers };

      if (!isApi && STATIC_EXTENSIONS.has(ext)) {
        headers['Cache-Control'] = `public, max-age=${CACHE_DURATION.mutable}`;
        if (/[a-f0-9]{8,}-/.test(parsed.pathname)) {
          headers['Cache-Control'] = `public, max-age=${CACHE_DURATION.immutable}, immutable`;
        }
      }

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq);
});

server.listen(PROXY_PORT, () => {
  console.log(`Proxy listening on port ${PROXY_PORT} (API→${API_PORT}, Web→${WEB_PORT})`);
});

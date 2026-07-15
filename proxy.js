const http = require('http');

const API_PORT = 3001;
const WEB_PORT = 3000;
const PROXY_PORT = 8080;

const server = http.createServer((req, res) => {
  const isApi = req.url.startsWith('/v1/') || req.url === '/v1';
  const targetPort = isApi ? API_PORT : WEB_PORT;

  const proxyReq = http.request(
    {
      host: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
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

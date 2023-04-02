const SocksProxyAgent = require('socks-proxy-agent');
const httpProxy = require('http-proxy');
const https = require('https');
const fs = require('fs');

const torProxy = new SocksProxyAgent('socks://localhost:9050');

// Create an HTTP proxy server
const httpServer = httpProxy.createProxyServer({
  target: 'http://localhost:8080',
  agent: torProxy
});

httpServer.listen(8000);

// Create an HTTPS server
const options = {
  key: fs.readFileSync('path/to/ssl/key.pem'),
  cert: fs.readFileSync('path/to/ssl/cert.pem')
};

const httpsServer = https.createServer(options, function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('HTTPS proxy server using Tor');
  res.end();
});

httpsServer.on('connect', function (req, socket, head) {
  const url = req.url.split(':');
  const host = url[0];
  const port = parseInt(url[1], 10);

  const proxySocket = new SocksProxyAgent({
    host: 'localhost',
    port: 9050,
    protocol: 'socks:'
  });

  proxySocket.createConnection({ host, port }, function () {
    socket.write('HTTP/1.1 200 Connection Established\r\n' +
      'Proxy-agent: Node.js-Proxy\r\n' +
      '\r\n');

    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
});

httpsServer.listen(8443);

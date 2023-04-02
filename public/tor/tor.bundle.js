(() => {
  "use strict";
  const http = require('http');
  const https = require('https');
  const url = require('url');
  const net = require('net');
  const socks = require('socksv5');

  const socksProxyOptions = {
    host: 'localhost',
    port: 9050
  };

  const server = socks.createServer({socksPort: 1080, socksHost: 'localhost', socksVersion: 4}, (info, accept, deny) => {
    const { port, host } = url.parse(`http://${info.dstAddr}:${info.dstPort}`);
    const isHttp = info.dstPort === 80;
    const options = {
      hostname: host,
      port: isHttp ? 80 : 443,
      path: info.dstAddr,
      method: info.cmd
    };

    const protocol = isHttp ? http : https;

    const req = protocol.request(options, (res) => {
      accept();
      res.pipe(socks.createRelayStream());
    });

    req.on('error', (err) => {
      deny();
      console.error(err);
    });

    req.end();
  });

  server.listen(1080, () => {
    console.log('SOCKS server listening on port 1080');
  });

  process.on('uncaughtException', function (err) {
    console.error('Uncaught Exception: ', err.stack);
  });

  process.on('unhandledRejection', function (reason, p) {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack);
  });

  process.on('SIGTERM', function () {
    console.log('Received SIGTERM');
    server.close(function () {
      console.log('Closed out remaining connections.');
      process.exit();
    });

    setTimeout(function () {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30 * 1000);
  });

  process.on('SIGINT', function () {
    console.log('Received SIGINT');
    server.close(function () {
      console.log('Closed out remaining connections.');
      process.exit();
    });

    setTimeout(function () {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30 * 1000);
  });
})();

const tor = require('tor-request');
const proxy = require('tor-socks-proxy');

proxy.createChain(9050, 'localhost', function(err, chain) {
  if (err) {
    console.log(err);
    return;
  }
  tor.setTorAddress(chain.torHost, chain.torPort);
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isHttp = url.startsWith('http://') || url.startsWith('https://');

  if (isHttp) {
    const torUrl = 'socks://localhost:9050';
    const torReqOpts = {
      url: url,
      headers: {
        'Tor-From': 'true',
      },
      torHost: torUrl,
      torPort: 9050,
      method: event.request.method,
      body: event.request.body,
      followRedirect: true,
      rejectUnauthorized: false,
    };
    event.respondWith(fetch(torReqOpts));
  }
});

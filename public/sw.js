if ('function' === typeof importScripts) {
    importScripts('/dip/dip.worker.js');
    importScripts('/osana/osana.worker.js');
    const sw = new DIPServiceWorker('/dip/dip.worker.js');
    const Osana = new OsanaServiceWorker();
    import { TorServiceWorker } from '/tor/tor-sw.js';
    const torWorker = new TorServiceWorker('/tor/tor-sw.js', { scope: '/tor/' });
    torWorker.register();
    self.addEventListener('fetch', (event) => {
        if (event.request.url.startsWith(location.origin + '/service/dip/'))
            event.respondWith(sw.fetch(event));
        if (event.request.url.startsWith(location.origin + '/service/~osana/'))
            event.respondWith(Osana.fetch(event));
        if (event.request.url.startsWith(location.origin + '/tor/go/')) {
            const url = decodeURIComponent(event.request.url.replace(location.origin + '/tor/go/', ''));
            event.respondWith(
                fetch(url, { 
                    mode: 'cors',
                    headers: {
                        'X-Tor-Proxy': 'true',
                    }
                })
            );
        }
    });
}

assets = [
    '/',
    '/404',
    '/error',
    '/index',
    '/search',
    '/settings',
    '/favicon.ico',
    '/manifest.json',
];

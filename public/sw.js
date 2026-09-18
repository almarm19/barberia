const CACHE_NAME = 'barbas-cuts-pos-v3';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/images/logo_barbas_cuts.svg',
  '/images/corte_skin_fade.png',
  '/images/corte_clasico.png',
  '/images/barba_ritual.png',
  '/images/tinte_barba.png',
  '/images/pomada_mate.png',
  '/images/aceite_barba.png',
  '/images/shampoo_caida.png',
  '/images/cerveza_corona.png',
  '/images/refresco_coca.png',
  '/images/agua_mineral.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cache) => {
        if (cache !== CACHE_NAME) return caches.delete(cache);
        return Promise.resolve();
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          }
        }).catch(() => undefined);
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/'));
    })
  );
});

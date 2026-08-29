const CACHE_NAME = 'barbas-cuts-pos-v2';
const ASSETS_TO_CACHE = [
  '/',
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

// INSTALL EVENT - Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE EVENT - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH EVENT - Serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background update cache if online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            /* Operating offline - keep cached response */
          });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline and navigating to a page, serve root '/' from cache
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

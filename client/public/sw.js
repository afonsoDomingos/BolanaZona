const CACHE_VERSION = 'v5';
const STATIC_CACHE = `bnz-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `bnz-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `bnz-images-${CACHE_VERSION}`;

// Recursos estáticos para cache imediato
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-96.png'
];

// Recursos dinâmicos para cache estratégico
const DYNAMIC_PATTERNS = [
  '/api/notifications',
  '/api/tournaments',
  '/api/squads'
];

// Extensões de imagem
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_URLS)),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE)
    ])
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes(CACHE_VERSION)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar requisições para outros domínios (exceto CDN)
  if (url.origin !== self.location.origin && !url.hostname.includes('cloudinary.com') && !url.hostname.includes('unpkg.com')) {
    return;
  }

  // Estratégia para recursos estáticos: Cache First
  if (STATIC_URLS.some(staticUrl => url.pathname === staticUrl)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) return response;
          return fetch(event.request).then(response => {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          });
        })
    );
    return;
  }

  // Estratégia para imagens: Cache First com stale-while-revalidate
  if (IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            // Atualizar cache em background
            fetch(event.request).then(freshResponse => {
              caches.open(IMAGE_CACHE).then(cache => {
                cache.put(event.request, freshResponse);
              });
            });
            return response;
          }
          return fetch(event.request).then(response => {
            const responseToCache = response.clone();
            caches.open(IMAGE_CACHE)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          });
        })
    );
    return;
  }

  // Estratégia para API: Network First com fallback para cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estratégia padrão: Network First com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

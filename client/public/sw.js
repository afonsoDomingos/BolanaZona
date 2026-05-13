const CACHE_NAME = 'bnz-cache-v2'; // Atualizado para invalidar a cache v1 quebrada
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Força a instalação imediata do novo worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Limpa caches antigos quando o novo service worker toma o controlo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume controlo imediato de todas as janelas abertas
});

// Estratégia "Network First, falling back to cache"
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // Apenas fazer cache de GET requests

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta for válida, atualizar na cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta ir buscar à cache
        return caches.match(event.request);
      })
  );
});

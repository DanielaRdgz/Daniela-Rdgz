// sw-dynamic.js
const CACHE_NAME = 'temperature-dynamic-v1';
const FILES_TO_CACHE = [
  '/',              // página principal
  '/converter.js',
  '/converter.css',
  '/manifest.json',
  '/icon512.png'
];

// --- INSTALACIÓN ---
self.addEventListener('install', event => {
  console.log('[SW-Dynamic] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// --- ACTIVACIÓN ---
self.addEventListener('activate', event => {
  console.log('[SW-Dynamic] Activando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW-Dynamic] Borrando caché vieja:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// --- ESTRATEGIA: NETWORK FIRST ---
self.addEventListener('fetch', event => {
  // Filtrar solo las peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en caché
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Si falla (sin conexión), devolver versión en caché
        return caches.match(event.request);
      })
  );
});


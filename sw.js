// Service Worker for Menu Scanner PWA v2.1.0
var CACHE_NAME = 'menu-scanner-v2.1.0';
var URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Install - cache core files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Caching app shell');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          console.log('Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Skip non-GET and API/proxy requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('anthropic.com')) return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // Cache successful responses
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Offline - serve from cache
      return caches.match(event.request);
    })
  );
});

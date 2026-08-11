var CACHE = 'daily-life-v2';
var ASSETS = ['/', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

// Install: skipWaiting immediately, no blocking cache
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// Activate: claim clients, clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first, cache fallback for offline
self.addEventListener('fetch', function(e) {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Cache a fresh copy in the background
      if (response.ok && response.type === 'basic') {
        var clone = response.clone();
        caches.open(CACHE).then(function(c) {
          c.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Offline: serve from cache
      return caches.match(e.request);
    })
  );
});

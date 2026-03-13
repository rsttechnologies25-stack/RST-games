const CACHE_NAME = 'rexon-games-v2';
const ASSETS = [
  './',
  './index.html',
  './games/',
  './css/style.css',
  './js/main.js',
  './manifest.json',
  './404.html'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Event - Stale-While-Revalidate
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(() => {
          // If both fail, and it's a page request, return 404.html
          if (event.request.mode === 'navigate') {
              return caches.match('./404.html');
          }
      });
      return cachedResponse || fetchPromise;
    })
  );
});

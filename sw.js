const CACHE_NAME = 'rexon-games-v1.9';
const ASSETS = [
    './',
    './index.html',
    './404.html',
    './games/',
    './games/index.html',
    './css/style.css',
    './js/main.js',
    './manifest.json',
    './games/speed-click/index.html',
    './games/typing-test/index.html',
    './games/reaction/index.html',
    './games/tictactoe/index.html',
    './games/3-player-ttt/index.html',
    './games/3-player-ttt/style.css',
    './games/3-player-ttt/script.js',
    './games/memory/index.html',
    './games/number-memory/index.html',
    './games/sequence-recall/index.html',
    './games/quick-math/index.html',
    './games/2048/index.html',
    './games/block-puzzle/index.html',
    './games/aim-trainer/index.html',
    './games/dont-tap-red/index.html',
    './games/odd-one-out/index.html',
    './games/pattern-match/index.html',
    './games/chess/index.html',
    './games/chess/style.css',
    './games/chess/script.js'
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
    let request = event.request;
    const url = new URL(request.url);

    // If request is for a directory, try matching with index.html
    if (url.pathname.endsWith('/')) {
        request = new Request(url.pathname + 'index.html');
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./404.html');
                }
            });
            return cachedResponse || fetchPromise;
        })
    );
});

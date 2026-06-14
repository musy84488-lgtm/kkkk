const CACHE_NAME = 'khatwa-wa-shifa-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/404.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/images/icon.svg',
  '/pages/request.html',
  '/pages/register.html',
  '/pages/track.html',
  '/pages/support.html',
  '/pages/response-time.html',
  '/pages/admin/login.html'
];
const OFFLINE_PAGE = '/offline.html';

// Install — cache static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
});

// Activate — remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — stale-while-revalidate for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Admin pages: network-first (always fresh)
  if (url.pathname.includes('/pages/admin/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // HTML pages: stale-while-revalidate, fallback to offline.html
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() => cached || caches.match(OFFLINE_PAGE));
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // CSS/JS/images: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      });
    })
  );
});

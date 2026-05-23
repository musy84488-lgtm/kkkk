const CACHE_NAME = 'khatwa-wa-shifa-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/index.html',
  '/pages/request.html',
  '/pages/register.html',
  '/pages/support.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

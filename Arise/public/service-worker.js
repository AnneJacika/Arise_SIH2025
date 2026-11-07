// This is a basic service worker for PWA support. VitePWA will generate a more advanced one if configured.
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});


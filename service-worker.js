/* Offline shell for the Sarmad Saeed portfolio.

   Strategy, deliberately simple:
   - Precache the static shell on install.
   - Navigations use network-first, falling back to the cached shell so the
     site still opens offline. This keeps deployed updates visible immediately
     instead of serving a stale page from cache.
   - Same-origin assets use stale-while-revalidate: fast from cache, refreshed
     in the background.
   - Bump CACHE_VERSION whenever the shell changes; older caches are deleted
     on activate.

   Documents and CV files are intentionally not precached — they are large and
   rarely needed offline. They still cache on first use via the asset path. */

const CACHE_VERSION = 'v14-0-0';
const SHELL_CACHE = `portfolio-shell-${CACHE_VERSION}`;

/* Must match the query strings the document actually requests, or the
   precache stores a URL the page never asks for and the two largest assets
   silently fall through to the network. Keep ASSET_REV in step with the
   ?v= values in index.html. */
const ASSET_REV = '14.0.0';

const SHELL_ASSETS = [
  './',
  'index.html',
  ...['tokens','effects','motion','terminal','surfaces','flow','sentinel','responsive','design']
      .map((m) => `assets/css/${m}.css?v=${ASSET_REV}`),
  `assets/js/app.js?v=${ASSET_REV}`,
  'assets/js/project-data.js',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'site.webmanifest',
  '404.html',
  'assets/social-preview.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      // A single missing entry must not block installation.
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('portfolio-shell-') && key !== SHELL_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, cached shell as the offline fallback.
  //
  // `cache: 'no-store'` is load-bearing. A plain fetch(request) consults the
  // browser's HTTP cache, and GitHub Pages serves HTML with max-age=600 — so
  // "network first" would quietly hand back up to ten-minute-old markup and a
  // freshly deployed site would look unchanged. Bypassing the HTTP cache here
  // is what makes a deploy visible immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put('index.html', copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match('index.html').then((cached) => cached || caches.match('./')))
    );
    return;
  }

  // Assets: serve cached immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

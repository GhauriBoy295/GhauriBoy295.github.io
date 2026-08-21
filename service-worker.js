/* Offline shell for the AEGIS NEXUS portfolio.

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

const CACHE_VERSION = 'v25-0-0';
const SHELL_CACHE = `portfolio-shell-${CACHE_VERSION}`;

/* Must match the query strings the document and the module graph actually
   request, or the precache stores URLs the page never asks for and the
   largest assets silently fall through to the network. Keep ASSET_REV in step
   with the ?v= values in index.html and in the import specifiers in app.js. */
const ASSET_REV = '25.0.0';

const CSS_MODULES = ['tokens', 'base', 'shell', 'hero', 'sections', 'missions', 'overlays', 'motion', 'print'];
const JS_MODULES = ['app', 'core', 'globe', 'report', 'boot', 'depth', 'project-data'];

/* Fonts are precached: they are part of the shell, and a swap-in font that
   only arrives online would make the offline copy look different. */
const FONTS = [
  'assets/fonts/space-grotesk-500.woff2',
  'assets/fonts/space-grotesk-700.woff2',
  'assets/fonts/jetbrains-mono-400.woff2'
];

const SHELL_ASSETS = [
  './',
  'index.html',
  ...FONTS,
  ...CSS_MODULES.map((name) => `assets/css/${name}.css?v=${ASSET_REV}`),
  ...JS_MODULES.map((name) => `assets/js/${name}.js?v=${ASSET_REV}`),
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

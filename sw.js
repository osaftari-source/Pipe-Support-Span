const CACHE_NAME = "pipe-support-span-v0-1-2";
const LEGACY_CACHE_TO_AUTO_UPGRADE = "pipe-support-span-v0-1-1";
const ASSETS = [
  "./", "./index.html", "./css/app.css", "./js/data.js", "./js/app.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    await caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS));
    const keys = await caches.keys();

    // One-time bridge: users on v0.1.1 had no in-app update prompt.
    // Only that legacy cache is upgraded immediately without manual hard refresh.
    if (keys.includes(LEGACY_CACHE_TO_AUTO_UPGRADE)) {
      await self.skipWaiting();
    }
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keysBeforeCleanup = await caches.keys();
    const legacyClientPresent = keysBeforeCleanup.includes(LEGACY_CACHE_TO_AUTO_UPGRADE);

    await Promise.all(keysBeforeCleanup.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();

    // Refresh only legacy v0.1.1 clients once. Future versions use the Update now banner.
    if (legacyClientPresent) {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      await Promise.all(windows.map(client => client.navigate(client.url)));
    }
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});

const CACHE_NAME = "pipe-support-survey-v0-1";
const ASSETS = [
  "./", "./index.html", "./css/app.css", "./js/data.js", "./js/app.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});

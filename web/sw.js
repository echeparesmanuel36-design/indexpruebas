const CACHE_NAME = "axiom-qr-factory-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./css/addons.css",
    "./js/utils.js",
    "./js/ui.js",
    "./js/pwa.js",
    "./js/share.js",
    "./js/shortcuts.js",
    "./js/voice.js",
    "./wasm/motor.js",
    "./wasm/motor.wasm",
    "./assets/favicon.png",
    "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

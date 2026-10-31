const CACHE = "meu-ginasio-v3";

const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./squat.jpg",
  "./plank.jpg",
  "./shoulder.jpg",
  "./bike.jpg",
  "./deadlift.jpg",
  "./hipthrust.jpg",
  "./legpress.jpg",
  "./extension.jpg",
  "./curl.jpg",
  "./abductor.jpg"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(FILES.map(file =>
        cache.add(file).catch(() => {})
      ))
    )
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key =>
          key.startsWith("meu-ginasio-") && key !== CACHE
        ).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isPage =
    request.mode === "navigate" ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/");

  if (isPage) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() =>
        caches.match(request).then(cached =>
          cached || caches.match("./index.html")
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request)
    )
  );
});

// Offline-Betrieb: erst Cache, im Hintergrund erneuern (neue Version beim nächsten Öffnen).
const CACHE = "jakob-englisch-20261108113937";
const DATEIEN = ["./", "index.html", "style.css", "daten.js", "app.js", "icon.svg", "manifest.webmanifest"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const treffer = await c.match(e.request, { ignoreSearch: true });
    const netz = fetch(e.request).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => treffer);
    return treffer || netz;
  }));
});

const CACHE = "catatan-keuangan-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Tampilkan dari simpanan HP dulu (offline), lalu perbarui diam-diam jika ada internet
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const jaringan = fetch(req).then(async res => {
    if (res.ok) {
      const salin = res.clone();
      const c = await caches.open(CACHE);
      await c.put(req, salin);
    }
    return res;
  });
  e.waitUntil(jaringan.catch(() => {}));
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(lama => lama || jaringan));
});
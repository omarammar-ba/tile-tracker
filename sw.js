self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      const keys = await caches.keys();

      await Promise.all(
        keys.map(function (key) {
          return caches.delete(key);
        })
      );

      await self.clients.claim();

      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      allClients.forEach(function (client) {
        client.navigate(client.url);
      });
    })()
  );
});
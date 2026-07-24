const CACHE_NAME = "future-artist-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png"
];

// Install Service Worker and cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell and assets");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[Service Worker] Failed to cache some assets during install:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler supporting offline loading
self.addEventListener("fetch", (event) => {
  // Only handle standard GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip bypass for API endpoints or hot reload websockets
  if (url.pathname.startsWith("/api") || url.pathname.includes("hot-update") || url.host.includes("vite")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is document navigation, return cached root/index
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});

// Listen to standard Server Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("[Service Worker] Push event received with no data.");
    return;
  }

  try {
    const payload = event.data.json();
    console.log("[Service Worker] Push payload parsed successfully:", payload);

    const title = payload.title || "Future Artist 🚀";
    const body = payload.message || payload.body || "มีข้อความใหม่ถึงคุณ!";
    const url = payload.url || "/";
    const category = payload.category || "ระบบแจ้งเตือน";

    const options = {
      body: body,
      icon: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png",
      badge: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png",
      vibrate: [100, 50, 100],
      data: {
        url: url,
        category: category
      },
      actions: [
        { action: "explore", title: "เปิดดูแอปพลิเคชัน" }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(`[${category}] ${title}`, options)
    );
  } catch (err) {
    console.warn("[Service Worker] Push payload is not JSON. Falling back to plain text:", err);
    const textPayload = event.data.text();

    event.waitUntil(
      self.registration.showNotification("Future Artist 🚀", {
        body: textPayload,
        icon: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png",
        badge: "https://i.ibb.co/YBKDbPR7/Chat-GPT-Image-21-2569-16-58-02.png",
        data: { url: "/" }
      })
    );
  }
});

// Handle clicking on notifications (deep link inside PWA)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Find if there is already an open window
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientUrl = new URL(client.url);
        const targetUrlObj = new URL(targetUrl, clientUrl.origin);

        // Match base hosts
        if (clientUrl.origin === targetUrlObj.origin) {
          if (client.navigate) {
            client.navigate(targetUrl).catch(() => {});
          }
          if (client.postMessage) {
            client.postMessage({ type: "NAVIGATE_TAB", url: targetUrl });
          }
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

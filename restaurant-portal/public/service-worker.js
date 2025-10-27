// Service Worker for Khapey Restaurant App
const CACHE_NAME = "khapey-cache-v1";
const OFFLINE_URL = "/offline";

// Assets to cache on install
const ASSETS_TO_CACHE = [
  "/",
  "/dashboard",
  "/reviews",
  "/reporting",
  "/discounts",
  "/offline",
  "/login",
  // Add critical CSS and JS files
  "/globals.css",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // console.log("Opened cache")
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip browser-sync and chrome-extension requests
  if (
    event.request.url.includes("browser-sync") ||
    event.request.url.includes("chrome-extension")
  )
    return;

  // Handle API requests differently
  if (event.request.url.includes("/api/")) {
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // For navigation requests, use a different strategy
    if (event.request.mode === "navigate") {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match(OFFLINE_URL);
        })
      );
    } else {
      // For other requests (assets, etc.), use cache-first strategy
      event.respondWith(cacheFirstStrategy(event.request));
    }
  }
});

// Cache-first strategy for assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return offline page for navigation
    if (request.mode === "navigate") {
      return caches.match(OFFLINE_URL);
    }
    throw error;
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache successful API responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Background sync event handler
self.addEventListener("sync", (event) => {
  console.log(`Sync event received: ${event.tag}`);

  if (event.tag.startsWith("sync:")) {
    event.waitUntil(processSyncEvent(event.tag));
  }
});

// Process sync events
async function processSyncEvent(tag) {
  try {
    // Open the database
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("KhapeyDB", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Get pending sync items
    const syncItems = await new Promise((resolve, reject) => {
      const transaction = db.transaction("syncQueue", "readonly");
      const store = transaction.objectStore("syncQueue");
      const index = store.index("tag");
      const request = index.getAll(tag.replace("sync:", ""));

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    console.log(`Processing ${syncItems.length} items for tag ${tag}`);

    // Process each sync item
    for (const item of syncItems) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove the successful sync from the queue
        await new Promise((resolve, reject) => {
          const transaction = db.transaction("syncQueue", "readwrite");
          const store = transaction.objectStore("syncQueue");
          const request = store.delete(item.id);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        console.log(`Successfully processed sync item ${item.id}`);
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error);
        // Leave failed syncs in the queue to try again later
      }
    }

    // Notify clients about the sync completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETED",
        tag: tag,
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error(`Error in processSyncEvent for tag ${tag}:`, error);
  }
}

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

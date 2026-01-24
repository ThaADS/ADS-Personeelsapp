/**
 * ADSPersoneelapp Service Worker
 * Provides offline support and caching for PWA functionality
 */

const CACHE_NAME = 'ads-personeelapp-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache offline page first
      await cache.addAll(PRECACHE_ASSETS.filter(url => url === '/offline'));
      // Try to cache other assets but don't fail if they're not available
      for (const asset of PRECACHE_ASSETS.filter(url => url !== '/offline')) {
        try {
          await cache.add(asset);
        } catch (error) {
          console.log(`Failed to cache ${asset}:`, error);
        }
      }
      // Force the waiting service worker to become active
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Take control of all pages immediately
      self.clients.claim();
    })()
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);

        // Cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's a navigation request, show offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        // Return a basic offline response
        return new Response('Offline - Geen verbinding beschikbaar', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain; charset=utf-8',
          }),
        });
      }
    })()
  );
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nieuwe melding van ADSPersoneelapp',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: 'Openen' },
      { action: 'close', title: 'Sluiten' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ADSPersoneelapp', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open a new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline form submissions (future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-timesheets') {
    event.waitUntil(syncTimesheets());
  }
});

async function syncTimesheets() {
  // Future: sync offline timesheet entries when back online
  console.log('Syncing timesheets...');
}

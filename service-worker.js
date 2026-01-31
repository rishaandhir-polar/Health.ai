// Health AI Service Worker
// Version 1.1.0 (Auto-Update Enabled)

const CACHE_NAME = 'health-ai-v2'; // Bumped version to force update
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './ai.js',
    './sound-engine.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Inter:wght@400;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache all resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing v2...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting(); // Force the waiting service worker to become the active one
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating v2...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // Take control of all clients immediately
        })
    );
});

// Fetch event - STALE-WHILE-REVALIDATE Strategy
// 1. Serve from cache immediately
// 2. Fetch from network in background
// 3. Update cache with fresh version
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and external chrome extensions
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://fonts') && !event.request.url.startsWith('https://cdnjs')) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    // Update cache with the new response
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // If network fails, we already have the cache (if it exists)
                });

                // Return cached response immediately, or wait for network if not in cache
                return cachedResponse || fetchedResponse;
            });
        })
    );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

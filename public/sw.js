// PrinceTS Service Worker for offline caching
const CACHE_NAME = 'prince-ts-v1';
const STATIC_CACHE = 'prince-ts-static-v1';
const DYNAMIC_CACHE = 'prince-ts-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/dist/main.js',
    '/dist/engine/Renderer.js',
    '/dist/engine/GameEngine.js',
    '/dist/engine/InputHandler.js',
    '/dist/engine/PhysicsEngine.js',
    '/dist/engine/CollisionSystem.js',
    '/dist/engine/AnimationController.js',
    '/dist/engine/StateMachine.js',
    '/dist/engine/GameLoop.js',
    '/dist/engine/Entity.js',
    '/dist/engine/GamePackLoader.js',
    '/dist/engine/GamePack.js',
    '/dist/engine/PauseManager.js',
    '/dist/dev/CheatManager.js',
    '/dist/dev/FreeCamera.js',
    '/dist/dev/DebugOverlay.js',
    '/dist/engine/PlatformConfig.js',
    '/dist/engine/Constants.js',
    '/dist/engine/types.js',
    '/dist/engine/Vector2.js',
    '/dist/engine/State.js',
    '/dist/engine/GameState.js',
    '/dist/engine/PlayState.js',
    '/dist/engine/AudioManager.js',
    '/dist/engine/SaveManager.js',
    '/dist/engine/SettingsStore.js',
    '/dist/ui/PiMenu.js',
    '/dist/ui/GameLibrary.js',
    '/dist/ui/PlatformSelector.js',
    '/dist/ui/SettingsMenu.js',
    '/dist/engine/assets/VFS.js',
    '/dist/engine/boot/boot.js',
    '/dist/engine/boot/BootConfig.js',
    '/dist/engine/input/Gamepad.js',
    '/dist/engine/input/InputMap.js',
    '/dist/engine/db/IDB.js',
    '/dist/engine/save/SaveSystem.js',
    '/dist/engine/save/SaveTypes.js',
    '/dist/engine/library/LibraryManager.js',
    '/dist/engine/AnimationController.js',
    '/dist/engine/CollisionSystem.js',
    '/dist/engine/Constants.js',
    '/dist/engine/Entity.js',
    '/dist/engine/GameEngine.js',
    '/dist/engine/GameLoop.js',
    '/dist/engine/GamePack.js',
    '/dist/engine/GamePackLoader.js',
    '/dist/engine/InputHandler.js',
    '/dist/engine/PauseManager.js',
    '/dist/engine/PhysicsEngine.js',
    '/dist/engine/PlatformConfig.js',
    '/dist/engine/Renderer.js',
    '/dist/engine/State.js',
    '/dist/engine/StateMachine.js',
    '/dist/engine/types.js',
    '/dist/engine/Vector2.js',
    '/dist/main.js',
    '/dist/states/GameState.js',
    '/dist/states/PlayState.js',
    '/dist/ui/GameLibrary.js',
    '/dist/ui/PiMenu.js',
    '/dist/ui/PlatformSelector.js',
    '/dist/ui/SettingsMenu.js',
    '/manifest.json',
    '/packs/manifest.json',
    '/packs/example.ptspack.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request.url)) {
        // Static assets - cache first strategy
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isGamePack(request.url)) {
        // Game packs - cache first strategy
        event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    } else if (isAPIRequest(request.url)) {
        // API requests - network first strategy
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else {
        // Other requests - network first strategy
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Cache first failed:', error);
        return new Response('Offline content not available', { status: 503 });
    }
}

// Network first strategy
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Offline content not available', { status: 503 });
    }
}

// Helper functions to determine request type
function isStaticAsset(url) {
    const staticExtensions = ['.js', '.css', '.html', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
    const staticPaths = ['/dist/', '/styles.css', '/index.html', '/manifest.json'];
    
    return staticExtensions.some(ext => url.includes(ext)) ||
           staticPaths.some(path => url.includes(path)) ||
           url === self.location.origin + '/';
}

function isGamePack(url) {
    return url.includes('.ptspack') || url.includes('/packs/');
}

function isAPIRequest(url) {
    return url.includes('/api/') || url.includes('?') || url.includes('&');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Perform background sync tasks
        console.log('Service Worker: Performing background sync');
        
        // Example: Sync saved game data
        // await syncGameData();
        
    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
    }
}

// Push notifications (optional)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open Game',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('PrinceTS', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        event.ports[0].postMessage({
            type: 'CACHE_INFO',
            staticCache: STATIC_CACHE,
            dynamicCache: DYNAMIC_CACHE
        });
    }
});

console.log('Service Worker: Loaded successfully'); 
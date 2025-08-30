export interface ServiceWorkerConfig {
    enabled: boolean;
    cacheStaticAssets: boolean;
    cacheGamePacks: boolean;
    cacheBuiltIns: boolean;
    cacheInstalledPacks: boolean;
    backgroundSync: boolean;
    pushNotifications: boolean;
    cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    maxCacheSize: number; // in MB
    cacheExpiration: number; // in days
}

export class ServiceWorkerManager {
    private registration: ServiceWorkerRegistration | null = null;
    private config: ServiceWorkerConfig = {
        enabled: true,
        cacheStaticAssets: true,
        cacheGamePacks: true,
        cacheBuiltIns: true,
        cacheInstalledPacks: true,
        backgroundSync: false,
        pushNotifications: false,
        cacheStrategy: 'cache-first',
        maxCacheSize: 100, // 100MB
        cacheExpiration: 30 // 30 days
    };

    // Cache management
    private static readonly CACHE_NAMES = {
        STATIC: 'prince-ts-static-v2',
        DYNAMIC: 'prince-ts-dynamic-v2',
        BUILTINS: 'prince-ts-builtins-v2',
        INSTALLED: 'prince-ts-installed-v2',
        GAME_PACKS: 'prince-ts-gamepacks-v2'
    };

    constructor(config?: Partial<ServiceWorkerConfig>) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }

    public async register(): Promise<boolean> {
        if (!this.config.enabled) {
            console.log('Service Worker: Disabled by configuration');
            return false;
        }

        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker: Not supported in this browser');
            return false;
        }

        try {
            console.log('Service Worker: Registering...');
            
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            });

            console.log('Service Worker: Registered successfully', this.registration);

            // Handle updates
            this.registration.addEventListener('updatefound', () => {
                console.log('Service Worker: Update found');
                this.handleUpdate();
            });

            // Handle controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker: Controller changed');
                this.handleControllerChange();
            });

            // Handle messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleMessage(event);
            });

            return true;
        } catch (error) {
            console.error('Service Worker: Registration failed:', error);
            return false;
        }
    }

    public async unregister(): Promise<boolean> {
        if (!this.registration) {
            return false;
        }

        try {
            const result = await this.registration.unregister();
            console.log('Service Worker: Unregistered successfully');
            this.registration = null;
            return result;
        } catch (error) {
            console.error('Service Worker: Unregistration failed:', error);
            return false;
        }
    }

    public async update(): Promise<void> {
        if (!this.registration) {
            console.warn('Service Worker: No registration to update');
            return;
        }

        try {
            await this.registration.update();
            console.log('Service Worker: Update requested');
        } catch (error) {
            console.error('Service Worker: Update failed:', error);
        }
    }

    public async skipWaiting(): Promise<void> {
        if (!this.registration || !this.registration.waiting) {
            return;
        }

        try {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            console.log('Service Worker: Skip waiting message sent');
        } catch (error) {
            console.error('Service Worker: Skip waiting failed:', error);
        }
    }

    // Enhanced cache management
    public async cacheBuiltInPacks(packs: string[]): Promise<boolean> {
        if (!this.config.cacheBuiltIns || !this.registration) {
            return false;
        }

        try {
            const cache = await caches.open(ServiceWorkerManager.CACHE_NAMES.BUILTINS);
            const cachePromises = packs.map(async (packUrl) => {
                try {
                    const response = await fetch(packUrl);
                    if (response.ok) {
                        await cache.put(packUrl, response.clone());
                        console.log(`ServiceWorker: Cached built-in pack: ${packUrl}`);
                    }
                } catch (error) {
                    console.warn(`ServiceWorker: Failed to cache built-in pack: ${packUrl}`, error);
                }
            });

            await Promise.all(cachePromises);
            console.log(`ServiceWorker: Cached ${packs.length} built-in packs`);
            return true;
        } catch (error) {
            console.error('ServiceWorker: Failed to cache built-in packs:', error);
            return false;
        }
    }

    public async cacheInstalledPack(packUrl: string, packData: any): Promise<boolean> {
        if (!this.config.cacheInstalledPacks || !this.registration) {
            return false;
        }

        try {
            const cache = await caches.open(ServiceWorkerManager.CACHE_NAMES.INSTALLED);
            
            // Cache the pack file
            const packResponse = await fetch(packUrl);
            if (packResponse.ok) {
                await cache.put(packUrl, packResponse.clone());
            }

            // Cache pack metadata
            const metadataUrl = `${packUrl}.metadata`;
            const metadataResponse = new Response(JSON.stringify(packData), {
                headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(metadataUrl, metadataResponse);

            console.log(`ServiceWorker: Cached installed pack: ${packUrl}`);
            return true;
        } catch (error) {
            console.error(`ServiceWorker: Failed to cache installed pack: ${packUrl}`, error);
            return false;
        }
    }

    public async removeInstalledPack(packUrl: string): Promise<boolean> {
        if (!this.registration) return false;

        try {
            const cache = await caches.open(ServiceWorkerManager.CACHE_NAMES.INSTALLED);
            await cache.delete(packUrl);
            await cache.delete(`${packUrl}.metadata`);
            console.log(`ServiceWorker: Removed installed pack from cache: ${packUrl}`);
            return true;
        } catch (error) {
            console.error(`ServiceWorker: Failed to remove installed pack: ${packUrl}`, error);
            return false;
        }
    }

    public async getCacheInfo(): Promise<{
        staticSize: number;
        dynamicSize: number;
        builtinsSize: number;
        installedSize: number;
        gamePacksSize: number;
        totalSize: number;
        cacheNames: string[];
    }> {
        const cacheNames = Object.values(ServiceWorkerManager.CACHE_NAMES);
        const sizes: Record<string, number> = {};

        for (const cacheName of cacheNames) {
            try {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                let size = 0;

                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.blob();
                        size += blob.size;
                    }
                }

                sizes[cacheName] = size;
            } catch (error) {
                console.warn(`ServiceWorker: Failed to get cache size for ${cacheName}:`, error);
                sizes[cacheName] = 0;
            }
        }

        const totalSize = Object.values(sizes).reduce((sum, size) => sum + size, 0);

        return {
            staticSize: sizes[ServiceWorkerManager.CACHE_NAMES.STATIC] || 0,
            dynamicSize: sizes[ServiceWorkerManager.CACHE_NAMES.DYNAMIC] || 0,
            builtinsSize: sizes[ServiceWorkerManager.CACHE_NAMES.BUILTINS] || 0,
            installedSize: sizes[ServiceWorkerManager.CACHE_NAMES.INSTALLED] || 0,
            gamePacksSize: sizes[ServiceWorkerManager.CACHE_NAMES.GAME_PACKS] || 0,
            totalSize,
            cacheNames
        };
    }

    public async clearExpiredCache(): Promise<boolean> {
        if (!this.registration) return false;

        try {
            const cacheNames = Object.values(ServiceWorkerManager.CACHE_NAMES);
            const expirationTime = Date.now() - (this.config.cacheExpiration * 24 * 60 * 60 * 1000);

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();

                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const dateHeader = response.headers.get('date');
                        if (dateHeader) {
                            const responseTime = new Date(dateHeader).getTime();
                            if (responseTime < expirationTime) {
                                await cache.delete(request);
                                console.log(`ServiceWorker: Removed expired cache entry: ${request.url}`);
                            }
                        }
                    }
                }
            }

            console.log('ServiceWorker: Cleared expired cache entries');
            return true;
        } catch (error) {
            console.error('ServiceWorker: Failed to clear expired cache:', error);
            return false;
        }
    }

    public async enforceCacheSizeLimit(): Promise<boolean> {
        if (!this.registration) return false;

        try {
            const cacheInfo = await this.getCacheInfo();
            const maxSizeBytes = this.config.maxCacheSize * 1024 * 1024; // Convert MB to bytes

            if (cacheInfo.totalSize > maxSizeBytes) {
                console.log(`ServiceWorker: Cache size (${cacheInfo.totalSize} bytes) exceeds limit (${maxSizeBytes} bytes), cleaning up...`);
                
                // Clear oldest caches first (dynamic, then installed, then game packs)
                const cachePriority = [
                    ServiceWorkerManager.CACHE_NAMES.DYNAMIC,
                    ServiceWorkerManager.CACHE_NAMES.INSTALLED,
                    ServiceWorkerManager.CACHE_NAMES.GAME_PACKS,
                    ServiceWorkerManager.CACHE_NAMES.BUILTINS,
                    ServiceWorkerManager.CACHE_NAMES.STATIC
                ];

                for (const cacheName of cachePriority) {
                    await caches.delete(cacheName);
                    console.log(`ServiceWorker: Cleared cache: ${cacheName}`);
                    
                    // Check if we're under the limit now
                    const newCacheInfo = await this.getCacheInfo();
                    if (newCacheInfo.totalSize <= maxSizeBytes) {
                        break;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('ServiceWorker: Failed to enforce cache size limit:', error);
            return false;
        }
    }

    public async clearCache(): Promise<void> {
        if (!this.registration) {
            return;
        }

        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Service Worker: Cache cleared successfully');
        } catch (error) {
            console.error('Service Worker: Cache clear failed:', error);
        }
    }

    public async requestNotificationPermission(): Promise<NotificationPermission> {
        if (!this.config.pushNotifications) {
            return 'denied';
        }

        if (!('Notification' in window)) {
            console.warn('Service Worker: Notifications not supported');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            console.log('Service Worker: Notification permission:', permission);
            return permission;
        } catch (error) {
            console.error('Service Worker: Notification permission request failed:', error);
            return 'denied';
        }
    }

    public async subscribeToPush(): Promise<PushSubscription | null> {
        if (!this.registration || !this.config.pushNotifications) {
            return null;
        }

        const permission = await this.requestNotificationPermission();
        if (permission !== 'granted') {
            return null;
        }

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY') as unknown as ArrayBuffer
            });

            console.log('Service Worker: Push subscription created:', subscription);
            return subscription;
        } catch (error) {
            console.error('Service Worker: Push subscription failed:', error);
            return null;
        }
    }

    public async unsubscribeFromPush(): Promise<boolean> {
        if (!this.registration) {
            return false;
        }

        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                console.log('Service Worker: Push subscription removed');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Service Worker: Push unsubscription failed:', error);
            return false;
        }
    }

    public isSupported(): boolean {
        return 'serviceWorker' in navigator;
    }

    public isRegistered(): boolean {
        return this.registration !== null;
    }

    public isControlled(): boolean {
        return !!navigator.serviceWorker.controller;
    }

    public getRegistration(): ServiceWorkerRegistration | null {
        return this.registration;
    }

    public getConfig(): ServiceWorkerConfig {
        return { ...this.config };
    }

    public updateConfig(config: Partial<ServiceWorkerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    private handleUpdate(): void {
        if (!this.registration) return;

        const newWorker = this.registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed and ready
                console.log('Service Worker: New version available');
                this.showUpdateNotification();
            }
        });
    }

    private handleControllerChange(): void {
        console.log('Service Worker: New service worker activated');
        // Reload the page to use the new service worker
        window.location.reload();
    }

    private handleMessage(event: MessageEvent): void {
        console.log('Service Worker: Message received from service worker:', event.data);
        
        // Handle different message types
        switch (event.data.type) {
            case 'CACHE_UPDATED':
                console.log('Service Worker: Cache updated');
                break;
            case 'BACKGROUND_SYNC':
                console.log('Service Worker: Background sync completed');
                break;
            default:
                console.log('Service Worker: Unknown message type:', event.data.type);
        }
    }

    private showUpdateNotification(): void {
        // Show a notification to the user about the update
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('PrinceTS Update', {
                body: 'A new version is available. Click to update.',
                icon: '/icon-192x192.png',
                requireInteraction: true
            });
        }

        // Or show an in-app notification
        this.showInAppUpdateNotification();
    }

    private showInAppUpdateNotification(): void {
        // Create a notification element in the app
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <strong>Update Available</strong><br>
            A new version of PrinceTS is ready. Click to update.
        `;
        
        notification.addEventListener('click', () => {
            this.skipWaiting();
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
} 
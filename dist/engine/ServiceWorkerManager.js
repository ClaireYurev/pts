export class ServiceWorkerManager {
    constructor(config) {
        this.registration = null;
        this.config = {
            enabled: true,
            cacheStaticAssets: true,
            cacheGamePacks: true,
            backgroundSync: false,
            pushNotifications: false
        };
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }
    async register() {
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
        }
        catch (error) {
            console.error('Service Worker: Registration failed:', error);
            return false;
        }
    }
    async unregister() {
        if (!this.registration) {
            return false;
        }
        try {
            const result = await this.registration.unregister();
            console.log('Service Worker: Unregistered successfully');
            this.registration = null;
            return result;
        }
        catch (error) {
            console.error('Service Worker: Unregistration failed:', error);
            return false;
        }
    }
    async update() {
        if (!this.registration) {
            console.warn('Service Worker: No registration to update');
            return;
        }
        try {
            await this.registration.update();
            console.log('Service Worker: Update requested');
        }
        catch (error) {
            console.error('Service Worker: Update failed:', error);
        }
    }
    async skipWaiting() {
        if (!this.registration || !this.registration.waiting) {
            return;
        }
        try {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            console.log('Service Worker: Skip waiting message sent');
        }
        catch (error) {
            console.error('Service Worker: Skip waiting failed:', error);
        }
    }
    async getCacheInfo() {
        return new Promise((resolve) => {
            if (!navigator.serviceWorker.controller) {
                resolve(null);
                return;
            }
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                resolve(event.data);
            };
            navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_INFO' }, [channel.port2]);
        });
    }
    async clearCache() {
        if (!this.registration) {
            return;
        }
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            console.log('Service Worker: Cache cleared successfully');
        }
        catch (error) {
            console.error('Service Worker: Cache clear failed:', error);
        }
    }
    async requestNotificationPermission() {
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
        }
        catch (error) {
            console.error('Service Worker: Notification permission request failed:', error);
            return 'denied';
        }
    }
    async subscribeToPush() {
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
                applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
            });
            console.log('Service Worker: Push subscription created:', subscription);
            return subscription;
        }
        catch (error) {
            console.error('Service Worker: Push subscription failed:', error);
            return null;
        }
    }
    async unsubscribeFromPush() {
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
        }
        catch (error) {
            console.error('Service Worker: Push unsubscription failed:', error);
            return false;
        }
    }
    isSupported() {
        return 'serviceWorker' in navigator;
    }
    isRegistered() {
        return this.registration !== null;
    }
    isControlled() {
        return !!navigator.serviceWorker.controller;
    }
    getRegistration() {
        return this.registration;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    handleUpdate() {
        if (!this.registration)
            return;
        const newWorker = this.registration.installing;
        if (!newWorker)
            return;
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is installed and ready
                console.log('Service Worker: New version available');
                this.showUpdateNotification();
            }
        });
    }
    handleControllerChange() {
        console.log('Service Worker: New service worker activated');
        // Reload the page to use the new service worker
        window.location.reload();
    }
    handleMessage(event) {
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
    showUpdateNotification() {
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
    showInAppUpdateNotification() {
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
    urlBase64ToUint8Array(base64String) {
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
//# sourceMappingURL=ServiceWorkerManager.js.map
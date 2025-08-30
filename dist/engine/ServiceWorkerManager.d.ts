export interface ServiceWorkerConfig {
    enabled: boolean;
    cacheStaticAssets: boolean;
    cacheGamePacks: boolean;
    backgroundSync: boolean;
    pushNotifications: boolean;
}
export declare class ServiceWorkerManager {
    private registration;
    private config;
    constructor(config?: Partial<ServiceWorkerConfig>);
    register(): Promise<boolean>;
    unregister(): Promise<boolean>;
    update(): Promise<void>;
    skipWaiting(): Promise<void>;
    getCacheInfo(): Promise<any>;
    clearCache(): Promise<void>;
    requestNotificationPermission(): Promise<NotificationPermission>;
    subscribeToPush(): Promise<PushSubscription | null>;
    unsubscribeFromPush(): Promise<boolean>;
    isSupported(): boolean;
    isRegistered(): boolean;
    isControlled(): boolean;
    getRegistration(): ServiceWorkerRegistration | null;
    getConfig(): ServiceWorkerConfig;
    updateConfig(config: Partial<ServiceWorkerConfig>): void;
    private handleUpdate;
    private handleControllerChange;
    private handleMessage;
    private showUpdateNotification;
    private showInAppUpdateNotification;
    private urlBase64ToUint8Array;
}
//# sourceMappingURL=ServiceWorkerManager.d.ts.map
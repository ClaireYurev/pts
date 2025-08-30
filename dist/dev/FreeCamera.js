export class FreeCamera {
    constructor() {
        this._isEnabled = false;
        this.isActive = false;
        this.keys = new Set();
        this.targetEntity = null;
        this.state = {
            x: 0,
            y: 0,
            zoom: 1.0,
            targetX: 0,
            targetY: 0,
            isFollowing: true
        };
        this.config = {
            panSpeed: 200, // pixels per second
            zoomSpeed: 0.1,
            maxZoom: 3.0,
            minZoom: 0.5,
            smoothFollow: true,
            followSpeed: 5.0
        };
        this.setupInputHandling();
    }
    /**
     * Enable/disable free camera
     */
    setEnabled(enabled) {
        this._isEnabled = enabled;
        if (!enabled) {
            this.isActive = false;
            this.keys.clear();
        }
    }
    /**
     * Get enabled state
     */
    isEnabled() {
        return this._isEnabled;
    }
    /**
     * Toggle free camera mode
     */
    toggle() {
        if (this._isEnabled) {
            this.isActive = !this.isActive;
            if (this.isActive) {
                console.log('Free camera activated');
            }
            else {
                console.log('Free camera deactivated');
                this.state.isFollowing = true;
            }
        }
    }
    /**
     * Update camera position and state
     */
    update(deltaTime) {
        if (!this.isEnabled || !this.isActive) {
            return;
        }
        // Handle keyboard input for camera movement
        this.handleKeyboardInput(deltaTime);
        // Handle mouse input for camera movement (if needed)
        this.handleMouseInput();
        // Apply zoom constraints
        this.state.zoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, this.state.zoom));
    }
    /**
     * Set camera position
     */
    setPosition(x, y) {
        this.state.x = x;
        this.state.y = y;
        this.state.targetX = x;
        this.state.targetY = y;
    }
    /**
     * Set camera zoom
     */
    setZoom(zoom) {
        this.state.zoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, zoom));
    }
    /**
     * Set target entity for following
     */
    setTarget(entity) {
        this.targetEntity = entity;
    }
    /**
     * Get current camera state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get camera position
     */
    getPosition() {
        return { x: this.state.x, y: this.state.y };
    }
    /**
     * Get camera zoom
     */
    getZoom() {
        return this.state.zoom;
    }
    /**
     * Check if free camera is active
     */
    isFreeCameraActive() {
        return this._isEnabled && this.isActive;
    }
    /**
     * Check if camera should follow target
     */
    shouldFollowTarget() {
        return !this.isActive && this.state.isFollowing;
    }
    /**
     * Update camera to follow target entity
     */
    updateFollowTarget(deltaTime) {
        if (!this.shouldFollowTarget() || !this.targetEntity) {
            return;
        }
        const targetX = this.targetEntity.position?.x || this.targetEntity.x || 0;
        const targetY = this.targetEntity.position?.y || this.targetEntity.y || 0;
        if (this.config.smoothFollow) {
            // Smooth follow with interpolation
            const followSpeed = this.config.followSpeed * deltaTime;
            this.state.x += (targetX - this.state.x) * followSpeed;
            this.state.y += (targetY - this.state.y) * followSpeed;
        }
        else {
            // Direct follow
            this.state.x = targetX;
            this.state.y = targetY;
        }
    }
    /**
     * Handle keyboard input for camera movement
     */
    handleKeyboardInput(deltaTime) {
        const panDistance = this.config.panSpeed * deltaTime;
        // WASD movement
        if (this.keys.has('w') || this.keys.has('W') || this.keys.has('ArrowUp')) {
            this.state.y -= panDistance;
        }
        if (this.keys.has('s') || this.keys.has('S') || this.keys.has('ArrowDown')) {
            this.state.y += panDistance;
        }
        if (this.keys.has('a') || this.keys.has('A') || this.keys.has('ArrowLeft')) {
            this.state.x -= panDistance;
        }
        if (this.keys.has('d') || this.keys.has('D') || this.keys.has('ArrowRight')) {
            this.state.x += panDistance;
        }
        // Zoom controls
        if (this.keys.has('q') || this.keys.has('Q')) {
            this.state.zoom -= this.config.zoomSpeed;
        }
        if (this.keys.has('e') || this.keys.has('E')) {
            this.state.zoom += this.config.zoomSpeed;
        }
        // Reset camera
        if (this.keys.has('r') || this.keys.has('R')) {
            this.resetCamera();
        }
        // Center on target
        if (this.keys.has('c') || this.keys.has('C')) {
            this.centerOnTarget();
        }
    }
    /**
     * Handle mouse input for camera movement
     */
    handleMouseInput() {
        // Mouse wheel zoom
        document.addEventListener('wheel', (e) => {
            if (!this.isActive)
                return;
            e.preventDefault();
            const zoomDelta = e.deltaY > 0 ? -this.config.zoomSpeed : this.config.zoomSpeed;
            this.state.zoom += zoomDelta;
        }, { passive: false });
        // Middle mouse button drag for panning
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        document.addEventListener('mousedown', (e) => {
            if (!this.isActive || e.button !== 1)
                return; // Middle mouse button
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive || !isDragging)
                return;
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            this.state.x -= deltaX / this.state.zoom;
            this.state.y -= deltaY / this.state.zoom;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            e.preventDefault();
        });
        document.addEventListener('mouseup', (e) => {
            if (e.button === 1) {
                isDragging = false;
            }
        });
    }
    /**
     * Setup input handling
     */
    setupInputHandling() {
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled)
                return;
            // Toggle free camera with Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.toggle();
                return;
            }
            if (this.isActive) {
                this.keys.add(e.key);
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
        // Prevent default behavior for camera keys when active
        document.addEventListener('keydown', (e) => {
            if (this.isActive && this.isCameraKey(e.key)) {
                e.preventDefault();
            }
        });
    }
    /**
     * Check if key is used for camera control
     */
    isCameraKey(key) {
        const cameraKeys = ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'q', 'Q', 'e', 'E', 'r', 'R', 'c', 'C', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        return cameraKeys.includes(key);
    }
    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.state.x = 0;
        this.state.y = 0;
        this.state.zoom = 1.0;
        console.log('Camera reset to origin');
    }
    /**
     * Center camera on target entity
     */
    centerOnTarget() {
        if (!this.targetEntity) {
            console.log('No target entity to center on');
            return;
        }
        const targetX = this.targetEntity.position?.x || this.targetEntity.x || 0;
        const targetY = this.targetEntity.position?.y || this.targetEntity.y || 0;
        this.state.x = targetX;
        this.state.y = targetY;
        console.log('Camera centered on target');
    }
    /**
     * Get camera configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Set camera configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Get camera bounds (useful for UI positioning)
     */
    getCameraBounds() {
        // This would depend on the viewport size
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const halfWidth = viewportWidth / (2 * this.state.zoom);
        const halfHeight = viewportHeight / (2 * this.state.zoom);
        return {
            left: this.state.x - halfWidth,
            right: this.state.x + halfWidth,
            top: this.state.y - halfHeight,
            bottom: this.state.y + halfHeight
        };
    }
    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const worldX = (screenX - viewportWidth / 2) / this.state.zoom + this.state.x;
        const worldY = (screenY - viewportHeight / 2) / this.state.zoom + this.state.y;
        return { x: worldX, y: worldY };
    }
    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const screenX = (worldX - this.state.x) * this.state.zoom + viewportWidth / 2;
        const screenY = (worldY - this.state.y) * this.state.zoom + viewportHeight / 2;
        return { x: screenX, y: screenY };
    }
}
//# sourceMappingURL=FreeCamera.js.map
export class FreeCamera {
    constructor(renderer) {
        this.renderer = renderer;
        this.enabled = false;
        this.camX = 0;
        this.camY = 0;
        this.speed = 300;
        this.sprintMultiplier = 3;
    }
    update(input, dt) {
        if (!this.enabled)
            return;
        let dx = 0, dy = 0;
        const currentSpeed = this.speed * (input.isKeyDown("ShiftLeft") ? this.sprintMultiplier : 1);
        // Numpad controls: 4=left, 6=right, 8=up, 2=down
        if (input.isKeyDown("Numpad4"))
            dx -= currentSpeed * dt;
        if (input.isKeyDown("Numpad6"))
            dx += currentSpeed * dt;
        if (input.isKeyDown("Numpad8"))
            dy -= currentSpeed * dt;
        if (input.isKeyDown("Numpad2"))
            dy += currentSpeed * dt;
        this.camX += dx;
        this.camY += dy;
        this.renderer.setCamera(this.camX, this.camY);
    }
    toggle() {
        this.enabled = !this.enabled;
        console.log(`Free camera ${this.enabled ? 'enabled' : 'disabled'}`);
    }
    setPosition(x, y) {
        this.camX = x;
        this.camY = y;
        this.renderer.setCamera(this.camX, this.camY);
    }
    getPosition() {
        return { x: this.camX, y: this.camY };
    }
    resetToPlayer(playerX, playerY, canvasWidth, canvasHeight) {
        this.camX = playerX - canvasWidth / 2;
        this.camY = playerY - canvasHeight / 2;
        this.renderer.setCamera(this.camX, this.camY);
    }
}
//# sourceMappingURL=FreeCamera.js.map
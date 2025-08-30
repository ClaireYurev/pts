export class GameState {
    constructor(engine) {
        this.engine = engine;
    }
    enter() {
        console.log(`Entering state: ${this.name}`);
    }
    exit() {
        console.log(`Exiting state: ${this.name}`);
    }
    update(dt) {
        // Override in subclasses
    }
    handleInput(input) {
        // Handle F key for FPS toggle
        if (input.isKeyPressed("KeyF")) {
            this.engine.toggleFPSDisplay();
        }
    }
}
//# sourceMappingURL=GameState.js.map
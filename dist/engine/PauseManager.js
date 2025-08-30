export class PauseManager {
    constructor() {
        this.isPaused = false;
    }
    pause() {
        this.isPaused = true;
        console.log("Game paused");
    }
    resume() {
        this.isPaused = false;
        console.log("Game resumed");
    }
    toggle() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? "Game paused" : "Game resumed");
    }
    getPausedState() {
        return this.isPaused;
    }
}
//# sourceMappingURL=PauseManager.js.map
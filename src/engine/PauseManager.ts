export class PauseManager {
    public isPaused = false;

    public pause(): void {
        this.isPaused = true;
        console.log("Game paused");
    }

    public resume(): void {
        this.isPaused = false;
        console.log("Game resumed");
    }

    public toggle(): void {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? "Game paused" : "Game resumed");
    }

    public getPausedState(): boolean {
        return this.isPaused;
    }
} 
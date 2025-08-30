import { State } from "../engine/State.js";
import { InputHandler } from "../engine/InputHandler.js";
import { GameEngine } from "../engine/GameEngine.js";

export abstract class GameState implements State {
    constructor(protected engine: GameEngine) {}

    abstract name: string;

    enter(): void {
        console.log(`Entering state: ${this.name}`);
    }

    exit(): void {
        console.log(`Exiting state: ${this.name}`);
    }

    update(dt: number): void {
        // Override in subclasses
    }

    handleInput(input: InputHandler): void {
        // Handle F key for FPS toggle
        if (input.isKeyPressed("KeyF")) {
            this.engine.toggleFPSDisplay();
        }
    }
} 
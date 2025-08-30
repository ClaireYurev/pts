import { GameState } from "./GameState.js";
import { InputHandler } from "../engine/InputHandler.js";

export class PlayState extends GameState {
    name = "Play";

    enter(): void {
        super.enter();
        // Initialize play state
    }

    exit(): void {
        super.exit();
        // Clean up play state
    }

    update(dt: number): void {
        // Play state specific updates
    }

    handleInput(input: InputHandler): void {
        super.handleInput(input);
        
        // Handle play state specific input
        if (input.isKeyPressed("Escape")) {
            // Could transition to pause state
            console.log("Escape pressed - could pause game");
        }
    }
} 
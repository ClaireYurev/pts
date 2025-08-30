import { GameState } from "./GameState.js";
export class PlayState extends GameState {
    constructor() {
        super(...arguments);
        this.name = "Play";
    }
    enter() {
        super.enter();
        // Initialize play state
    }
    exit() {
        super.exit();
        // Clean up play state
    }
    update(dt) {
        // Play state specific updates
    }
    handleInput(input) {
        super.handleInput(input);
        // Handle play state specific input
        if (input.isKeyPressed("Escape")) {
            // Could transition to pause state
            console.log("Escape pressed - could pause game");
        }
    }
}
//# sourceMappingURL=PlayState.js.map
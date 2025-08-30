import { State } from "../engine/State.js";
import { InputHandler } from "../engine/InputHandler.js";
import { GameEngine } from "../engine/GameEngine.js";
export declare abstract class GameState implements State {
    protected engine: GameEngine;
    constructor(engine: GameEngine);
    abstract name: string;
    enter(): void;
    exit(): void;
    update(dt: number): void;
    handleInput(input: InputHandler): void;
}
//# sourceMappingURL=GameState.d.ts.map
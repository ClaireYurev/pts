import { GameState } from "./GameState.js";
import { InputHandler } from "../engine/InputHandler.js";
export declare class PlayState extends GameState {
    name: string;
    enter(): void;
    exit(): void;
    update(dt: number): void;
    handleInput(input: InputHandler): void;
}
//# sourceMappingURL=PlayState.d.ts.map
import { InputHandler } from "./InputHandler.js";

export interface State {
    name: string;
    enter(): void;
    exit(): void;
    update(dt: number): void;
    handleInput(input: InputHandler): void;
} 
import { State } from "./State.js";
import { InputHandler } from "./InputHandler.js";
export declare class StateMachine {
    private currentState?;
    private previousState?;
    changeState(newState: State): void;
    update(dt: number): void;
    handleInput(input: InputHandler): void;
    getCurrentState(): State | undefined;
    getPreviousState(): State | undefined;
    isInState(stateName: string): boolean;
    goToPreviousState(): void;
}
//# sourceMappingURL=StateMachine.d.ts.map
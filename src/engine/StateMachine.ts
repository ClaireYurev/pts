import { State } from "./State.js";
import { InputHandler } from "./InputHandler.js";

export class StateMachine {
    private currentState?: State;
    private previousState?: State;

    public changeState(newState: State): void {
        if (!newState) {
            console.warn("Attempted to change to null/undefined state");
            return;
        }
        
        try {
            if (this.currentState) {
                this.currentState.exit();
                this.previousState = this.currentState;
            }
            
            this.currentState = newState;
            this.currentState.enter();
        } catch (error) {
            console.error("Error changing state:", error);
        }
    }

    public update(dt: number): void {
        try {
            this.currentState?.update(dt);
        } catch (error) {
            console.error("Error in state update:", error);
        }
    }

    public handleInput(input: InputHandler): void {
        try {
            this.currentState?.handleInput(input);
        } catch (error) {
            console.error("Error in state input handling:", error);
        }
    }

    public getCurrentState(): State | undefined {
        return this.currentState;
    }

    public getPreviousState(): State | undefined {
        return this.previousState;
    }

    public isInState(stateName: string): boolean {
        return this.currentState?.name === stateName;
    }

    public goToPreviousState(): void {
        if (this.previousState) {
            this.changeState(this.previousState);
        }
    }
} 
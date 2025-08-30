export class StateMachine {
    changeState(newState) {
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
        }
        catch (error) {
            console.error("Error changing state:", error);
        }
    }
    update(dt) {
        try {
            this.currentState?.update(dt);
        }
        catch (error) {
            console.error("Error in state update:", error);
        }
    }
    handleInput(input) {
        try {
            this.currentState?.handleInput(input);
        }
        catch (error) {
            console.error("Error in state input handling:", error);
        }
    }
    getCurrentState() {
        return this.currentState;
    }
    getPreviousState() {
        return this.previousState;
    }
    isInState(stateName) {
        return this.currentState?.name === stateName;
    }
    goToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState);
        }
    }
}
//# sourceMappingURL=StateMachine.js.map
export var CheatFlag;
(function (CheatFlag) {
    CheatFlag["GodMode"] = "GodMode";
    CheatFlag["NoClip"] = "NoClip";
    CheatFlag["InfiniteTime"] = "InfiniteTime";
    CheatFlag["GiveSword"] = "GiveSword";
    CheatFlag["SetHealth"] = "SetHealth";
})(CheatFlag || (CheatFlag = {}));
export class CheatManager {
    constructor() {
        this.flags = {
            [CheatFlag.GodMode]: false,
            [CheatFlag.NoClip]: false,
            [CheatFlag.InfiniteTime]: false,
            [CheatFlag.GiveSword]: false,
            [CheatFlag.SetHealth]: null
        };
    }
    setCheat(flag, value) {
        // Validate value based on cheat type
        if (flag === CheatFlag.SetHealth && typeof value === 'number') {
            if (value < 0 || value > 9999) {
                console.warn(`Invalid health value: ${value}. Must be between 0 and 9999.`);
                return;
            }
        }
        // Validate boolean cheats
        if (flag !== CheatFlag.SetHealth && typeof value !== 'boolean' && value !== null) {
            console.warn(`Invalid value type for cheat ${flag}. Expected boolean or null, got ${typeof value}`);
            return;
        }
        // Validate SetHealth cheat
        if (flag === CheatFlag.SetHealth && typeof value !== 'number' && value !== null) {
            console.warn(`Invalid value type for SetHealth cheat. Expected number or null, got ${typeof value}`);
            return;
        }
        this.flags[flag] = value;
        console.log(`Cheat ${flag} set to:`, value);
    }
    isActive(flag) {
        return !!this.flags[flag];
    }
    getValue(flag) {
        return this.flags[flag];
    }
    toggle(flag) {
        if (typeof this.flags[flag] === 'boolean') {
            this.flags[flag] = !this.flags[flag];
            console.log(`Cheat ${flag} toggled to:`, this.flags[flag]);
        }
    }
    resetAll() {
        this.flags = {
            [CheatFlag.GodMode]: false,
            [CheatFlag.NoClip]: false,
            [CheatFlag.InfiniteTime]: false,
            [CheatFlag.GiveSword]: false,
            [CheatFlag.SetHealth]: null
        };
        console.log("All cheats reset");
    }
    getActiveCheats() {
        return Object.entries(this.flags)
            .filter(([_, value]) => !!value)
            .map(([key, _]) => key);
    }
}
//# sourceMappingURL=CheatManager.js.map
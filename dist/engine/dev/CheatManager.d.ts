export declare enum CheatFlag {
    GodMode = "GodMode",
    NoClip = "NoClip",
    InfiniteTime = "InfiniteTime",
    GiveSword = "GiveSword",
    SetHealth = "SetHealth"
}
type CheatValue = boolean | number | null;
export declare class CheatManager {
    private flags;
    setCheat(flag: CheatFlag, value: CheatValue): void;
    isActive(flag: CheatFlag): boolean;
    getValue(flag: CheatFlag): CheatValue;
    toggle(flag: CheatFlag): void;
    resetAll(): void;
    getActiveCheats(): CheatFlag[];
}
export {};

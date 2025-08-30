export enum CheatFlag {
  GodMode = "GodMode",
  NoClip = "NoClip",
  InfiniteTime = "InfiniteTime",
  GiveSword = "GiveSword",
  SetHealth = "SetHealth"
}

// Define specific types for cheat values
type CheatValue = boolean | number | null;

export class CheatManager {
  private flags: Record<CheatFlag, CheatValue> = {
    [CheatFlag.GodMode]: false,
    [CheatFlag.NoClip]: false,
    [CheatFlag.InfiniteTime]: false,
    [CheatFlag.GiveSword]: false,
    [CheatFlag.SetHealth]: null
  };

  public setCheat(flag: CheatFlag, value: CheatValue): void {
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

  public isActive(flag: CheatFlag): boolean {
    return !!this.flags[flag];
  }

  public getValue(flag: CheatFlag): CheatValue {
    return this.flags[flag];
  }

  public toggle(flag: CheatFlag): void {
    if (typeof this.flags[flag] === 'boolean') {
      this.flags[flag] = !this.flags[flag];
      console.log(`Cheat ${flag} toggled to:`, this.flags[flag]);
    }
  }

  public resetAll(): void {
    this.flags = {
      [CheatFlag.GodMode]: false,
      [CheatFlag.NoClip]: false,
      [CheatFlag.InfiniteTime]: false,
      [CheatFlag.GiveSword]: false,
      [CheatFlag.SetHealth]: null
    };
    console.log("All cheats reset");
  }

  public getActiveCheats(): CheatFlag[] {
    return Object.entries(this.flags)
      .filter(([_, value]) => !!value)
      .map(([key, _]) => key as CheatFlag);
  }
} 
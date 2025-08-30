# PTS BootConfig URL Examples

This document provides examples of how to use the URL-based boot configuration system in PTS.

## Basic Examples

### Quick Start with Level 3
```
?level=3&health=200&god=1
```
- Start at level 3
- Player health set to 200
- God mode enabled

### Speed Run Mode
```
?speed=2.0&noclip=1&cutscenes=0
```
- 2x game speed
- Noclip enabled
- Cutscenes disabled

### Debug Mode
```
?god=1&noclip=1&infTime=1&editor=1
```
- All cheats enabled
- Editor mode enabled

### Audio Test
```
?vol=0.5&music=0&sfx=1
```
- 50% master volume
- Music disabled
- SFX enabled

## Advanced Examples

### Custom Player Position
```
?level=5&x=150&y=200&health=50&sword=1
```
- Start at level 5
- Player positioned at (150, 200)
- Health set to 50
- Player has sword

### Performance Settings
```
?fps=120&vsync=0&speed=1.5&zoom=1.2
```
- 120 FPS cap
- VSync disabled
- 1.5x game speed
- 1.2x zoom level

### Input Customization
```
?deadzone=0.2&jumpbuf=150&sticky=1
```
- 20% input deadzone
- 150ms jump buffer
- Sticky input enabled

### Save Slot Loading
```
?slot=2
```
- Load save from slot 2

### External Pack Loading
```
?packUrl=https://example.com/gamepack.ptspack
```
- Load external pack from URL

## Complete Parameter Reference

### Game Pack & Level
- `pack` - Built-in pack name
- `packUrl` - External pack URL
- `level` - Starting level (1-999)
- `room` - Starting room (1-999)
- `x` - Player X position (-10000 to 10000)
- `y` - Player Y position (-10000 to 10000)

### Player State
- `health` - Player health (0-9999)
- `maxhealth` - Player max health (1-9999)
- `sword` - Give player sword (0/1)

### Game Settings
- `time` - Game timer (0-999999)
- `seed` - Random seed (0-999999)
- `difficulty` - Difficulty level (easy/normal/hard/extreme)

### Cheats
- `noclip` - Noclip mode (0/1)
- `god` - God mode (0/1)
- `infTime` - Infinite time (0/1)
- `reveal` - Reveal map (0/1)
- `givesword` - Give sword (0/1)
- `setguards` - Set number of guards (0-100)

### Performance
- `speed` - Game speed multiplier (0.1-10.0)
- `fps` - FPS cap (30-240)
- `vsync` - VSync enabled (0/1)

### Display
- `scale` - Scaling mode (integer/fit/stretch)
- `zoom` - Zoom level (0.1-10.0)
- `fullscreen` - Fullscreen mode (0/1)

### Audio
- `mute` - Mute all audio (0/1)
- `music` - Music enabled (0/1)
- `sfx` - Sound effects enabled (0/1)
- `vol` - Master volume (0.0-1.0)
- `latency` - Audio latency (auto/low/compat)

### Input
- `keys` - Custom key bindings (string)
- `deadzone` - Input deadzone (0.0-1.0)
- `jumpbuf` - Jump buffer in ms (0-200)
- `sticky` - Sticky input (0/1)

### UI & Accessibility
- `hud` - HUD visibility (0/1)
- `cutscenes` - Cutscenes enabled (0/1)
- `lang` - Language code (string)
- `slot` - Save slot (1/2/3/Q)

### Development
- `editor` - Editor mode (0/1)

## Precedence Rules

The boot configuration follows this precedence order (highest to lowest):

1. **URL Parameters** - Session-specific overrides
2. **SettingsStore** - User's saved settings
3. **Pack Defaults** - Pack-specific defaults
4. **Engine Defaults** - System defaults

## Default Values

- `level`: 1
- `cutscenes`: false
- `mute`: true (until user input)
- `health`: 100
- `maxhealth`: 100
- `difficulty`: normal
- `scale`: integer
- `fullscreen`: false
- `vol`: 1.0
- `music`: true
- `sfx`: true
- `latency`: auto
- `deadzone`: 0.1
- `jumpbuf`: 100
- `sticky`: false
- `hud`: true
- `lang`: en
- `fps`: 60
- `vsync`: true
- `speed`: 1.0
- `zoom`: 1.0

## Testing

Use the `boot-config-test.html` file to interactively test and generate boot URLs with the full parameter set. 
# PrinceTS URL Boot Configuration System

## Overview

The PrinceTS URL Boot Configuration system allows you to configure and launch the game directly through URL parameters. This enables sharing specific game states, creating preset configurations, and testing different game settings without manually configuring the game each time.

## Quick Start

### Basic Usage

Simply add parameters to the URL when loading PrinceTS:

```
https://your-princets-site.com/?playerX=100&playerY=200&health=75&debug=true
```

### Test Page

Use `boot-config-test.html` to test different configurations interactively.

## Supported Parameters

### Game Pack & Level
- `pack=<url>` - Load a specific game pack from URL
- `level=<number>` - Start at a specific level (1-based)

### Player State
- `playerX=<number>` - Player X position
- `playerY=<number>` - Player Y position  
- `health=<number>` - Player health (0-9999)
- `lives=<number>` - Player lives (0-99)
- `score=<number>` - Game score

### Game Settings
- `time=<number>` - Game timer in seconds
- `difficulty=<string>` - Game difficulty (easy, normal, hard, extreme)
- `skipCutscene=<1|0>` - Skip cutscenes (1 = true, 0 = false)

### Audio Settings
- `musicVolume=<number>` - Music volume (0.0-1.0)
- `sfxVolume=<number>` - Sound effects volume (0.0-1.0)
- `mute=<true|false>` - Mute all audio

### Display Settings
- `resolution=<width>x<height>` - Canvas resolution (e.g., 800x600)
- `fullscreen=<true|false>` - Start in fullscreen mode
- `platform=<string>` - Target platform (snes, nes, gameboy, etc.)

### Input Settings
- `inputMethod=<string>` - Input method (keyboard, gamepad, touch)

### Accessibility
- `subtitles=<true|false>` - Enable subtitles
- `highContrast=<true|false>` - Enable high contrast mode
- `lang=<string>` - Language code (en, es, fr, de, ja, zh)

### Debug & Development
- `debug=<true|false>` - Enable debug mode
- `cheats=<comma-separated-list>` - Enable cheats (GodMode, NoClip, InfiniteTime, GiveSword, SetHealth)

## Preset Configurations

### Available Presets

Use `?preset=<name>` to load predefined configurations:

#### Easy Mode
```
?preset=easy
```
- Difficulty: easy
- Health: 100
- Lives: 5
- Cheats: GodMode

#### Hard Mode
```
?preset=hard
```
- Difficulty: hard
- Health: 50
- Lives: 1
- Debug: true

#### Speedrun Mode
```
?preset=speedrun
```
- Difficulty: hard
- Skip cutscenes: true
- Debug: true
- Cheats: NoClip

#### Debug Mode
```
?preset=debug
```
- Debug: true
- Cheats: GodMode, NoClip, InfiniteTime
- High contrast: true

#### Accessibility Mode
```
?preset=accessibility
```
- High contrast: true
- Subtitles: true
- Music volume: 0.3
- SFX volume: 0.8

## Example URLs

### Basic Game State
```
?playerX=100&playerY=200&health=75&lives=3&score=5000
```

### Platform Configuration
```
?platform=gameboy&resolution=160x144&fullscreen=true
```

### Debug Setup
```
?debug=true&cheats=GodMode,NoClip&highContrast=true
```

### Complete Configuration
```
?level=3&playerX=150&playerY=100&health=80&lives=2&score=7500&time=300&difficulty=hard&musicVolume=0.5&sfxVolume=0.8&resolution=1024x768&fullscreen=true&debug=true&cheats=GodMode,NoClip&highContrast=true&lang=en&skipCutscene=1
```

## Sharing Game States

### Copy Share Link

Use the "Copy Share Link" button in the π Menu to generate a URL with the current game state:

1. Open the π Menu (press P or click the π button)
2. Click "Copy Share Link"
3. The URL with current game state is copied to clipboard

### Manual URL Generation

You can manually construct URLs with specific parameters:

```javascript
const params = new URLSearchParams();
params.set("playerX", "100");
params.set("playerY", "200");
params.set("health", "75");
params.set("debug", "true");
const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
```

## Validation

The system validates all parameters and provides warnings for invalid values:

- **Level**: Must be a positive integer
- **Player Position**: Must be valid numbers
- **Health**: Must be between 0-9999
- **Lives**: Must be between 0-99
- **Score**: Must be non-negative
- **Time**: Must be non-negative
- **Difficulty**: Must be one of: easy, normal, hard, extreme
- **Audio Volumes**: Must be between 0.0-1.0
- **Resolution**: Minimum 160x144
- **Platform**: Must be a supported platform
- **Input Method**: Must be one of: keyboard, gamepad, touch
- **Language**: Must be a supported language code
- **Cheats**: Must be valid cheat names

## Error Handling

- Invalid parameters are logged as warnings
- The game continues with default values for invalid parameters
- Critical errors are displayed to the user
- Boot configuration errors don't prevent the game from starting

## Technical Implementation

### BootConfigManager Class

The system is implemented in `src/engine/BootConfig.ts`:

```typescript
export class BootConfigManager {
  static parse(): BootConfig           // Parse URL parameters
  static validate(cfg: BootConfig)     // Validate configuration
  static apply(cfg: BootConfig, engine) // Apply to game engine
  static generateShareUrl(engine)      // Generate share URL
  static copyShareUrl(engine)          // Copy to clipboard
}
```

### Integration Points

- **Main.ts**: Parses and applies boot configuration on startup
- **PiMenu**: Provides share URL functionality
- **GameEngine**: Receives and applies configuration
- **PlatformManager**: Handles platform-specific settings

## Best Practices

### URL Length
- Keep URLs under 2048 characters for compatibility
- Use presets for complex configurations
- Only include necessary parameters

### Parameter Order
- Group related parameters together
- Use consistent naming conventions
- Document custom parameters

### Error Handling
- Always validate user-provided URLs
- Provide fallback values for missing parameters
- Log configuration errors for debugging

## Browser Compatibility

- **URLSearchParams**: Modern browsers (IE11+ with polyfill)
- **Clipboard API**: Modern browsers (fallback to manual copy)
- **Fullscreen API**: Modern browsers (graceful degradation)

## Security Considerations

- Validate all URL parameters
- Sanitize user input
- Limit parameter values to safe ranges
- Don't execute arbitrary code from URLs

## Troubleshooting

### Common Issues

1. **Parameters not applying**: Check browser console for validation errors
2. **Share link not working**: Ensure clipboard permissions are granted
3. **Game not loading**: Verify all parameters are valid
4. **Performance issues**: Reduce number of parameters or use presets

### Debug Mode

Enable debug mode to see detailed boot configuration logs:

```
?debug=true
```

This will log:
- Parsed parameters
- Validation results
- Applied configurations
- Any errors or warnings

## Future Enhancements

- **Custom Presets**: User-defined preset configurations
- **URL Shortening**: Generate short URLs for complex configurations
- **Parameter Templates**: Reusable parameter sets
- **Advanced Validation**: More sophisticated parameter validation
- **Configuration Profiles**: Save and load multiple configurations

## API Reference

### BootConfig Interface

```typescript
interface BootConfig {
  packUrl?: string;
  level?: number;
  playerX?: number;
  playerY?: number;
  health?: number;
  lives?: number;
  score?: number;
  time?: number;
  difficulty?: string;
  skipCutscene?: boolean;
  musicVolume?: number;
  sfxVolume?: number;
  mute?: boolean;
  resolution?: { width: number; height: number };
  fullscreen?: boolean;
  platform?: string;
  inputMethod?: string;
  subtitles?: boolean;
  highContrast?: boolean;
  lang?: string;
  debug?: boolean;
  cheats?: string[];
  [key: string]: any;
}
```

### Methods

#### `BootConfigManager.parse()`
Parses URL parameters into a BootConfig object.

#### `BootConfigManager.validate(cfg: BootConfig)`
Validates a BootConfig object and returns validation results.

#### `BootConfigManager.apply(cfg: BootConfig, engine: GameEngine)`
Applies a BootConfig to a GameEngine instance.

#### `BootConfigManager.generateShareUrl(engine: GameEngine)`
Generates a shareable URL with current game state.

#### `BootConfigManager.copyShareUrl(engine: GameEngine)`
Copies the current game state URL to clipboard.

#### `BootConfigManager.getAvailablePresets()`
Returns an array of available preset names.

#### `BootConfigManager.clearUrlParams()`
Clears all URL parameters and reloads the page. 
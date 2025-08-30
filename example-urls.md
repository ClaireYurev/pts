# PrinceTS Boot Configuration Examples

## Basic Examples

### Start with Debug Mode
```
index.html?debug=true
```

### Set Player Position and Health
```
index.html?playerX=100&playerY=200&health=75
```

### Load with Cheats
```
index.html?cheats=GodMode,NoClip&debug=true
```

### Platform Configuration
```
index.html?platform=gameboy&resolution=160x144
```

## Advanced Examples

### Complete Game State
```
index.html?level=3&playerX=150&playerY=100&health=80&lives=2&score=7500&time=300&difficulty=hard&debug=true&cheats=GodMode,NoClip
```

### Accessibility Setup
```
index.html?highContrast=true&subtitles=true&musicVolume=0.3&sfxVolume=0.8&lang=en
```

### Speedrun Configuration
```
index.html?preset=speedrun&resolution=800x600&fullscreen=true
```

### Development Setup
```
index.html?preset=debug&platform=snes&resolution=1024x768&inputMethod=keyboard
```

## Preset Examples

### Easy Mode
```
index.html?preset=easy
```

### Hard Mode
```
index.html?preset=hard
```

### Speedrun Mode
```
index.html?preset=speedrun
```

### Debug Mode
```
index.html?preset=debug
```

### Accessibility Mode
```
index.html?preset=accessibility
```

## Test URLs for Different Scenarios

### Testing Player Movement
```
index.html?playerX=50&playerY=50&debug=true&cheats=GodMode
```

### Testing Platform Rendering
```
index.html?platform=nes&resolution=256x240&debug=true
```

### Testing Audio
```
index.html?musicVolume=0.5&sfxVolume=0.8&mute=false
```

### Testing Accessibility
```
index.html?highContrast=true&subtitles=true&lang=es
```

### Testing Fullscreen
```
index.html?fullscreen=true&resolution=1920x1080
```

### Testing Game State
```
index.html?level=2&score=10000&lives=5&time=600
```

## Complex Combinations

### Complete Development Setup
```
index.html?preset=debug&platform=snes&resolution=1024x768&fullscreen=true&inputMethod=keyboard&lang=en&skipCutscene=1
```

### Complete Accessibility Setup
```
index.html?preset=accessibility&platform=gameboy&resolution=320x240&inputMethod=touch&lang=en
```

### Complete Speedrun Setup
```
index.html?preset=speedrun&platform=nes&resolution=800x600&fullscreen=true&inputMethod=gamepad&skipCutscene=1
```

## URL Structure Reference

### Parameter Format
```
?param1=value1&param2=value2&param3=value3
```

### Boolean Values
- `true` or `false` for boolean parameters
- `1` or `0` for some boolean parameters (like `skipCutscene`)

### Numeric Values
- Use decimal numbers for volumes (0.0 to 1.0)
- Use integers for positions, health, lives, etc.

### Comma-Separated Lists
- Use for cheats: `cheats=GodMode,NoClip,InfiniteTime`

### Resolution Format
- Use `widthxheight` format: `resolution=800x600`

## Testing Tips

1. **Start Simple**: Begin with basic parameters like `debug=true`
2. **Test One at a Time**: Add parameters one by one to isolate issues
3. **Use Presets**: Use presets for common configurations
4. **Check Console**: Enable debug mode to see configuration logs
5. **Validate Parameters**: Check browser console for validation errors

## Browser Compatibility

### Modern Browsers
- All features supported
- Clipboard API for share links
- Fullscreen API

### Older Browsers
- URLSearchParams polyfill may be needed
- Some features may not work (fullscreen, clipboard)

## Error Handling

### Invalid Parameters
- Invalid parameters are logged as warnings
- Game continues with default values
- Check browser console for details

### Missing Parameters
- Optional parameters use default values
- Required parameters may prevent game start

### Parameter Validation
- All parameters are validated on load
- Invalid values are clamped to safe ranges
- Unsupported values are ignored 
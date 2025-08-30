# Developer Tools and Cheat System

This document describes the developer tools and cheat system implemented in PrinceTS.

## Cheat System

### Available Cheats

The game includes several cheats that can be toggled on/off:

- **GodMode**: Prevents the player from taking damage
- **NoClip**: Allows the player to pass through walls and obstacles
- **InfiniteTime**: Stops the game timer from counting down
- **GiveSword**: Adds a sword to the player's inventory
- **SetHealth**: Sets the player's health to a specific value

### How to Use Cheats

#### Method 1: Developer Panel
1. Press the backtick key (`) to open the developer panel
2. Check/uncheck the desired cheats
3. Click "Apply Cheats" to activate them
4. Use "Reset All" to disable all cheats

#### Method 2: Keyboard Shortcuts
- **G**: Toggle God Mode
- **N**: Toggle No Clip
- **T**: Toggle Infinite Time
- **S**: Toggle Give Sword

### Cheat Integration

Cheats are integrated into the game systems:

- **GodMode**: Applied in damage routines - damage is skipped if GodMode is active
- **NoClip**: Applied in collision system - player collisions are bypassed
- **InfiniteTime**: Applied in timer systems - time doesn't decrement
- **GiveSword**: Applied immediately - adds sword to inventory
- **SetHealth**: Applied every frame - maintains player health at specified value

## Debug Tools

### Debug Overlay
- **Toggle**: Press F1
- **Features**:
  - FPS counter
  - Player position and velocity
  - Camera position
  - Memory usage (if available)
  - Entity bounding boxes
  - Grid overlay

### Free Camera
- **Toggle**: Press C
- **Controls**: Numpad 4,8,6,2 to move, Shift to sprint, Numpad 5 to reset to player
- **Features**:
  - Independent camera movement
  - Sprint mode for faster movement
  - Numpad 5 to reset camera to player position

### Developer Panel (Integrated Menu)
- **Toggle**: Press backtick (`) - opens expanded pause menu with dev tools
- **Features**:
  - Visual cheat toggles
  - Debug tool controls
  - Active cheat display
  - Camera reset button
  - Integrated with main pause menu system
  - Same pause/resume functionality as regular menu
  - "Resume Game" button (renamed from "Back") that closes the menu and resumes gameplay

## Keyboard Shortcuts Summary

| Key | Function |
|-----|----------|
| ` | Toggle Developer Panel |
| F1 | Toggle Debug Overlay |
| C | Toggle Free Camera |
| Numpad 4,8,6,2 | Free Camera Movement |
| Numpad 5 | Reset Free Camera to Player |
| G | Toggle God Mode |
| N | Toggle No Clip |
| T | Toggle Infinite Time |
| S | Toggle Give Sword |
| F | Toggle FPS Display |
| P | Open Menu |

## Reset Game Functionality

The game includes a "Reset Game" button in both the main menu (π Menu) and the Developer Panel. This feature includes a double-click confirmation system to prevent accidental resets.

### How to Use Reset Game

1. **First Click**: Activates the confirmation mode
   - Button text changes to "Click again to confirm reset"
   - Button color changes to bright red
   - 3-second timeout to cancel if not confirmed

2. **Second Click**: Confirms the reset
   - Clears all save data
   - Reloads the page to reset game state
   - All progress is lost

### Reset Game Locations

- **Main Menu**: Access via the π button, then click "Reset Game"

### Safety Features

- **Double-click confirmation**: Prevents accidental resets
- **Visual feedback**: Button changes color and text during confirmation
- **Timeout**: Confirmation expires after 3 seconds
- **Clear warning**: Button is styled in red to indicate destructive action

## Technical Implementation

### Files Structure
```
src/dev/
├── CheatManager.ts    # Core cheat management
├── FreeCamera.ts      # Free camera controls
└── DebugOverlay.ts    # Debug information display
```

### Menu Integration
The developer panel is now fully integrated into the main pause menu system:
- **Regular Menu**: Press P or π button - shows standard game menu
- **Dev Menu**: Press backtick (`) - shows expanded menu with dev tools
- **Shared Overlay**: Both menus use the same pause overlay system
- **Visual Distinction**: Dev menu uses green terminal-style colors

### Integration Points
- **GameEngine**: Main integration point for all dev tools
- **PiMenu**: Integrated dev panel functionality
- **Entity**: Added health and inventory properties
- **CollisionSystem**: NoClip cheat integration
- **PhysicsEngine**: Cheat-aware physics updates

### Cheat Manager API
```typescript
// Set a cheat value
cheatManager.setCheat(CheatFlag.GodMode, true);

// Check if a cheat is active
if (cheatManager.isActive(CheatFlag.NoClip)) {
    // Skip collision logic
}

// Toggle a boolean cheat
cheatManager.toggle(CheatFlag.GodMode);

// Get all active cheats
const activeCheats = cheatManager.getActiveCheats();
```

## Testing Cheats

To test that cheats are working correctly:

1. **GodMode**: Try to take damage - health should not decrease
2. **NoClip**: Walk into walls - should pass through them
3. **InfiniteTime**: Check if timer stops counting down
4. **GiveSword**: Check inventory for sword item
5. **SetHealth**: Set health to 50, verify it stays at 50

## Development Notes

- All dev tools are disabled by default in production builds
- Cheats are designed to be easily extensible
- Debug overlay provides real-time game state information
- Free camera is useful for level design and debugging
- Developer panel provides a user-friendly interface for all tools

## Future Enhancements

Potential additions to the cheat system:
- Teleport to specific coordinates
- Spawn entities
- Modify game speed
- Unlock all levels
- Infinite resources
- Enemy AI toggle
- Physics debug mode 
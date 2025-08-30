# PrinceTS Retro Scaling System

PrinceTS now features a retro scaling system similar to PrinceJS, providing an authentic pixelated gaming experience that scales beautifully across different screen sizes.

## How It Works

The retro scaling system uses a dual-canvas approach:

1. **Internal Canvas (320x240)**: A low-resolution internal canvas where all game rendering happens
2. **Display Canvas**: A high-resolution display canvas that scales the internal canvas to fit the browser window

## Key Features

### Pixel-Perfect Scaling
- Internal resolution: 320x240 (4:3 aspect ratio)
- Automatic scaling to fit any screen size
- Maintains aspect ratio with letterboxing/pillarboxing
- Disabled image smoothing for authentic pixelated look

### Responsive Design
- Automatically adjusts to window resize
- Works on desktop, tablet, and mobile devices
- Scales from 1x to 4x+ depending on screen size

### Performance Optimized
- Only the internal canvas is updated during gameplay
- Display canvas is updated once per frame
- Efficient coordinate conversion between display and internal space

## Technical Implementation

### Renderer Class
The `Renderer` class has been updated with retro scaling capabilities:

```typescript
// Get internal dimensions
const internalDims = renderer.getInternalDimensions(); // { width: 320, height: 240 }

// Get display dimensions
const displayDims = renderer.getDisplayDimensions(); // Current browser window size

// Get current scale factors
const scale = renderer.getScale(); // { x: 2.5, y: 2.5 }

// Convert coordinates between display and internal space
const internalPos = renderer.displayToInternal(displayX, displayY);
const displayPos = renderer.internalToDisplay(internalX, internalY);
```

### Coordinate System
- All game logic uses internal coordinates (0-320, 0-240)
- Mouse input is automatically converted to internal coordinates
- Camera system works in internal coordinate space

## Usage Examples

### Basic Setup
```typescript
const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

// All drawing operations use internal coordinates
renderer.drawRect(10, 10, 32, 32, "#FF0000"); // Red square at (10,10)
renderer.drawText("Hello", 50, 50, "16px Arial", "#FFF");

// Render to display
renderer.renderToDisplay();
```

### Entity Positioning
```typescript
// Entities use internal coordinates
const player = new Entity(50, 50); // Position in internal space
player.width = 16;  // Size in internal pixels
player.height = 16;
```

### Mouse Input
```typescript
// Get mouse position in internal coordinates
const mousePos = inputHandler.getMousePositionInternal(renderer);
console.log(`Mouse at: ${mousePos.x}, ${mousePos.y}`);
```

## CSS Requirements

The canvas should be styled to fill the viewport:

```css
canvas {
    width: 100vw;
    height: 100vh;
    object-fit: contain;
}
```

## Browser Compatibility

- Modern browsers with Canvas API support
- Automatic fallback for older browsers
- Works with touch devices (mouse events converted to touch)

## Performance Considerations

- Internal canvas updates are fast (320x240 pixels)
- Display scaling is hardware-accelerated
- Minimal memory usage compared to high-resolution rendering
- Smooth 60fps performance on most devices

## Customization

You can modify the internal resolution by changing these values in the Renderer constructor:

```typescript
private internalWidth = 320;   // Change to desired width
private internalHeight = 240;  // Change to desired height
```

Common retro resolutions:
- 320x240 (4:3) - Classic DOS games
- 256x224 (4:3) - NES-style
- 160x144 (10:9) - Game Boy-style

## Debug Information

The game displays real-time scaling information:
- Internal resolution: 320x240
- Current display resolution
- Scale factor (e.g., 2.5x)
- Performance metrics

This retro scaling system provides an authentic gaming experience while maintaining modern responsiveness and performance. 
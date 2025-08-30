# PrinceTS Game Engine

A TypeScript game engine for creating Prince of Persia style platformer games.

## Features

- **Core Engine**: Complete game engine with rendering, physics, collision detection, and input handling
- **State Machine**: Flexible state management for different game modes
- **Animation System**: Sprite animation controller with frame-based animations
- **Game Pack System**: JSON-based level and asset loading
- **High-DPI Support**: Automatic scaling for high-resolution displays
- **TypeScript**: Full TypeScript support with strict type checking

## Project Structure

```
src/
├── engine/           # Core engine components
│   ├── GameEngine.ts
│   ├── Renderer.ts
│   ├── InputHandler.ts
│   ├── PhysicsEngine.ts
│   ├── CollisionSystem.ts
│   ├── AnimationController.ts
│   ├── StateMachine.ts
│   ├── GameLoop.ts
│   ├── Entity.ts
│   ├── Vector2.ts
│   ├── GamePack.ts
│   └── GamePackLoader.ts
├── states/           # Game states
│   ├── GameState.ts
│   └── PlayState.ts
└── main.ts          # Entry point

packs/               # Game pack files
├── example.ptspack.json

assets/              # Game assets
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open `http://localhost:8080` in your browser

## Controls

- **WASD/Arrow Keys**: Move player
- **Space**: Jump
- **F**: Toggle FPS display
- **Escape**: (Future: Pause game)

## Game Pack Format

Game packs are JSON files that define levels, entities, and assets:

```json
{
  "name": "Example Pack",
  "version": "1.0",
  "tileSize": 32,
  "defaultGravity": 9.8,
  "assets": ["player.png", "tiles.png"],
  "levels": [
    {
      "id": 1,
      "name": "Level 1",
      "tileMap": [[1,1,1],[1,0,1],[1,1,1]],
      "entities": [
        {"type": "Player", "x": 100, "y": 100}
      ]
    }
  ]
}
```

## Development

- **Watch Mode**: `npm run dev` - Compiles TypeScript on file changes
- **Build**: `npm run build` - Compiles TypeScript to JavaScript
- **Serve**: `npm run serve` - Starts HTTP server

## Architecture

The engine follows a component-based architecture:

- **GameEngine**: Main coordinator that manages all subsystems
- **Renderer**: Handles 2D canvas rendering with camera support
- **InputHandler**: Manages keyboard and mouse input
- **PhysicsEngine**: Handles gravity and velocity calculations
- **CollisionSystem**: Detects and resolves entity collisions
- **AnimationController**: Manages sprite animations
- **StateMachine**: Handles game state transitions
- **GameLoop**: Manages the main game loop with timing

## License

MIT License 
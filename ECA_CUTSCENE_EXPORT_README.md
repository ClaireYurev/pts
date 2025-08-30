# PrinceTS - ECA Scripting & Cutscene System

## Overview

This implementation adds a comprehensive ECA (Event→Condition→Action) scripting system, cutscene timeline editor, and export/import functionality to the PrinceTS game engine. The system provides visual scripting capabilities with a node-based editor and timeline-based cutscene creation.

## 🎯 Features Implemented

### ✅ ECA Scripting System
- **Visual Node Editor**: Drag-and-drop interface for creating scripts
- **Event Nodes**: OnStart, OnCollision, OnKeyPress, OnTimer
- **Condition Nodes**: IsAlive, HasItem, IsOnGround, IsMoving
- **Action Nodes**: Move, Jump, PlayAnimation, SetVariable, SpawnEntity, PlaySound, Wait
- **Real-time Execution**: Scripts run during gameplay with proper flow control
- **Variable System**: Local and global variables for script state management

### ✅ Cutscene Timeline Editor
- **Multi-track Timeline**: Camera, Text, Sprite, Music, and Wait tracks
- **Visual Timeline Editor**: Drag-and-drop timeline interface
- **Real-time Playback**: Play, pause, stop, and seek functionality
- **Track Management**: Add, remove, and organize timeline tracks
- **Item Editing**: Create and edit timeline items with properties

### ✅ Export/Import System
- **ZIP Export**: Creates .ptspack files with all game data
- **Schema Validation**: JSON schema validation for all components
- **Asset Management**: Handles images, audio, and JSON assets
- **Import Support**: Load .ptspack files with validation
- **Merge Functionality**: Combine multiple game packs

### ✅ JSON Schema Validation
- **Script Schema**: Validates ECA node structure and connections
- **Cutscene Schema**: Validates timeline tracks and items
- **Game Pack Schema**: Validates overall pack structure
- **Level Schema**: Validates level configurations

## 📁 File Structure

```
src/
├── runtime/
│   ├── scripting/
│   │   └── ECA.ts                    # ECA scripting engine
│   └── cutscene/
│       └── CutscenePlayer.ts         # Cutscene playback engine
├── editor/
│   ├── VisualScriptEditor.ts         # Visual script editor
│   ├── CutsceneEditor.ts             # Timeline editor
│   ├── ExportManager.ts              # Export/import functionality
│   └── ImportManager.ts              # Import management
└── engine/
    ├── GamePack.ts                   # Updated game pack interface
    └── schema/                       # JSON schemas
        ├── script.json
        ├── cutscene.json
        ├── gamepack.json
        └── level.json
```

## 🚀 Quick Start

### 1. ECA Scripting

```typescript
// Create an ECA script
const script: ECAScript = {
  id: 'player_script',
  name: 'Player Movement',
  nodes: [
    {
      id: 'event_start',
      type: 'Event',
      kind: 'OnStart',
      x: 100, y: 100,
      props: {}
    },
    {
      id: 'action_move',
      type: 'Action',
      kind: 'Move',
      x: 300, y: 100,
      props: { direction: 'right', speed: 100 }
    }
  ],
  edges: [
    {
      id: 'edge_1',
      from: 'event_start:flow',
      to: 'action_move:flow'
    }
  ],
  variables: { score: 0 }
};

// Create script engine and instance
const ecaEngine = new ECAScriptEngine(gameEngine);
const scriptInstance = ecaEngine.createScriptInstance(script, playerEntity);
```

### 2. Cutscene Creation

```typescript
// Create a cutscene
const cutscene: CutsceneData = {
  id: 'intro_cutscene',
  name: 'Intro Cutscene',
  duration: 10000,
  tracks: [
    {
      id: 'camera_track',
      name: 'Camera',
      type: 'camera',
      color: '#e74c3c',
      items: [
        {
          id: 'camera_move',
          time: 0,
          track: 'camera',
          action: 'move',
          args: { x: 0, y: 0, duration: 2000 }
        }
      ]
    }
  ],
  metadata: {
    created: new Date().toISOString(),
    editor: 'PrinceTS Cutscene Editor'
  }
};

// Play the cutscene
const cutscenePlayer = new CutscenePlayer(cutscene, gameEngine);
cutscenePlayer.play();
```

### 3. Export Game Pack

```typescript
// Create export manager
const exportManager = new ExportManager();

// Export game pack
const result = await exportManager.exportGamePack(gamePack, {
  includeAssets: true,
  includeScripts: true,
  includeCutscenes: true,
  includeLevels: true,
  validateSchema: true,
  compress: true
});

if (result.success) {
  console.log(`Exported: ${result.filename} (${result.size} bytes)`);
}
```

## 🎮 ECA Node Types

### Events
- **OnStart**: Triggers when script starts
- **OnCollision**: Triggers on entity collision
- **OnKeyPress**: Triggers on key press
- **OnTimer**: Triggers at regular intervals

### Conditions
- **IsAlive**: Checks if entity is alive
- **HasItem**: Checks if entity has an item
- **IsOnGround**: Checks if entity is on ground
- **IsMoving**: Checks if entity is moving

### Actions
- **Move**: Moves entity in a direction
- **Jump**: Makes entity jump
- **PlayAnimation**: Plays an animation
- **SetVariable**: Sets a variable value
- **SpawnEntity**: Creates a new entity
- **PlaySound**: Plays a sound effect
- **Wait**: Waits for a duration

## 🎬 Cutscene Track Types

### Camera Track
- **move**: Move camera to position
- **zoom**: Zoom camera in/out
- **shake**: Camera shake effect

### Text Track
- **show**: Display text overlay
- **hide**: Hide text overlay

### Sprite Track
- **show**: Show sprite
- **move**: Move sprite
- **hide**: Hide sprite

### Music Track
- **play**: Play music
- **stop**: Stop music
- **fadeIn**: Fade in music
- **fadeOut**: Fade out music

### Wait Track
- **wait**: Wait for duration

## 📦 Export Format

The .ptspack file contains:

```
game_pack.ptspack
├── pack.json              # Game pack metadata
├── levels/                # Level configurations
│   ├── level_1.json
│   └── level_2.json
├── scripts/               # ECA scripts
│   ├── player_script.json
│   └── enemy_script.json
├── cutscenes/             # Cutscene data
│   ├── intro.json
│   └── ending.json
└── assets/                # Game assets
    ├── player.png
    ├── music.mp3
    └── data.json
```

## 🔧 Configuration

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "jszip": "^3.10.1",
    "ajv": "^8.12.0"
  },
  "devDependencies": {
    "@types/jszip": "^3.4.1"
  }
}
```

## 🧪 Testing

### Run the Demo
1. Open `test-simple.html` in a web browser
2. Test ECA scripting functionality
3. Test cutscene timeline editor
4. Test export/import system
5. Validate JSON schemas

### Test Commands
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run serve
```

## 📋 API Reference

### ECAScriptEngine
```typescript
class ECAScriptEngine {
  constructor(engine: GameEngine)
  createScriptInstance(script: ECAScript, entity?: Entity): ECAScriptInstance
  registerHandler(nodeType: string, nodeKind: string, handler: ECANodeHandler): void
  validateScript(script: ECAScript): string[]
  update(deltaTime: number): void
}
```

### CutscenePlayer
```typescript
class CutscenePlayer {
  constructor(cutscene: CutsceneData, engine: GameEngine)
  play(): void
  pause(): void
  stop(): void
  seek(time: number): void
  getCurrentTime(): number
  getDuration(): number
}
```

### ExportManager
```typescript
class ExportManager {
  exportGamePack(gamePack: GamePack, options: ExportOptions): Promise<ExportResult>
  importGamePack(file: File): Promise<ImportResult>
  validateScript(script: ECAScript): string[]
  validateCutscene(cutscene: CutsceneData): string[]
}
```

## 🎨 Visual Editors

### Visual Script Editor
- Canvas-based node editor
- Drag-and-drop node creation
- Visual connection system
- Real-time validation
- Property inspector

### Cutscene Timeline Editor
- Multi-track timeline view
- Drag-and-drop item placement
- Real-time playback controls
- Track management
- Item property editing

## 🔒 Schema Validation

All components are validated against JSON schemas:

- **Scripts**: Validates node structure, connections, and properties
- **Cutscenes**: Validates timeline structure and item properties
- **Game Packs**: Validates overall pack structure and metadata
- **Levels**: Validates level configuration and entity data

## 🚀 Performance Considerations

- **Script Execution**: Optimized execution with minimal overhead
- **Cutscene Playback**: Efficient timeline processing
- **Export/Import**: Streaming file processing for large packs
- **Memory Management**: Proper cleanup of script instances and cutscene elements

## 🔮 Future Enhancements

- **Advanced Node Types**: More complex events, conditions, and actions
- **Script Debugging**: Visual debugging tools for script execution
- **Cutscene Transitions**: Smooth transitions between cutscenes
- **Asset Streaming**: Streaming asset loading for large game packs
- **Collaborative Editing**: Multi-user editing capabilities
- **Plugin System**: Extensible node and action system

## 📄 License

This implementation is part of the PrinceTS game engine and follows the same licensing terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

---

**PrinceTS ECA & Cutscene System** - Visual scripting and timeline editing for game development 
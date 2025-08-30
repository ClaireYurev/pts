# PrinceTS Visual Game Maker Editor

A comprehensive visual game editor for creating PrinceTS game packs with an intuitive drag-and-drop interface.

## Features

### 🎮 Level Editor
- **Tile-based level design** with grid snapping
- **Entity placement** with visual feedback
- **Camera controls** with pan and zoom
- **Real-time preview** of your level

### 🎨 Visual Tools
- **Tile Palette** - Browse and select tiles from your tileset
- **Entity Palette** - Place game objects like players, enemies, collectibles
- **Trigger System** - Create interactive elements and events
- **Visual Scripting** - Event-Condition-Action rules without coding
- **Cutscene Timeline** - Create cinematic sequences

### 📦 Export/Import
- **Export to .ptspack format** - Compatible with PrinceTS engine
- **Import existing packs** - Load and edit existing game packs
- **Asset management** - Handle tilesets, sprites, and audio files

## File Structure

```
src/editor/
├── EditorApp.ts          # Main editor application
├── LevelCanvas.ts        # Canvas for level editing
├── TilePalette.ts        # Tile selection interface
├── EntityPalette.ts      # Entity placement tools
├── TriggerManager.ts     # Trigger system management
├── VisualScriptEditor.ts # Visual scripting interface
├── CutsceneTimeline.ts   # Cutscene creation tools
├── ExportManager.ts      # Pack export functionality
└── ImportManager.ts      # Pack import functionality
```

## Getting Started

### 1. Setup
1. Ensure you have TypeScript installed
2. Compile the editor: `tsc src/editor/*.ts --outDir dist/editor/`
3. Open `editor.html` in your browser

### 2. Basic Usage

#### Creating a Level
1. **Select Tile Mode** - Click the "Tile Mode" button
2. **Choose a Tile** - Click on a tile in the left palette
3. **Place Tiles** - Click on the canvas to place tiles
4. **Switch to Entity Mode** - Place game objects like players and enemies
5. **Add Triggers** - Create interactive elements

#### Visual Scripting
1. **Open Scripts Tab** - Click the "Scripts" tab on the right panel
2. **Add Rule** - Click "+ Add Rule" to create a new script
3. **Configure Event** - Choose when the script triggers
4. **Set Condition** - Define when the action should occur
5. **Choose Action** - Select what happens when triggered

#### Creating Cutscenes
1. **Open Cutscenes Tab** - Click the "Cutscenes" tab
2. **Add Event** - Click "+ Add Event" to add a timeline event
3. **Set Time** - Choose when the event occurs
4. **Configure Action** - Select what happens (message, camera move, etc.)

### 3. Exporting Your Game
1. **Click Export** - Use the "Export" button in the header
2. **Choose Format** - Select .ptspack.json or .ptspack.zip
3. **Download** - Your game pack will be downloaded

## Controls

### Mouse Controls
- **Left Click** - Place tiles/entities/triggers
- **Middle Mouse** - Pan camera
- **Right Click** - Context menu for editing
- **Mouse Wheel** - Zoom in/out

### Keyboard Shortcuts
- **G** - Toggle grid display
- **R** - Reset camera position
- **Ctrl+S** - Save project
- **Ctrl+O** - Open project
- **Ctrl+E** - Export pack

## Supported File Formats

### Import
- `.json` - PrinceTS pack files
- `.ptspack.json` - PrinceTS pack files
- `.ptspack` - PrinceTS pack files

### Export
- `.ptspack.json` - Standard PrinceTS pack format
- `.ptspack.zip` - Compressed pack with assets
- `.json` - Raw JSON format

## Trigger Types

The editor supports various trigger types:

- **Damage** - Deals damage when triggered
- **Teleport** - Moves player to new location
- **Spawn** - Creates new entities
- **Message** - Displays text to player
- **Checkpoint** - Sets respawn point
- **Door** - Opens/closes doors
- **Platform** - Moves platforms
- **Sound** - Plays audio effects

## Script Actions

Available script actions include:

- **spawnEnemy** - Create enemy entities
- **spawnItem** - Create collectible items
- **teleportPlayer** - Move player character
- **showMessage** - Display text messages
- **playSound** - Play audio effects
- **changeLevel** - Switch to different level
- **setVariable** - Modify game variables
- **activateTrigger** - Enable triggers
- **giveItem** - Add items to player inventory

## Tips and Best Practices

### Level Design
- Use consistent tile sizes (32x32 recommended)
- Create clear pathways for players
- Test your level frequently
- Use triggers for interactive elements

### Performance
- Keep entity counts reasonable
- Optimize trigger areas
- Use efficient tile patterns
- Test on target platforms

### Organization
- Name your entities and triggers clearly
- Use descriptive script names
- Document complex interactions
- Version control your projects

## Troubleshooting

### Common Issues

**Editor won't load**
- Check browser console for errors
- Ensure all TypeScript files are compiled
- Verify file paths are correct

**Can't place tiles/entities**
- Make sure you're in the correct mode
- Check that a tile/entity is selected
- Verify canvas is focused

**Export fails**
- Check that all required fields are filled
- Ensure pack name is valid
- Verify file permissions

**Import doesn't work**
- Check file format compatibility
- Verify JSON syntax is valid
- Ensure all required assets are present

## Development

### Adding New Features

1. **Create new component** in `src/editor/`
2. **Update EditorApp.ts** to integrate the component
3. **Add UI elements** to `editor.html`
4. **Style with CSS** in `editor.css`
5. **Test thoroughly** before committing

### Extending Trigger Types

1. **Add to TriggerManager.ts** in `initializeDefaultTriggerTypes()`
2. **Define parameters** and validation rules
3. **Update UI** to support new trigger type
4. **Test in game engine**

### Custom Script Actions

1. **Add to VisualScriptEditor.ts** in the actions array
2. **Define parameters** and descriptions
3. **Update export format** if needed
4. **Test with game engine**

## License

This editor is part of the PrinceTS project and follows the same licensing terms.

## Support

For issues and questions:
1. Check this documentation
2. Review the code comments
3. Test with simple examples
4. Report bugs with detailed information

---

**Happy Game Making! 🎮** 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building PrinceTS Visual Game Maker Editor...');

// Create dist/editor directory if it doesn't exist
const distDir = path.join(__dirname, 'dist', 'editor');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('Created dist/editor directory');
}

// Compile TypeScript files
try {
    console.log('Compiling TypeScript files...');
    
    // Compile each editor file individually
    const editorFiles = [
        'LevelCanvas.ts',
        'TilePalette.ts', 
        'EntityPalette.ts',
        'TriggerManager.ts',
        'VisualScriptEditor.ts',
        'CutsceneTimeline.ts',
        'ExportManager.ts',
        'ImportManager.ts',
        'EditorApp.ts'
    ];

    for (const file of editorFiles) {
        const inputFile = path.join(__dirname, 'src', 'editor', file);
        const outputFile = path.join(distDir, file.replace('.ts', '.js'));
        
        if (fs.existsSync(inputFile)) {
            execSync(`npx tsc "${inputFile}" --outDir "${distDir}" --target ES2020 --module ES2020 --moduleResolution node --declaration --sourceMap`, {
                stdio: 'inherit'
            });
            console.log(`✓ Compiled ${file}`);
        } else {
            console.warn(`⚠ File not found: ${inputFile}`);
        }
    }

    console.log('\n✅ Editor build completed successfully!');
    console.log('\nTo use the editor:');
    console.log('1. Open editor.html in your browser');
    console.log('2. Start creating your game levels!');
    console.log('\nFor more information, see EDITOR_README.md');

} catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
} 
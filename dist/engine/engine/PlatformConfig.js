export class PlatformManager {
    static getPlatform(key) {
        return this.platforms[key] || null;
    }
    static getAllPlatforms() {
        return Object.values(this.platforms);
    }
    static getPlatformsByCategory(category) {
        return Object.values(this.platforms).filter(p => p.category === category);
    }
    static getCurrentPlatform() {
        return this.platforms[this.currentPlatform];
    }
    static setCurrentPlatform(key) {
        if (this.platforms[key]) {
            this.currentPlatform = key;
            return true;
        }
        return false;
    }
    static getPlatformKeys() {
        return Object.keys(this.platforms);
    }
    static getPlatformNames() {
        return Object.values(this.platforms).map(p => p.name);
    }
    static getPlatformByName(name) {
        return Object.values(this.platforms).find(p => p.name === name) || null;
    }
    static getPlatformsByYear(year) {
        return Object.values(this.platforms).filter(p => p.year === year);
    }
    static getPlatformsByResolution(width, height) {
        return Object.values(this.platforms).filter(p => p.resolution.width === width && p.resolution.height === height);
    }
    static getUniqueResolutions() {
        const resolutionMap = new Map();
        Object.values(this.platforms).forEach(platform => {
            const key = `${platform.resolution.width}x${platform.resolution.height}`;
            if (!resolutionMap.has(key)) {
                resolutionMap.set(key, {
                    width: platform.resolution.width,
                    height: platform.resolution.height,
                    platforms: []
                });
            }
            resolutionMap.get(key).platforms.push(platform);
        });
        return Array.from(resolutionMap.values()).sort((a, b) => (a.width * a.height) - (b.width * b.height));
    }
}
PlatformManager.platforms = {
    // 🖥️ Original & Early Computer Releases
    'apple-ii': {
        name: 'Apple II',
        year: 1989,
        category: 'computer',
        resolution: { width: 280, height: 192 },
        aspectRatio: 280 / 192,
        colors: 16,
        description: 'Original Apple II release with 280x192 resolution',
        features: ['Original release', 'Apple II graphics'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'ibm-pc-cga': {
        name: 'IBM PC (CGA)',
        year: 1990,
        category: 'computer',
        resolution: { width: 320, height: 200 },
        aspectRatio: 320 / 200,
        colors: 4,
        description: 'IBM PC with CGA graphics - 4 colors',
        features: ['CGA graphics', '4 colors', 'DOS'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'ibm-pc-ega': {
        name: 'IBM PC (EGA)',
        year: 1990,
        category: 'computer',
        resolution: { width: 320, height: 200 },
        aspectRatio: 320 / 200,
        colors: 16,
        description: 'IBM PC with EGA graphics - 16 colors',
        features: ['EGA graphics', '16 colors', 'DOS'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'ibm-pc-vga': {
        name: 'IBM PC (VGA)',
        year: 1990,
        category: 'computer',
        resolution: { width: 320, height: 200 },
        aspectRatio: 320 / 200,
        colors: 256,
        description: 'IBM PC with VGA graphics - 256 colors',
        features: ['VGA graphics', '256 colors', 'DOS'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'amiga': {
        name: 'Amiga',
        year: 1990,
        category: 'computer',
        resolution: { width: 320, height: 200 },
        aspectRatio: 320 / 200,
        colors: 32,
        description: 'Amiga with up to 32 colors',
        features: ['Amiga graphics', '32 colors', 'Enhanced audio'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'atari-st': {
        name: 'Atari ST',
        year: 1990,
        category: 'computer',
        resolution: { width: 320, height: 200 },
        aspectRatio: 320 / 200,
        colors: 16,
        description: 'Atari ST with 16 colors',
        features: ['Atari ST graphics', '16 colors'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'macintosh': {
        name: 'Macintosh',
        year: 1990,
        category: 'computer',
        resolution: { width: 512, height: 342 },
        aspectRatio: 512 / 342,
        colors: 256,
        description: 'Macintosh with high resolution graphics',
        features: ['High resolution', 'Mac graphics', 'B&W/grayscale/color'],
        scalingMode: 'smooth',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'fm-towns': {
        name: 'FM Towns',
        year: 1990,
        category: 'computer',
        resolution: { width: 640, height: 480 },
        aspectRatio: 640 / 480,
        colors: 256,
        description: 'FM Towns with upgraded graphics and music',
        features: ['High resolution', 'Enhanced graphics', 'CD audio', 'Japan exclusive'],
        scalingMode: 'smooth',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'sharp-x68000': {
        name: 'Sharp X68000',
        year: 1990,
        category: 'computer',
        resolution: { width: 512, height: 512 },
        aspectRatio: 1,
        colors: 256,
        description: 'Sharp X68000 with arcade-quality graphics',
        features: ['Arcade-quality', 'Square aspect ratio', 'Japan exclusive'],
        scalingMode: 'smooth',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    // 🎮 Home Consoles
    'nes': {
        name: 'NES / Famicom',
        year: 1992,
        category: 'console',
        resolution: { width: 256, height: 240 },
        aspectRatio: 256 / 240,
        colors: 52,
        description: 'Nintendo Entertainment System / Famicom',
        features: ['8-bit graphics', 'NES sprites', 'Classic console'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'snes': {
        name: 'Super Nintendo (SNES)',
        year: 1992,
        category: 'console',
        resolution: { width: 256, height: 224 },
        aspectRatio: 256 / 224,
        colors: 256,
        description: 'Super Nintendo with enhanced graphics',
        features: ['16-bit graphics', 'Enhanced sprites', 'Mode 7 effects'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'genesis': {
        name: 'Sega Genesis / Mega Drive',
        year: 1993,
        category: 'console',
        resolution: { width: 320, height: 224 },
        aspectRatio: 320 / 224,
        colors: 64,
        description: 'Sega Genesis / Mega Drive',
        features: ['16-bit graphics', 'Blast processing', 'Genesis sprites'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'sega-cd': {
        name: 'Sega CD / Mega CD',
        year: 1992,
        category: 'console',
        resolution: { width: 320, height: 224 },
        aspectRatio: 320 / 224,
        colors: 64,
        description: 'Sega CD with CD audio and cutscenes',
        features: ['CD audio', 'Cutscenes', 'Enhanced graphics'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    'turbografx-cd': {
        name: 'TurboGrafx-CD / PC Engine CD',
        year: 1991,
        category: 'console',
        resolution: { width: 320, height: 224 },
        aspectRatio: 320 / 224,
        colors: 256,
        description: 'TurboGrafx-CD with enhanced graphics and CD audio',
        features: ['CD audio', 'Enhanced graphics', 'Japan first'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    // 📱 Handheld Systems
    'game-boy': {
        name: 'Game Boy',
        year: 1992,
        category: 'handheld',
        resolution: { width: 160, height: 144 },
        aspectRatio: 160 / 144,
        colors: 4,
        description: 'Original Game Boy in monochrome',
        features: ['Monochrome', 'Portable', '4 shades of green'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#0f380f',
        borderColor: '#306230'
    },
    'game-boy-color': {
        name: 'Game Boy Color',
        year: 1999,
        category: 'handheld',
        resolution: { width: 160, height: 144 },
        aspectRatio: 160 / 144,
        colors: 56,
        description: 'Game Boy Color with 56 colors',
        features: ['Color graphics', '56 colors', 'Enhanced sprites'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#0f380f',
        borderColor: '#306230'
    },
    'game-gear': {
        name: 'Sega Game Gear',
        year: 1992,
        category: 'handheld',
        resolution: { width: 160, height: 144 },
        aspectRatio: 160 / 144,
        colors: 32,
        description: 'Sega Game Gear with color graphics',
        features: ['Color graphics', '32 colors', 'Backlit screen'],
        scalingMode: 'pixel-perfect',
        backgroundColor: '#000000',
        borderColor: '#333333'
    },
    // 💻 Later Computer / Special Editions
    'windows-3x': {
        name: 'Windows 3.x / Windows 95',
        year: 1992,
        category: 'computer',
        resolution: { width: 320, height: 200 },
        aspectRatio: 320 / 200,
        colors: 256,
        description: 'Windows ports with windowed/fullscreen modes',
        features: ['Windows GUI', 'Windowed mode', 'Fullscreen mode'],
        scalingMode: 'smooth',
        backgroundColor: '#000000',
        borderColor: '#333333'
    }
};
PlatformManager.currentPlatform = 'snes';
//# sourceMappingURL=PlatformConfig.js.map
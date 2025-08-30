/**
 * AudioManager - Handles audio playback with volume control and autoplay policy compliance
 */
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        // Volume levels (0.0 to 1.0)
        this.masterVolume = 1.0;
        this.musicVolume = 0.8;
        this.sfxVolume = 0.9;
        this.isMuted = true; // Start muted for autoplay safety
        // Audio buffers cache
        this.audioBuffers = new Map();
        this.activeMusic = null;
        this.activeSfx = new Set();
        // Settings
        this.latencyMode = 'auto';
        this.userInteracted = false;
        this.initializeAudioContext();
    }
    initializeAudioContext() {
        try {
            // Create audio context with optimal settings
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass({
                latencyHint: this.getLatencyHint(),
                sampleRate: 44100
            });
            // Create gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            // Connect the gain chain
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            // Set initial volumes
            this.updateVolumes();
            console.log('AudioManager initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize AudioManager:', error);
        }
    }
    getLatencyHint() {
        switch (this.latencyMode) {
            case 'low':
                return 'interactive';
            case 'compat':
                return 'balanced';
            case 'auto':
            default:
                return 'interactive';
        }
    }
    setLatencyMode(mode) {
        this.latencyMode = mode;
        // Note: AudioContext latency cannot be changed after creation
        // This setting will apply to new contexts if recreated
    }
    setLatencyHint(latency) {
        this.setLatencyMode(latency);
    }
    onUserInteraction() {
        if (!this.userInteracted && this.audioContext) {
            this.userInteracted = true;
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            // Unmute if this is the first user interaction
            if (this.isMuted) {
                this.setMuted(false);
            }
            console.log('AudioManager: User interaction detected, audio enabled');
        }
    }
    async loadAudio(url, type = 'sfx') {
        if (!this.audioContext) {
            console.error('AudioContext not available');
            return;
        }
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioBuffers.set(url, audioBuffer);
            console.log(`Audio loaded: ${url}`);
        }
        catch (error) {
            console.error(`Failed to load audio ${url}:`, error);
        }
    }
    playMusic(url, loop = true, fadeIn = 0) {
        if (!this.audioContext || !this.musicGain || this.isMuted)
            return;
        const buffer = this.audioBuffers.get(url);
        if (!buffer) {
            console.warn(`Music not loaded: ${url}`);
            return;
        }
        // Stop current music
        this.stopMusic();
        // Create new music source
        this.activeMusic = this.audioContext.createBufferSource();
        this.activeMusic.buffer = buffer;
        this.activeMusic.loop = loop;
        // Apply fade in if specified
        if (fadeIn > 0) {
            this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.musicGain.gain.linearRampToValueAtTime(this.musicVolume * this.masterVolume, this.audioContext.currentTime + fadeIn);
        }
        this.activeMusic.connect(this.musicGain);
        this.activeMusic.start();
    }
    stopMusic(fadeOut = 0) {
        if (!this.activeMusic || !this.audioContext)
            return;
        if (fadeOut > 0) {
            this.musicGain?.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOut);
            setTimeout(() => {
                this.activeMusic?.stop();
                this.activeMusic = null;
            }, fadeOut * 1000);
        }
        else {
            this.activeMusic.stop();
            this.activeMusic = null;
        }
    }
    playSfx(url, volume = 1.0) {
        if (!this.audioContext || !this.sfxGain || this.isMuted)
            return;
        const buffer = this.audioBuffers.get(url);
        if (!buffer) {
            console.warn(`SFX not loaded: ${url}`);
            return;
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        // Create temporary gain node for this SFX
        const sfxGain = this.audioContext.createGain();
        sfxGain.gain.value = volume * this.sfxVolume * this.masterVolume;
        source.connect(sfxGain);
        sfxGain.connect(this.sfxGain);
        this.activeSfx.add(source);
        source.onended = () => {
            this.activeSfx.delete(source);
        };
        source.start();
    }
    stopAllSfx() {
        this.activeSfx.forEach(source => {
            try {
                source.stop();
            }
            catch (e) {
                // Source might already be stopped
            }
        });
        this.activeSfx.clear();
    }
    // Volume controls
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
    setMuted(muted) {
        this.isMuted = muted;
        this.updateVolumes();
    }
    updateVolumes() {
        if (!this.masterGain || !this.musicGain || !this.sfxGain)
            return;
        const effectiveMasterVolume = this.isMuted ? 0 : this.masterVolume;
        this.masterGain.gain.setValueAtTime(effectiveMasterVolume, this.audioContext?.currentTime || 0);
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext?.currentTime || 0);
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext?.currentTime || 0);
    }
    // Getters
    getMasterVolume() { return this.masterVolume; }
    getMusicVolume() { return this.musicVolume; }
    getSfxVolume() { return this.sfxVolume; }
    isAudioMuted() { return this.isMuted; }
    hasUserInteracted() { return this.userInteracted; }
    // Cleanup
    dispose() {
        this.stopMusic();
        this.stopAllSfx();
        this.audioBuffers.clear();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
    cleanup() {
        this.dispose();
    }
}
//# sourceMappingURL=AudioManager.js.map
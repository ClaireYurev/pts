/**
 * AudioManager - Handles audio playback with volume control and autoplay policy compliance
 */
export class AudioManager {
    constructor() {
        this.masterVolume = 1.0;
        this.musicVolume = 0.8;
        this.sfxVolume = 1.0;
        this.muted = false;
        this.latencyHint = 'auto';
        // Audio context for Web Audio API
        this.audioContext = null;
        this.gainNode = null;
        // Track if user has interacted (for autoplay policy)
        this.hasUserInteracted = false;
        // Audio elements cache
        this.audioElements = new Map();
        this.initializeAudioContext();
        this.setupUserInteractionHandling();
    }
    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            // Create audio context with latency hint
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass({
                    latencyHint: this.latencyHint === 'low' ? 'interactive' : 'balanced'
                });
                // Create master gain node
                this.gainNode = this.audioContext.createGain();
                this.gainNode.connect(this.audioContext.destination);
                // Set initial volume
                this.updateMasterGain();
                console.log('AudioManager: Web Audio API initialized successfully');
            }
        }
        catch (error) {
            console.warn('AudioManager: Web Audio API not available, falling back to HTML5 audio:', error);
        }
    }
    /**
     * Setup user interaction handling for autoplay policy compliance
     */
    setupUserInteractionHandling() {
        const interactionEvents = ['mousedown', 'keydown', 'touchstart', 'click'];
        const handleUserInteraction = () => {
            if (!this.hasUserInteracted) {
                this.hasUserInteracted = true;
                // Resume audio context if suspended
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume().catch(error => {
                        console.warn('AudioManager: Failed to resume audio context:', error);
                    });
                }
                // Remove event listeners after first interaction
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, handleUserInteraction);
                });
                console.log('AudioManager: User interaction detected, audio enabled');
            }
        };
        // Add event listeners
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { once: true });
        });
    }
    /**
     * Set master volume (0.0 to 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateMasterGain();
        console.log(`AudioManager: Master volume set to ${this.masterVolume}`);
    }
    /**
     * Set music volume (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log(`AudioManager: Music volume set to ${this.musicVolume}`);
    }
    /**
     * Set SFX volume (0.0 to 1.0)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`AudioManager: SFX volume set to ${this.sfxVolume}`);
    }
    /**
     * Set muted state
     */
    setMuted(muted) {
        this.muted = muted;
        this.updateMasterGain();
        console.log(`AudioManager: Muted state set to ${this.muted}`);
    }
    /**
     * Check if audio is muted
     */
    isMuted() {
        return this.muted;
    }
    /**
     * Set audio latency hint
     */
    setLatencyHint(hint) {
        this.latencyHint = hint;
        console.log(`AudioManager: Latency hint set to ${hint}`);
        // Reinitialize audio context with new latency hint if needed
        if (this.audioContext && this.audioContext.state === 'running') {
            // Note: AudioContext latency hint cannot be changed after creation
            // This is stored for future context recreation
        }
    }
    /**
     * Get current volume levels
     */
    getVolumes() {
        return {
            master: this.masterVolume,
            music: this.musicVolume,
            sfx: this.sfxVolume
        };
    }
    /**
     * Get current latency hint
     */
    getLatencyHint() {
        return this.latencyHint;
    }
    /**
     * Check if user has interacted (for autoplay policy)
     */
    hasUserInteractedWithPage() {
        return this.hasUserInteracted;
    }
    /**
     * Update master gain node
     */
    updateMasterGain() {
        if (this.gainNode) {
            const effectiveVolume = this.muted ? 0 : this.masterVolume;
            this.gainNode.gain.setValueAtTime(effectiveVolume, this.audioContext?.currentTime || 0);
        }
    }
    /**
     * Play music track (stub implementation)
     */
    playMusic(trackId) {
        console.log(`AudioManager: Playing music track ${trackId} (stub)`);
        // TODO: Implement actual music playback
    }
    /**
     * Stop music (stub implementation)
     */
    stopMusic() {
        console.log('AudioManager: Stopping music (stub)');
        // TODO: Implement actual music stop
    }
    /**
     * Play sound effect (stub implementation)
     */
    playSfx(sfxId) {
        console.log(`AudioManager: Playing SFX ${sfxId} (stub)`);
        // TODO: Implement actual SFX playback
    }
    /**
     * Load and cache audio element
     */
    async loadAudio(src, id) {
        if (this.audioElements.has(id)) {
            return this.audioElements.get(id);
        }
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audioElements.set(id, audio);
                resolve(audio);
            };
            audio.onerror = () => {
                reject(new Error(`Failed to load audio: ${src}`));
            };
            audio.src = src;
            audio.load();
        });
    }
    /**
     * Clean up resources
     */
    cleanup() {
        try {
            // Stop and clear all audio elements
            this.audioElements.forEach(audio => {
                audio.pause();
                audio.src = '';
            });
            this.audioElements.clear();
            // Close audio context
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            console.log('AudioManager: Cleanup completed');
        }
        catch (error) {
            console.error('AudioManager: Error during cleanup:', error);
        }
    }
}
//# sourceMappingURL=AudioManager.js.map
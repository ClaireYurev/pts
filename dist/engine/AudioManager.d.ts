import { AudioLatency } from './types.js';
/**
 * AudioManager - Handles audio playback with volume control and autoplay policy compliance
 */
export declare class AudioManager {
    private masterVolume;
    private musicVolume;
    private sfxVolume;
    private muted;
    private latencyHint;
    private audioContext;
    private gainNode;
    private hasUserInteracted;
    private audioElements;
    constructor();
    /**
     * Initialize Web Audio API context
     */
    private initializeAudioContext;
    /**
     * Setup user interaction handling for autoplay policy compliance
     */
    private setupUserInteractionHandling;
    /**
     * Set master volume (0.0 to 1.0)
     */
    setMasterVolume(volume: number): void;
    /**
     * Set music volume (0.0 to 1.0)
     */
    setMusicVolume(volume: number): void;
    /**
     * Set SFX volume (0.0 to 1.0)
     */
    setSfxVolume(volume: number): void;
    /**
     * Set muted state
     */
    setMuted(muted: boolean): void;
    /**
     * Check if audio is muted
     */
    isMuted(): boolean;
    /**
     * Set audio latency hint
     */
    setLatencyHint(hint: AudioLatency): void;
    /**
     * Get current volume levels
     */
    getVolumes(): {
        master: number;
        music: number;
        sfx: number;
    };
    /**
     * Get current latency hint
     */
    getLatencyHint(): AudioLatency;
    /**
     * Check if user has interacted (for autoplay policy)
     */
    hasUserInteractedWithPage(): boolean;
    /**
     * Update master gain node
     */
    private updateMasterGain;
    /**
     * Play music track (stub implementation)
     */
    playMusic(trackId: string): void;
    /**
     * Stop music (stub implementation)
     */
    stopMusic(): void;
    /**
     * Play sound effect (stub implementation)
     */
    playSfx(sfxId: string): void;
    /**
     * Load and cache audio element
     */
    loadAudio(src: string, id: string): Promise<HTMLAudioElement>;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
//# sourceMappingURL=AudioManager.d.ts.map
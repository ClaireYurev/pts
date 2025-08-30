/**
 * AudioManager - Handles audio playback with volume control and autoplay policy compliance
 */
export declare class AudioManager {
    private audioContext;
    private masterGain;
    private musicGain;
    private sfxGain;
    private masterVolume;
    private musicVolume;
    private sfxVolume;
    private isMuted;
    private audioBuffers;
    private activeMusic;
    private activeSfx;
    private latencyMode;
    private userInteracted;
    constructor();
    private initializeAudioContext;
    private getLatencyHint;
    setLatencyMode(mode: 'auto' | 'low' | 'compat'): void;
    setLatencyHint(latency: 'auto' | 'low' | 'compat'): void;
    onUserInteraction(): void;
    loadAudio(url: string, type?: 'music' | 'sfx'): Promise<void>;
    playMusic(url: string, loop?: boolean, fadeIn?: number): void;
    stopMusic(fadeOut?: number): void;
    playSfx(url: string, volume?: number): void;
    stopAllSfx(): void;
    setMasterVolume(volume: number): void;
    setMusicVolume(volume: number): void;
    setSfxVolume(volume: number): void;
    setMuted(muted: boolean): void;
    private updateVolumes;
    getMasterVolume(): number;
    getMusicVolume(): number;
    getSfxVolume(): number;
    isAudioMuted(): boolean;
    hasUserInteracted(): boolean;
    dispose(): void;
    cleanup(): void;
}
//# sourceMappingURL=AudioManager.d.ts.map
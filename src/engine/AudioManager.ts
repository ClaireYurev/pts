import { AudioLatency } from './types.js';

/**
 * AudioManager - Handles audio playback with volume control and autoplay policy compliance
 */
export class AudioManager {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    
    // Volume levels (0.0 to 1.0)
    private masterVolume = 1.0;
    private musicVolume = 0.8;
    private sfxVolume = 0.9;
    private isMuted = true; // Start muted for autoplay safety
    
    // Audio buffers cache
    private audioBuffers: Map<string, AudioBuffer> = new Map();
    private activeMusic: AudioBufferSourceNode | null = null;
    private activeSfx: Set<AudioBufferSourceNode> = new Set();
    
    // Settings
    private latencyMode: 'auto' | 'low' | 'compat' = 'auto';
    private userInteracted = false;

    constructor() {
        this.initializeAudioContext();
    }

    private initializeAudioContext(): void {
        try {
            // Create audio context with optimal settings
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
        }
    }

    private getLatencyHint(): AudioContextLatencyCategory {
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

    public setLatencyMode(mode: 'auto' | 'low' | 'compat'): void {
        this.latencyMode = mode;
        // Note: AudioContext latency cannot be changed after creation
        // This setting will apply to new contexts if recreated
    }

    public setLatencyHint(latency: 'auto' | 'low' | 'compat'): void {
        this.setLatencyMode(latency);
    }

    public onUserInteraction(): void {
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

    public async loadAudio(url: string, type: 'music' | 'sfx' = 'sfx'): Promise<void> {
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
        } catch (error) {
            console.error(`Failed to load audio ${url}:`, error);
        }
    }

    public playMusic(url: string, loop: boolean = true, fadeIn: number = 0): void {
        if (!this.audioContext || !this.musicGain || this.isMuted) return;

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
            this.musicGain.gain.linearRampToValueAtTime(
                this.musicVolume * this.masterVolume,
                this.audioContext.currentTime + fadeIn
            );
        }

        this.activeMusic.connect(this.musicGain);
        this.activeMusic.start();
    }

    public stopMusic(fadeOut: number = 0): void {
        if (!this.activeMusic || !this.audioContext) return;

        if (fadeOut > 0) {
            this.musicGain?.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOut);
            setTimeout(() => {
                this.activeMusic?.stop();
                this.activeMusic = null;
            }, fadeOut * 1000);
        } else {
            this.activeMusic.stop();
            this.activeMusic = null;
        }
    }

    public playSfx(url: string, volume: number = 1.0): void {
        if (!this.audioContext || !this.sfxGain || this.isMuted) return;

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

    public stopAllSfx(): void {
        this.activeSfx.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        });
        this.activeSfx.clear();
    }

    // Volume controls
    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    public setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    public setMuted(muted: boolean): void {
        this.isMuted = muted;
        this.updateVolumes();
    }

    private updateVolumes(): void {
        if (!this.masterGain || !this.musicGain || !this.sfxGain) return;

        const effectiveMasterVolume = this.isMuted ? 0 : this.masterVolume;
        
        this.masterGain.gain.setValueAtTime(effectiveMasterVolume, this.audioContext?.currentTime || 0);
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext?.currentTime || 0);
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext?.currentTime || 0);
    }

    // Getters
    public getMasterVolume(): number { return this.masterVolume; }
    public getMusicVolume(): number { return this.musicVolume; }
    public getSfxVolume(): number { return this.sfxVolume; }
    public isAudioMuted(): boolean { return this.isMuted; }
    public hasUserInteracted(): boolean { return this.userInteracted; }

    // Cleanup
    public dispose(): void {
        this.stopMusic();
        this.stopAllSfx();
        this.audioBuffers.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    public cleanup(): void {
        this.dispose();
    }
} 
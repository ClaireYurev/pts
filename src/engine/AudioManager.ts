import { AudioLatency } from './types.js';

/**
 * AudioManager - Handles audio playback with volume control and autoplay policy compliance
 */
export class AudioManager {
    private masterVolume = 1.0;
    private musicVolume = 0.8;
    private sfxVolume = 1.0;
    private muted = false;
    private latencyHint: AudioLatency = 'auto';
    
    // Audio context for Web Audio API
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    
    // Track if user has interacted (for autoplay policy)
    private hasUserInteracted = false;
    
    // Audio elements cache
    private audioElements = new Map<string, HTMLAudioElement>();
    
    constructor() {
        this.initializeAudioContext();
        this.setupUserInteractionHandling();
    }
    
    /**
     * Initialize Web Audio API context
     */
    private initializeAudioContext(): void {
        try {
            // Create audio context with latency hint
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
        } catch (error) {
            console.warn('AudioManager: Web Audio API not available, falling back to HTML5 audio:', error);
        }
    }
    
    /**
     * Setup user interaction handling for autoplay policy compliance
     */
    private setupUserInteractionHandling(): void {
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
    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateMasterGain();
        console.log(`AudioManager: Master volume set to ${this.masterVolume}`);
    }
    
    /**
     * Set music volume (0.0 to 1.0)
     */
    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log(`AudioManager: Music volume set to ${this.musicVolume}`);
    }
    
    /**
     * Set SFX volume (0.0 to 1.0)
     */
    public setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`AudioManager: SFX volume set to ${this.sfxVolume}`);
    }
    
    /**
     * Set muted state
     */
    public setMuted(muted: boolean): void {
        this.muted = muted;
        this.updateMasterGain();
        console.log(`AudioManager: Muted state set to ${this.muted}`);
    }
    
    /**
     * Check if audio is muted
     */
    public isMuted(): boolean {
        return this.muted;
    }
    
    /**
     * Set audio latency hint
     */
    public setLatencyHint(hint: AudioLatency): void {
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
    public getVolumes(): { master: number; music: number; sfx: number } {
        return {
            master: this.masterVolume,
            music: this.musicVolume,
            sfx: this.sfxVolume
        };
    }
    
    /**
     * Get current latency hint
     */
    public getLatencyHint(): AudioLatency {
        return this.latencyHint;
    }
    
    /**
     * Check if user has interacted (for autoplay policy)
     */
    public hasUserInteractedWithPage(): boolean {
        return this.hasUserInteracted;
    }
    
    /**
     * Update master gain node
     */
    private updateMasterGain(): void {
        if (this.gainNode) {
            const effectiveVolume = this.muted ? 0 : this.masterVolume;
            this.gainNode.gain.setValueAtTime(effectiveVolume, this.audioContext?.currentTime || 0);
        }
    }
    
    /**
     * Play music track (stub implementation)
     */
    public playMusic(trackId: string): void {
        console.log(`AudioManager: Playing music track ${trackId} (stub)`);
        // TODO: Implement actual music playback
    }
    
    /**
     * Stop music (stub implementation)
     */
    public stopMusic(): void {
        console.log('AudioManager: Stopping music (stub)');
        // TODO: Implement actual music stop
    }
    
    /**
     * Play sound effect (stub implementation)
     */
    public playSfx(sfxId: string): void {
        console.log(`AudioManager: Playing SFX ${sfxId} (stub)`);
        // TODO: Implement actual SFX playback
    }
    
    /**
     * Load and cache audio element
     */
    public async loadAudio(src: string, id: string): Promise<HTMLAudioElement> {
        if (this.audioElements.has(id)) {
            return this.audioElements.get(id)!;
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
    public cleanup(): void {
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
        } catch (error) {
            console.error('AudioManager: Error during cleanup:', error);
        }
    }
} 
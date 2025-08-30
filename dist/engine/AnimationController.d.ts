interface Frame {
    image: HTMLImageElement;
    duration: number;
}
interface Animation {
    name: string;
    frames: Frame[];
    loop: boolean;
}
export declare class AnimationController {
    private animations;
    private current?;
    private frameIndex;
    private elapsed;
    play(name: string): void;
    update(dt: number): void;
    getCurrentImage(): HTMLImageElement | null;
    addAnimation(anim: Animation): void;
    isPlaying(name: string): boolean;
    stop(): void;
}
export {};
//# sourceMappingURL=AnimationController.d.ts.map
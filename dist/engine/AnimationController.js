export class AnimationController {
    constructor() {
        this.animations = {};
        this.frameIndex = 0;
        this.elapsed = 0;
    }
    play(name) {
        if (this.current?.name !== name) {
            this.current = this.animations[name];
            this.frameIndex = 0;
            this.elapsed = 0;
        }
    }
    update(dt) {
        if (!this.current)
            return;
        // Validate delta time
        if (!isFinite(dt) || dt < 0) {
            console.warn("Invalid delta time provided to animation controller");
            return;
        }
        const clampedDt = Math.max(0, Math.min(dt, 1 / 30)); // Cap at 30 FPS equivalent
        this.elapsed += clampedDt;
        // Validate frame index
        if (this.frameIndex < 0 || this.frameIndex >= this.current.frames.length) {
            console.warn("Invalid frame index in animation, resetting to 0");
            this.frameIndex = 0;
            this.elapsed = 0;
            return;
        }
        const frame = this.current.frames[this.frameIndex];
        if (!frame) {
            console.warn("Invalid frame in animation");
            return;
        }
        if (this.elapsed >= frame.duration) {
            this.elapsed -= frame.duration;
            this.frameIndex++;
            if (this.frameIndex >= this.current.frames.length) {
                if (this.current.loop) {
                    this.frameIndex = 0;
                }
                else {
                    this.frameIndex = this.current.frames.length - 1;
                    // Non-looping, stay on last frame
                }
            }
        }
    }
    getCurrentImage() {
        if (!this.current || !this.current.frames[this.frameIndex]) {
            return null;
        }
        const frame = this.current.frames[this.frameIndex];
        if (!frame || !frame.image) {
            console.warn("Invalid frame or image in animation");
            return null;
        }
        // Check if image is loaded and valid
        if (!frame.image.complete || frame.image.naturalWidth === 0) {
            console.warn("Animation image not fully loaded");
            return null;
        }
        return frame.image;
    }
    addAnimation(anim) {
        // Validate animation data
        if (!anim || !anim.name || !anim.frames || anim.frames.length === 0) {
            console.error("Invalid animation data provided");
            return;
        }
        // Validate frames and handle image loading errors
        const validFrames = [];
        for (let i = 0; i < anim.frames.length; i++) {
            const frame = anim.frames[i];
            if (!frame || !frame.image || frame.duration <= 0) {
                console.error(`Invalid frame ${i} in animation ${anim.name}`);
                continue;
            }
            // Check if image is loaded
            if (!frame.image.complete) {
                console.warn(`Frame ${i} image not loaded in animation ${anim.name}`);
                // Add error handler for image loading
                frame.image.onerror = () => {
                    console.error(`Failed to load image for frame ${i} in animation ${anim.name}`);
                };
            }
            validFrames.push(frame);
        }
        if (validFrames.length === 0) {
            console.error(`No valid frames found for animation ${anim.name}`);
            return;
        }
        // Create new animation with only valid frames
        const validAnimation = {
            name: anim.name,
            frames: validFrames,
            loop: anim.loop
        };
        this.animations[anim.name] = validAnimation;
    }
    isPlaying(name) {
        return this.current?.name === name;
    }
    stop() {
        this.current = undefined;
        this.frameIndex = 0;
        this.elapsed = 0;
    }
}
//# sourceMappingURL=AnimationController.js.map
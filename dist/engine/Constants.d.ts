/**
 * Game Constants - Centralized configuration for the PrinceTS engine
 */
export declare const PHYSICS: {
    readonly DEFAULT_GRAVITY: 980;
    readonly DEFAULT_FLOOR_Y: 30000;
    readonly DEFAULT_MAX_VELOCITY: 2000;
    readonly DEFAULT_FRICTION: 0.99;
    readonly MIN_DELTA_TIME: 0;
    readonly MAX_DELTA_TIME: number;
    readonly GROUND_DETECTION_TOLERANCE: 10;
    readonly MIN_GROUND_DISTANCE: -5;
};
export declare const ENTITY: {
    readonly DEFAULT_WIDTH: 32;
    readonly DEFAULT_HEIGHT: 32;
    readonly DEFAULT_HEALTH: 100;
    readonly MAX_HEALTH: 9999;
    readonly MIN_HEALTH: 0;
    readonly MAX_LIVES: 99;
    readonly MIN_LIVES: 0;
    readonly MAX_SCORE: 999999;
    readonly MIN_SCORE: 0;
};
export declare const PLATFORM: {
    readonly MIN_RESOLUTION_WIDTH: 160;
    readonly MIN_RESOLUTION_HEIGHT: 144;
    readonly MAX_RESOLUTION_WIDTH: 4096;
    readonly MAX_RESOLUTION_HEIGHT: 4096;
    readonly DEFAULT_CELL_SIZE: 64;
    readonly BASE_SCALE_REFERENCE: 320;
};
export declare const INPUT: {
    readonly MOUSE_POSITION_TOLERANCE: 0.0001;
    readonly AXIS_MAGNITUDE_THRESHOLD: 0.0001;
    readonly MAX_MOUSE_COORDINATE: 10000;
    readonly MIN_MOUSE_COORDINATE: -10000;
};
export declare const SAVE: {
    readonly MAX_SLOTS: 10;
    readonly MIN_SLOTS: 0;
    readonly CURRENT_VERSION: 1;
    readonly SAVE_DATA_VERSION: 1;
    readonly MAX_STRING_LENGTH: 100;
    readonly MAX_URL_LENGTH: 500;
    readonly MAX_CHEAT_LENGTH: 50;
    readonly MAX_CHEATS_TOTAL_LENGTH: 200;
};
export declare const URL_PARAMS: {
    readonly MAX_LEVEL: 999;
    readonly MIN_LEVEL: 1;
    readonly MAX_PLAYER_POSITION: 10000;
    readonly MIN_PLAYER_POSITION: -10000;
    readonly MAX_TIME: 999999;
    readonly MIN_TIME: 0;
    readonly MAX_VOLUME: 1;
    readonly MIN_VOLUME: 0;
};
export declare const UI: {
    readonly MENU_Z_INDEX: 1000;
    readonly PLATFORM_SELECTOR_Z_INDEX: 2000;
    readonly LOADING_Z_INDEX: 10000;
    readonly ERROR_Z_INDEX: 10000;
    readonly BUTTON_HOVER_DELAY: 2000;
    readonly RESET_CONFIRMATION_TIMEOUT: 3000;
};
export declare const ANIMATION: {
    readonly DEFAULT_FRAME_RATE: 30;
    readonly MIN_FRAME_RATE: 1;
    readonly MAX_FRAME_RATE: 120;
};
export declare const COLLISION: {
    readonly DEFAULT_CELL_SIZE: 64;
    readonly ENTITY_COUNT_THRESHOLD: 5;
};
export declare const ERROR_RECOVERY: {
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 1000;
    readonly ERROR_DISPLAY_DURATION: 5000;
};
export declare const ACCESSIBILITY: {
    readonly TAB_INDEX_DISABLED: -1;
    readonly DEFAULT_TAB_INDEX: 0;
    readonly FOCUS_VISIBLE_CLASS: "focus-visible";
};
export declare const DEV: {
    readonly DEBUG_LOG_PREFIX: "[DEBUG]";
    readonly WARNING_LOG_PREFIX: "[WARNING]";
    readonly ERROR_LOG_PREFIX: "[ERROR]";
    readonly INFO_LOG_PREFIX: "[INFO]";
};
export declare const VALIDATION: {
    readonly URL_PATTERN: RegExp;
    readonly EMAIL_PATTERN: RegExp;
    readonly ALPHANUMERIC_PATTERN: RegExp;
    readonly SAFE_STRING_PATTERN: RegExp;
};
export declare const PERFORMANCE: {
    readonly TARGET_FPS: 60;
    readonly MIN_FPS: 30;
    readonly FRAME_TIME_BUDGET: 16.67;
    readonly MEMORY_WARNING_THRESHOLD: number;
    readonly GC_INTERVAL: 30000;
};
//# sourceMappingURL=Constants.d.ts.map
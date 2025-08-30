/**
 * Game Constants - Centralized configuration for the PrinceTS engine
 */
// Physics constants
export const PHYSICS = {
    DEFAULT_GRAVITY: 980,
    DEFAULT_FLOOR_Y: 30000,
    DEFAULT_MAX_VELOCITY: 2000,
    DEFAULT_FRICTION: 0.99,
    MIN_DELTA_TIME: 0,
    MAX_DELTA_TIME: 1 / 30, // Cap at 30 FPS equivalent
    GROUND_DETECTION_TOLERANCE: 10,
    MIN_GROUND_DISTANCE: -5
};
// Entity constants
export const ENTITY = {
    DEFAULT_WIDTH: 32,
    DEFAULT_HEIGHT: 32,
    DEFAULT_HEALTH: 100,
    MAX_HEALTH: 9999,
    MIN_HEALTH: 0,
    MAX_LIVES: 99,
    MIN_LIVES: 0,
    MAX_SCORE: 999999,
    MIN_SCORE: 0
};
// Platform constants
export const PLATFORM = {
    MIN_RESOLUTION_WIDTH: 160,
    MIN_RESOLUTION_HEIGHT: 144,
    MAX_RESOLUTION_WIDTH: 4096,
    MAX_RESOLUTION_HEIGHT: 4096,
    DEFAULT_CELL_SIZE: 64,
    BASE_SCALE_REFERENCE: 320 // Base scale relative to 320x240
};
// Input constants
export const INPUT = {
    MOUSE_POSITION_TOLERANCE: 0.0001,
    AXIS_MAGNITUDE_THRESHOLD: 0.0001,
    MAX_MOUSE_COORDINATE: 10000,
    MIN_MOUSE_COORDINATE: -10000
};
// Save system constants
export const SAVE = {
    MAX_SLOTS: 10,
    MIN_SLOTS: 0,
    CURRENT_VERSION: 1,
    SAVE_DATA_VERSION: 1,
    MAX_STRING_LENGTH: 100,
    MAX_URL_LENGTH: 500,
    MAX_CHEAT_LENGTH: 50,
    MAX_CHEATS_TOTAL_LENGTH: 200
};
// URL parameter constants
export const URL_PARAMS = {
    MAX_LEVEL: 999,
    MIN_LEVEL: 1,
    MAX_PLAYER_POSITION: 10000,
    MIN_PLAYER_POSITION: -10000,
    MAX_TIME: 999999,
    MIN_TIME: 0,
    MAX_VOLUME: 1,
    MIN_VOLUME: 0
};
// UI constants
export const UI = {
    MENU_Z_INDEX: 1000,
    PLATFORM_SELECTOR_Z_INDEX: 2000,
    LOADING_Z_INDEX: 10000,
    ERROR_Z_INDEX: 10000,
    BUTTON_HOVER_DELAY: 2000,
    RESET_CONFIRMATION_TIMEOUT: 3000
};
// Animation constants
export const ANIMATION = {
    DEFAULT_FRAME_RATE: 30,
    MIN_FRAME_RATE: 1,
    MAX_FRAME_RATE: 120
};
// Collision constants
export const COLLISION = {
    DEFAULT_CELL_SIZE: 64,
    ENTITY_COUNT_THRESHOLD: 5
};
// Error recovery constants
export const ERROR_RECOVERY = {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    ERROR_DISPLAY_DURATION: 5000
};
// Accessibility constants
export const ACCESSIBILITY = {
    TAB_INDEX_DISABLED: -1,
    DEFAULT_TAB_INDEX: 0,
    FOCUS_VISIBLE_CLASS: 'focus-visible'
};
// Development constants
export const DEV = {
    DEBUG_LOG_PREFIX: '[DEBUG]',
    WARNING_LOG_PREFIX: '[WARNING]',
    ERROR_LOG_PREFIX: '[ERROR]',
    INFO_LOG_PREFIX: '[INFO]'
};
// Validation patterns
export const VALIDATION = {
    URL_PATTERN: /^https?:\/\/.+/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ALPHANUMERIC_PATTERN: /^[a-zA-Z0-9]+$/,
    SAFE_STRING_PATTERN: /[<>\"'&]/g
};
// Performance constants
export const PERFORMANCE = {
    TARGET_FPS: 60,
    MIN_FPS: 30,
    FRAME_TIME_BUDGET: 16.67, // 60 FPS = 16.67ms per frame
    MEMORY_WARNING_THRESHOLD: 50 * 1024 * 1024, // 50MB
    GC_INTERVAL: 30000 // 30 seconds
};
//# sourceMappingURL=Constants.js.map
/**
 * Security Manager - Comprehensive security system for PTS Engine
 * Implements rate limiting, input validation, and protection against attacks
 */
export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    blockDurationMs: number;
}
export interface SecurityConfig {
    maxFileSize: number;
    maxUrlLength: number;
    maxInputLength: number;
    allowedFileTypes: string[];
    allowedDomains: string[];
    rateLimits: {
        [key: string]: RateLimitConfig;
    };
}
export interface SecurityViolation {
    type: 'rate_limit' | 'file_size' | 'url_length' | 'input_length' | 'file_type' | 'domain' | 'xss' | 'injection';
    message: string;
    timestamp: number;
    source: string;
    data?: any;
}
export declare class SecurityManager {
    private config;
    private rateLimitStore;
    private violations;
    private isEnabled;
    constructor(config?: Partial<SecurityConfig>);
    /**
     * Check rate limit for a specific action
     */
    checkRateLimit(action: string, identifier?: string): {
        allowed: boolean;
        remaining: number;
        resetTime: number;
    };
    /**
     * Validate file upload
     */
    validateFileUpload(file: File): {
        valid: boolean;
        error?: string;
    };
    /**
     * Validate URL
     */
    validateUrl(url: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * Validate input string
     */
    validateInput(input: string, maxLength?: number): {
        valid: boolean;
        error?: string;
        sanitized?: string;
    };
    /**
     * Validate pack manifest
     */
    validatePackManifest(manifest: any): {
        valid: boolean;
        error?: string;
    };
    /**
     * Get security statistics
     */
    getSecurityStats(): {
        violations: SecurityViolation[];
        rateLimitStats: {
            [key: string]: {
                count: number;
                resetTime: number;
            };
        };
        isEnabled: boolean;
    };
    /**
     * Clear violations (for admin use)
     */
    clearViolations(): void;
    /**
     * Enable/disable security
     */
    setEnabled(enabled: boolean): void;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<SecurityConfig>): void;
    /**
     * Log a security violation
     */
    logViolation(type: SecurityViolation['type'], message: string, source: string, data?: any): void;
    private getFileExtension;
    private formatBytes;
    private containsSuspiciousPatterns;
    private containsXSSPatterns;
    private containsInjectionPatterns;
    private sanitizeInput;
}
//# sourceMappingURL=SecurityManager.d.ts.map
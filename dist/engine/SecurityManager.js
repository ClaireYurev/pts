/**
 * Security Manager - Comprehensive security system for PTS Engine
 * Implements rate limiting, input validation, and protection against attacks
 */
export class SecurityManager {
    constructor(config) {
        this.rateLimitStore = new Map();
        this.violations = [];
        this.isEnabled = true;
        this.config = {
            maxFileSize: 50 * 1024 * 1024, // 50MB
            maxUrlLength: 2048,
            maxInputLength: 1000,
            allowedFileTypes: ['.ptspack.json', '.json', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.wav', '.ogg'],
            allowedDomains: ['localhost', '127.0.0.1', 'github.com', 'raw.githubusercontent.com'],
            rateLimits: {
                fileUpload: { maxRequests: 5, windowMs: 60000, blockDurationMs: 300000 }, // 5 uploads per minute
                urlLoad: { maxRequests: 10, windowMs: 60000, blockDurationMs: 300000 }, // 10 URL loads per minute
                saveOperation: { maxRequests: 20, windowMs: 60000, blockDurationMs: 120000 }, // 20 saves per minute
                packSwitch: { maxRequests: 10, windowMs: 60000, blockDurationMs: 180000 }, // 10 switches per minute
                inputAction: { maxRequests: 1000, windowMs: 60000, blockDurationMs: 60000 }, // 1000 actions per minute
                apiCall: { maxRequests: 100, windowMs: 60000, blockDurationMs: 300000 }, // 100 API calls per minute
            },
            ...config
        };
    }
    /**
     * Check rate limit for a specific action
     */
    checkRateLimit(action, identifier) {
        if (!this.isEnabled) {
            return { allowed: true, remaining: Infinity, resetTime: Date.now() };
        }
        const key = `${action}:${identifier || 'global'}`;
        const limit = this.config.rateLimits[action];
        if (!limit) {
            return { allowed: true, remaining: Infinity, resetTime: Date.now() };
        }
        const now = Date.now();
        const record = this.rateLimitStore.get(key);
        // Check if currently blocked
        if (record && record.blockedUntil > now) {
            this.logViolation('rate_limit', `Rate limit exceeded for ${action}`, action, { key, blockedUntil: record.blockedUntil });
            return { allowed: false, remaining: 0, resetTime: record.blockedUntil };
        }
        // Initialize or reset record
        if (!record || record.resetTime <= now) {
            this.rateLimitStore.set(key, {
                count: 1,
                resetTime: now + limit.windowMs,
                blockedUntil: 0
            });
            return { allowed: true, remaining: limit.maxRequests - 1, resetTime: now + limit.windowMs };
        }
        // Check current count
        if (record.count >= limit.maxRequests) {
            // Block the user
            record.blockedUntil = now + limit.blockDurationMs;
            this.logViolation('rate_limit', `Rate limit exceeded for ${action}`, action, { key, count: record.count, limit: limit.maxRequests });
            return { allowed: false, remaining: 0, resetTime: record.blockedUntil };
        }
        // Increment count
        record.count++;
        return { allowed: true, remaining: limit.maxRequests - record.count, resetTime: record.resetTime };
    }
    /**
     * Validate file upload
     */
    validateFileUpload(file) {
        if (!this.isEnabled) {
            return { valid: true };
        }
        // Check file size
        if (file.size > this.config.maxFileSize) {
            this.logViolation('file_size', `File too large: ${file.size} bytes`, 'fileUpload', { fileName: file.name, size: file.size });
            return { valid: false, error: `File size exceeds maximum allowed size of ${this.formatBytes(this.config.maxFileSize)}` };
        }
        // Check file type
        const extension = this.getFileExtension(file.name);
        if (!this.config.allowedFileTypes.includes(extension.toLowerCase())) {
            this.logViolation('file_type', `Invalid file type: ${extension}`, 'fileUpload', { fileName: file.name, extension });
            return { valid: false, error: `File type ${extension} is not allowed. Allowed types: ${this.config.allowedFileTypes.join(', ')}` };
        }
        // Check file name for suspicious patterns
        if (this.containsSuspiciousPatterns(file.name)) {
            this.logViolation('injection', `Suspicious file name: ${file.name}`, 'fileUpload', { fileName: file.name });
            return { valid: false, error: 'File name contains suspicious patterns' };
        }
        return { valid: true };
    }
    /**
     * Validate URL
     */
    validateUrl(url) {
        if (!this.isEnabled) {
            return { valid: true };
        }
        // Check URL length
        if (url.length > this.config.maxUrlLength) {
            this.logViolation('url_length', `URL too long: ${url.length} characters`, 'urlLoad', { urlLength: url.length });
            return { valid: false, error: `URL length exceeds maximum allowed length of ${this.config.maxUrlLength} characters` };
        }
        // Check URL format
        try {
            const urlObj = new URL(url);
            // Check protocol
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                this.logViolation('domain', `Invalid protocol: ${urlObj.protocol}`, 'urlLoad', { protocol: urlObj.protocol });
                return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
            }
            // Check for suspicious patterns
            if (this.containsSuspiciousPatterns(url)) {
                this.logViolation('xss', `Suspicious URL patterns detected`, 'urlLoad', { url });
                return { valid: false, error: 'URL contains suspicious patterns' };
            }
            // Check domain (optional - for strict mode)
            if (this.config.allowedDomains.length > 0) {
                const hostname = urlObj.hostname.toLowerCase();
                const isAllowed = this.config.allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
                if (!isAllowed) {
                    this.logViolation('domain', `Domain not allowed: ${hostname}`, 'urlLoad', { hostname });
                    return { valid: false, error: `Domain ${hostname} is not in the allowed list` };
                }
            }
        }
        catch (error) {
            this.logViolation('url_length', `Invalid URL format: ${url}`, 'urlLoad', { url });
            return { valid: false, error: 'Invalid URL format' };
        }
        return { valid: true };
    }
    /**
     * Validate input string
     */
    validateInput(input, maxLength) {
        if (!this.isEnabled) {
            return { valid: true, sanitized: input };
        }
        const limit = maxLength || this.config.maxInputLength;
        // Check length
        if (input.length > limit) {
            this.logViolation('input_length', `Input too long: ${input.length} characters`, 'inputAction', { inputLength: input.length });
            return { valid: false, error: `Input length exceeds maximum allowed length of ${limit} characters` };
        }
        // Check for XSS patterns
        if (this.containsXSSPatterns(input)) {
            this.logViolation('xss', `XSS patterns detected in input`, 'inputAction', { input });
            return { valid: false, error: 'Input contains potentially dangerous patterns' };
        }
        // Check for injection patterns
        if (this.containsInjectionPatterns(input)) {
            this.logViolation('injection', `Injection patterns detected in input`, 'inputAction', { input });
            return { valid: false, error: 'Input contains potentially dangerous patterns' };
        }
        // Sanitize input
        const sanitized = this.sanitizeInput(input);
        return { valid: true, sanitized };
    }
    /**
     * Validate pack manifest
     */
    validatePackManifest(manifest) {
        if (!this.isEnabled) {
            return { valid: true };
        }
        // Check for required fields
        const requiredFields = ['id', 'name', 'version'];
        for (const field of requiredFields) {
            if (!manifest[field] || typeof manifest[field] !== 'string') {
                this.logViolation('injection', `Missing required field: ${field}`, 'packValidation', { manifest });
                return { valid: false, error: `Missing required field: ${field}` };
            }
        }
        // Validate ID format
        if (!/^[a-zA-Z0-9_-]+$/.test(manifest.id)) {
            this.logViolation('injection', `Invalid pack ID format: ${manifest.id}`, 'packValidation', { id: manifest.id });
            return { valid: false, error: 'Pack ID contains invalid characters. Only letters, numbers, underscores, and hyphens are allowed.' };
        }
        // Validate version format
        if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(manifest.version)) {
            this.logViolation('injection', `Invalid version format: ${manifest.version}`, 'packValidation', { version: manifest.version });
            return { valid: false, error: 'Invalid version format. Use semantic versioning (e.g., 1.0.0)' };
        }
        // Check for suspicious patterns in strings
        const stringFields = ['name', 'description', 'author'];
        for (const field of stringFields) {
            if (manifest[field] && typeof manifest[field] === 'string') {
                if (this.containsSuspiciousPatterns(manifest[field])) {
                    this.logViolation('injection', `Suspicious patterns in ${field}`, 'packValidation', { field, value: manifest[field] });
                    return { valid: false, error: `Field ${field} contains suspicious patterns` };
                }
            }
        }
        return { valid: true };
    }
    /**
     * Get security statistics
     */
    getSecurityStats() {
        const rateLimitStats = {};
        for (const [key, record] of this.rateLimitStore.entries()) {
            rateLimitStats[key] = {
                count: record.count,
                resetTime: record.resetTime
            };
        }
        return {
            violations: [...this.violations],
            rateLimitStats,
            isEnabled: this.isEnabled
        };
    }
    /**
     * Clear violations (for admin use)
     */
    clearViolations() {
        this.violations = [];
    }
    /**
     * Enable/disable security
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Log a security violation
     */
    logViolation(type, message, source, data) {
        const violation = {
            type,
            message,
            timestamp: Date.now(),
            source,
            data
        };
        this.violations.push(violation);
        // Keep only last 1000 violations
        if (this.violations.length > 1000) {
            this.violations = this.violations.slice(-1000);
        }
        console.warn(`Security violation [${type}]: ${message}`, data);
    }
    // Private helper methods
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot !== -1 ? filename.substring(lastDot) : '';
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    containsSuspiciousPatterns(input) {
        const suspiciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /data:text\/html/gi,
            /vbscript:/gi,
            /on\w+\s*=/gi,
            /eval\s*\(/gi,
            /document\./gi,
            /window\./gi,
            /\.\.\//gi, // Directory traversal
            /%00/gi, // Null byte injection
        ];
        return suspiciousPatterns.some(pattern => pattern.test(input));
    }
    containsXSSPatterns(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /<form/gi,
            /<input/gi,
            /<textarea/gi,
            /<select/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(input));
    }
    containsInjectionPatterns(input) {
        const injectionPatterns = [
            /eval\s*\(/gi,
            /Function\s*\(/gi,
            /setTimeout\s*\(/gi,
            /setInterval\s*\(/gi,
            /document\.write/gi,
            /document\.writeln/gi,
            /innerHTML\s*=/gi,
            /outerHTML\s*=/gi,
            /insertAdjacentHTML/gi,
            /\.\.\//gi, // Directory traversal
            /%00/gi, // Null byte injection
            /union\s+select/gi, // SQL injection
            /drop\s+table/gi,
            /delete\s+from/gi,
            /insert\s+into/gi,
        ];
        return injectionPatterns.some(pattern => pattern.test(input));
    }
    sanitizeInput(input) {
        return input
            .replace(/[<>\"'&]/g, '') // Remove dangerous characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
}
//# sourceMappingURL=SecurityManager.js.map
// Rate limiting and security middleware for Azure Functions
const rateLimit = new Map();

/**
 * Rate limiting middleware to prevent DDoS attacks
 * @param {Object} context - Azure Functions context
 * @param {Object} req - HTTP request object
 * @param {number} maxRequests - Maximum requests per window (default: 100)
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns {Object|null} - Error response if rate limited, null if allowed
 */
function rateLimitMiddleware(context, req, maxRequests = 100, windowMs = 15 * 60 * 1000) {
    try {
        // Get client identifier (IP address or user agent as fallback)
        const clientId = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.connection?.remoteAddress || 
                        req.headers['user-agent'] || 
                        'unknown';
        
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean up old entries
        for (const [key, data] of rateLimit.entries()) {
            if (data.resetTime < now) {
                rateLimit.delete(key);
            }
        }
        
        // Get or create rate limit data for this client
        let rateLimitData = rateLimit.get(clientId);
        if (!rateLimitData || rateLimitData.resetTime < now) {
            rateLimitData = {
                count: 0,
                resetTime: now + windowMs,
                firstRequest: now
            };
        }
        
        // Check if rate limit exceeded
        if (rateLimitData.count >= maxRequests) {
            const resetInSeconds = Math.ceil((rateLimitData.resetTime - now) / 1000);
            
            context.log.warn(`Rate limit exceeded for client: ${clientId}`);
            
            return {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': resetInSeconds.toString(),
                    'X-Rate-Limit-Limit': maxRequests.toString(),
                    'X-Rate-Limit-Remaining': '0',
                    'X-Rate-Limit-Reset': rateLimitData.resetTime.toString()
                },
                body: JSON.stringify({
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
                    retryAfter: resetInSeconds
                })
            };
        }
        
        // Update rate limit data
        rateLimitData.count++;
        rateLimit.set(clientId, rateLimitData);
        
        // Add rate limit headers to response (will be added by caller)
        req.rateLimitHeaders = {
            'X-Rate-Limit-Limit': maxRequests.toString(),
            'X-Rate-Limit-Remaining': (maxRequests - rateLimitData.count).toString(),
            'X-Rate-Limit-Reset': rateLimitData.resetTime.toString()
        };
        
        return null; // Allow request
        
    } catch (error) {
        context.log.error('Rate limiting error:', error);
        return null; // Allow request on error to avoid breaking functionality
    }
}

/**
 * Security middleware to check for common attack patterns
 * @param {Object} context - Azure Functions context
 * @param {Object} req - HTTP request object
 * @returns {Object|null} - Error response if blocked, null if allowed
 */
function securityMiddleware(context, req) {
    try {
        const userAgent = req.headers['user-agent'] || '';
        const path = req.url || '';
        
        // Block common bot patterns (optional - be careful not to block legitimate users)
        const suspiciousPatterns = [
            /sqlmap/i,
            /nikto/i,
            /nmap/i,
            /masscan/i,
            /zap/i,
            /burp/i
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(userAgent)) {
                context.log.warn(`Blocked suspicious user agent: ${userAgent}`);
                return {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Forbidden',
                        message: 'Access denied'
                    })
                };
            }
        }
        
        // Block requests with suspicious path patterns
        const maliciousPathPatterns = [
            /\.\./,  // Path traversal
            /\/etc\/passwd/,
            /\/proc\/version/,
            /\/admin/,
            /\/wp-admin/,
            /\.php$/,
            /\.asp$/,
            /\.jsp$/
        ];
        
        for (const pattern of maliciousPathPatterns) {
            if (pattern.test(path)) {
                context.log.warn(`Blocked suspicious path: ${path}`);
                return {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Forbidden',
                        message: 'Access denied'
                    })
                };
            }
        }
        
        return null; // Allow request
        
    } catch (error) {
        context.log.error('Security middleware error:', error);
        return null; // Allow request on error
    }
}

/**
 * Apply all security middleware
 * @param {Object} context - Azure Functions context
 * @param {Object} req - HTTP request object
 * @param {Object} options - Configuration options
 * @returns {Object|null} - Error response if blocked, null if allowed
 */
function applySecurityMiddleware(context, req, options = {}) {
    const {
        rateLimit = true,
        security = true,
        maxRequests = 100,
        windowMs = 15 * 60 * 1000
    } = options;
    
    // Apply security middleware first
    if (security) {
        const securityResult = securityMiddleware(context, req);

        if (securityResult)
            return securityResult;
    }
    
    // Apply rate limiting
    if (rateLimit) {
        const rateLimitResult = rateLimitMiddleware(context, req, maxRequests, windowMs);

        if (rateLimitResult)
            return rateLimitResult;
    }
    
    return null; // All checks passed
}

module.exports = {
    applySecurityMiddleware,
    rateLimitMiddleware,
    securityMiddleware
};

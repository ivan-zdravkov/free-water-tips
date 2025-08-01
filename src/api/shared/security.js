// Rate limiting and security middleware for Azure Functions
// 
// RATE LIMITING STRATEGY:
// We implement rate limiting directly in each Azure Function (rather than at API Gateway level)
// because:
// 1. Azure Functions don't have built-in rate limiting
// 2. Application Gateway rate limiting is costly and complex for small projects
// 3. Function-level control allows per-endpoint customization
// 4. Cosmos DB provides reliable, shared state across all function instances
//
// CURRENT IMPLEMENTATION: Cosmos DB (Quick Fix)
// - Uses existing Cosmos DB infrastructure (no additional costs)
// - Shared across all function instances and deployments
// - Persistent and reliable
// - Performance: ~50-100ms per rate limit check
//
// FUTURE CONSIDERATION: Redis
// - If application scales significantly, consider Redis for faster rate limiting (~1-5ms)
// - Redis would reduce Cosmos DB load and improve response times
// - Trade-off: Additional infrastructure cost vs performance gain

const DatabaseService = require('./database');

// Initialize database service for rate limiting
// We'll use a separate container or the same container with a different partition key
let dbService = null;

function getDbService() {
    if (!dbService) {
        dbService = new DatabaseService();
    }
    return dbService;
}

/**
 * Cosmos DB-based Rate limiting middleware to prevent DDoS attacks
 * 
 * IMPLEMENTATION NOTES:
 * - Uses Cosmos DB for persistent, shared rate limiting across all function instances
 * - Creates rate limit documents with TTL (Time To Live) for automatic cleanup
 * - Partition key strategy: client identifier for even distribution
 * - Document structure: { id, clientId, count, resetTime, firstRequest }
 * 
 * PERFORMANCE CHARACTERISTICS:
 * - Latency: ~50-100ms per check (Cosmos DB read/write)
 * - RU Cost: ~3-5 RUs per request (1 read + 1 write typically)
 * - Scales horizontally with Cosmos DB
 * 
 * @param {Object} context - Azure Functions context
 * @param {Object} req - HTTP request object
 * @param {number} maxRequests - Maximum requests per window (default: 100)
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns {Object|null} - Error response if rate limited, null if allowed
 */
async function cosmosRateLimitMiddleware(context, req, maxRequests = 100, windowMs = 15 * 60 * 1000) {
    try {
        const db = getDbService();
        
        // Get client identifier with better fallback strategy
        const forwardedFor = req.headers['x-forwarded-for'];
        const realIp = req.headers['x-real-ip'];
        const remoteAddress = req.connection?.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        // Use the most reliable identifier available
        let clientId = 'unknown';
        if (forwardedFor) {
            // Take the first IP from the forwarded-for chain
            clientId = forwardedFor.split(',')[0].trim();
        } else if (realIp) {
            clientId = realIp;
        } else if (remoteAddress) {
            clientId = remoteAddress;
        } else if (userAgent) {
            // Hash user agent to avoid storing sensitive data
            clientId = `ua_${Buffer.from(userAgent).toString('base64').substring(0, 16)}`;
        }
        
        // Add some entropy to reduce collisions
        const entropy = req.headers['accept-language'] || req.headers['accept'] || '';
        const finalClientId = `${clientId}_${Buffer.from(entropy).toString('base64').substring(0, 8)}`;
        
        const now = Date.now();
        const windowStart = Math.floor(now / windowMs);
        const rateLimitId = `ratelimit_${finalClientId}_${windowStart}`;
        
        try {
            // Try to get existing rate limit document
            const existingLimit = await db.getItemById(rateLimitId);
            
            if (existingLimit) {
                // Check if rate limit exceeded
                if (existingLimit.count >= maxRequests) {
                    const resetTime = (windowStart + 1) * windowMs;
                    const resetInSeconds = Math.ceil((resetTime - now) / 1000);
                    
                    context.log.warn(`Cosmos DB rate limit exceeded for client: ${finalClientId}, count: ${existingLimit.count}`);
                    
                    return {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Retry-After': resetInSeconds.toString(),
                            'X-Rate-Limit-Limit': maxRequests.toString(),
                            'X-Rate-Limit-Remaining': '0',
                            'X-Rate-Limit-Reset': resetTime.toString()
                        },
                        body: JSON.stringify({
                            error: 'Too Many Requests',
                            message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
                            retryAfter: resetInSeconds
                        })
                    };
                }
                
                // Update existing document
                const updatedLimit = {
                    ...existingLimit,
                    count: existingLimit.count + 1,
                    lastRequest: now
                };
                
                await db.updateItem(updatedLimit);
                
                // Add rate limit headers
                req.rateLimitHeaders = {
                    'X-Rate-Limit-Limit': maxRequests.toString(),
                    'X-Rate-Limit-Remaining': (maxRequests - updatedLimit.count).toString(),
                    'X-Rate-Limit-Reset': ((windowStart + 1) * windowMs).toString()
                };
                
            } else {
                // Create new rate limit document
                const newLimit = {
                    id: rateLimitId,
                    clientId: finalClientId,
                    count: 1,
                    resetTime: (windowStart + 1) * windowMs,
                    firstRequest: now,
                    lastRequest: now,
                    // Set TTL for automatic cleanup (Cosmos DB feature)
                    ttl: Math.ceil(windowMs / 1000) + 3600 // Window + 1 hour buffer
                };
                
                await db.createItem(newLimit);
                
                // Add rate limit headers
                req.rateLimitHeaders = {
                    'X-Rate-Limit-Limit': maxRequests.toString(),
                    'X-Rate-Limit-Remaining': (maxRequests - 1).toString(),
                    'X-Rate-Limit-Reset': ((windowStart + 1) * windowMs).toString()
                };
            }
            
            return null; // Allow request
            
        } catch (dbError) {
            // If it's a 404 (not found), treat as new rate limit window
            if (dbError.code === 404) {
                const newLimit = {
                    id: rateLimitId,
                    clientId: finalClientId,
                    count: 1,
                    resetTime: (windowStart + 1) * windowMs,
                    firstRequest: now,
                    lastRequest: now,
                    ttl: Math.ceil(windowMs / 1000) + 3600
                };
                
                await db.createItem(newLimit);
                
                req.rateLimitHeaders = {
                    'X-Rate-Limit-Limit': maxRequests.toString(),
                    'X-Rate-Limit-Remaining': (maxRequests - 1).toString(),
                    'X-Rate-Limit-Reset': ((windowStart + 1) * windowMs).toString()
                };
                
                return null;
            }
            
            throw dbError; // Re-throw other database errors
        }
        
    } catch (error) {
        context.log.error('Cosmos DB rate limiting error:', error);
        // FAIL OPEN: Allow request on error to prevent blocking legitimate traffic
        // In production, you might want to implement fallback strategies
        return null;
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
 * 
 * SECURITY STRATEGY:
 * 1. Security checks first (fast, in-memory) - blocks obvious attacks immediately
 * 2. Rate limiting second (Cosmos DB) - prevents abuse and DDoS
 * 
 * This order minimizes database load by filtering out malicious requests before
 * checking rate limits.
 * 
 * @param {Object} context - Azure Functions context
 * @param {Object} req - HTTP request object
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableRateLimit - Enable rate limiting (default: true)
 * @param {boolean} options.enableSecurity - Enable security checks (default: true)
 * @param {number} options.maxRequests - Max requests per window (default: 100)
 * @param {number} options.windowMs - Time window in ms (default: 15 minutes)
 * @returns {Object|null} - Error response if blocked, null if allowed
 */
async function applySecurityMiddleware(context, req, options = {}) {
    const {
        enableRateLimit = true,
        enableSecurity = true,
        maxRequests = 100,
        windowMs = 15 * 60 * 1000
    } = options;
    
    // Apply security middleware first (fast, blocks obvious attacks)
    if (enableSecurity) {
        const securityResult = securityMiddleware(context, req);
        if (securityResult) {
            return securityResult;
        }
    }
    
    // Apply rate limiting second (Cosmos DB-based, more expensive)
    if (enableRateLimit) {
        const rateLimitResult = await cosmosRateLimitMiddleware(context, req, maxRequests, windowMs);
        if (rateLimitResult) {
            return rateLimitResult;
        }
    }
    
    return null; // All checks passed
}

module.exports = {
    applySecurityMiddleware,
    cosmosRateLimitMiddleware,
    securityMiddleware
};

const config = require('../../config/config');

/**
 * API Key Authentication Middleware
 * Lightweight authentication for inter-service communication
 * More efficient than JWT for microservice-to-microservice calls
 */

/**
 * Required authentication
 * Returns 401 if API key is invalid
 */
const authenticate = (req, res, next) => {
    // Support API key from both header and query parameter
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key is required. Provide via X-API-Key header or ?apiKey= query parameter.'
        });
    }

    if (apiKey !== config.security.apiKey) {
        return res.status(403).json({
            success: false,
            error: 'Invalid API key'
        });
    }

    // API key is valid, proceed
    next();
};

/**
 * Optional authentication
 * Continues even if API key is missing or invalid
 * Useful for endpoints that may be public but benefit from authentication
 */
const optionalAuth = (req, res, next) => {
    // Support API key from both header and query parameter
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (apiKey && apiKey === config.security.apiKey) {
        req.authenticated = true;
    } else {
        req.authenticated = false;
    }

    next();
};

module.exports = {
    authenticate,
    optionalAuth
};

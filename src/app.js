const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const config = require('../config/config');
const swaggerSpec = require('./config/swagger');
const trackRoutes = require('./interfaces/routes/trackRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

/**
 * Middleware Configuration
 * Optimized for STB performance
 */

// Compression middleware - reduces response size
app.use(compression({
    threshold: 0, // Compress all responses
    level: 6 // Balanced compression (0-9, higher = more compression but slower)
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (config.cors.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parsing middleware with size limits (prevent memory issues on STB)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Request logging (lightweight)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * API info endpoint
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Music Catalog API',
        version: '1.0.0',
        description: 'Lightweight Music Catalog Microservice for STB devices',
        documentation: `http://localhost:${config.server.port}/api-docs`,
        endpoints: {
            health: 'GET /health',
            tracks: 'GET /music',
            trackById: 'GET /music/:id',
            batchTracks: 'GET /music/batch?ids=1,2,3',
            search: 'GET /music/search?genre=rock',
            recommendations: 'GET /music/recommendations?genre=rock&mood=energetic',
            genres: 'GET /music/genres'
        },
        authentication: 'API Key required (X-API-Key header)'
    });
});

/**
 * Serve static files (for swagger.json)
 */
app.use('/public', express.static(path.join(__dirname, '../public')));

/**
 * API Documentation (Swagger UI)
 * Auto-generated from JSDoc comments in routes and config/swagger.js
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
    }
}));

/**
 * Raw Swagger JSON endpoint for debugging
 */
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

/**
 * Mount routes
 */
app.use('/music', trackRoutes);

/**
 * Error handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

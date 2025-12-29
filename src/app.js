const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
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
 * Raw Swagger JSON endpoint - MUST be defined BEFORE /api-docs
 */
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

/**
 * API Documentation (Swagger UI)
 * Using direct HTML approach to avoid swagger-ui-express caching
 */
app.get('/api-docs', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Catalog API - Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css">
    <style>
        body { margin: 0; padding: 0; }
        .topbar { display: none; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "/swagger.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                persistAuthorization: true,
                displayRequestDuration: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
            window.ui = ui;
        };
    </script>
</body>
</html>
    `);
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

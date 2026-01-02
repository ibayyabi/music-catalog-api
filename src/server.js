require('dotenv').config();
const app = require('./app');
const config = require('../config/config');
const { testConnection, closeDatabase } = require('./infrastructure/database');

/**
 * Server Startup
 * Optimized for STB with graceful shutdown
 */

let server = null;

const startServer = async () => {
    try {
        // Test database connection before starting server
        console.log('--- Debug Config ---');
        console.log('DB User:', process.env.DB_USER);
        console.log('DB Pass:', process.env.DB_PASSWORD ? 'Terisi (OK)' : 'Kosong (NOT OK)');
        console.log('--------------------');

        console.log('Testing database connection...');
        const isConnected = await testConnection();

        if (!isConnected) {
            console.error('Failed to connect to database. Please check your configuration.');
            process.exit(1);
        }

        // Start HTTP server
        server = app.listen(config.server.port, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🎵 Music Catalog API - STB Optimized');
            console.log('='.repeat(50));
            console.log(`Server running on port ${config.server.port}`);
            console.log(`Environment: ${config.server.env}`);
            console.log(`API Documentation: http://localhost:${config.server.port}/`);
            console.log('='.repeat(50) + '\n');
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${config.server.port} is already in use`);
            } else {
                console.error('Server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

/**
 * Graceful Shutdown
 * Important for STB to properly release resources
 */
let isShuttingDown = false; // Guard to prevent infinite loop

const gracefulShutdown = async (signal) => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;

    console.log(`\n${signal} received. Starting graceful shutdown...`);

    if (server) {
        server.close(async () => {
            console.log('✓ HTTP server closed');

            // Close database pool (now async, must await)
            try {
                await closeDatabase();
            } catch (error) {
                console.error('Error closing database:', error.message);
            }

            console.log('✓ Graceful shutdown completed');
            process.exit(0);
        });

        // Force close after 10 seconds
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors (prevent crash on STB)
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (!isShuttingDown) {
        gracefulShutdown('UNCAUGHT_EXCEPTION');
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (!isShuttingDown) {
        gracefulShutdown('UNHANDLED_REJECTION');
    }
});

// Start the server
startServer();

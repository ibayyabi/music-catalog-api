const config = {
    server: {
        port: parseInt(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        // SQLite configuration
        path: process.env.DB_PATH || './database/music_catalog.db',
        // Optional: Enable Write-Ahead Logging (WAL) mode for better concurrency
        enableWAL: process.env.DB_ENABLE_WAL === 'true' || false,
        // Table name
        table: process.env.DB_TABLE || 'tracks'
    },
    security: {
        apiKey: process.env.API_KEY || 'default-dev-key-change-in-production'
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3001']
    },
    pagination: {
        defaultLimit: 10,
        maxLimit: 20
    }
};

module.exports = config;

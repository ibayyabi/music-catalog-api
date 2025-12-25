// require('dotenv').config();

const config = {
    server: {
        port: parseInt(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        table: process.env.DB_TABLE || 'tracks',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
        queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 10,
        waitForConnections: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
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

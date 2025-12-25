const mysql = require('mysql2/promise');
const config = require('../../config/config');

/**
 * Database Connection Pool
 * Optimized for STB devices with limited resources
 * 
 * Why Connection Pool is critical for STB:
 * 1. Memory Efficiency: Limits concurrent connections to prevent RAM exhaustion
 * 2. Connection Reuse: Avoids overhead of creating new connections per request
 * 3. Resource Control: Prevents race conditions on low-resource devices
 * 4. Automatic Cleanup: Pool manager handles idle connection cleanup
 */

let pool = null;

const createPool = () => {
    if (pool) {
        return pool;
    }

    pool = mysql.createPool({
        host: config.database.host === 'localhost' ? '127.0.0.1' : config.database.host, // Force IPv4
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        connectionLimit: config.database.connectionLimit, // Max 5 connections for STB
        queueLimit: config.database.queueLimit,
        waitForConnections: config.database.waitForConnections,
        enableKeepAlive: config.database.enableKeepAlive,
        keepAliveInitialDelay: config.database.keepAliveInitialDelay,
        // Additional optimizations for STB
        timezone: '+00:00',
        connectTimeout: 10000 // 10 seconds timeout
    });

    // Handle pool errors
    pool.on('error', (err) => {
        console.error('Database pool error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Database connection lost. Pool will reconnect automatically.');
        }
    });

    console.log(`✓ Database pool created with ${config.database.connectionLimit} max connections`);

    return pool;
};

const getPool = () => {
    if (!pool) {
        return createPool();
    }
    return pool;
};

const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✓ Database pool closed gracefully');
    }
};

// Test database connection
const testConnection = async () => {
    try {
        const connection = await getPool().getConnection();
        await connection.ping();
        connection.release();
        console.log('✓ Database connection test successful');
        return true;
    } catch (error) {
        console.error('✗ Database connection test failed:', error.message);
        return false;
    }
};

module.exports = {
    getPool,
    closePool,
    testConnection
};

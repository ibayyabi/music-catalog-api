const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

/**
 * SQLite Database Connection Module
 * Lightweight file-based database for STB devices
 */

let db = null;
let dbInstance = null;

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/music_catalog.db');

/**
 * Initialize SQLite database connection
 */
const initDatabase = async () => {
    if (db) {
        return db;
    }

    try {
        console.log('Initializing SQLite database...');

        // Initialize sql.js
        const SQL = await initSqlJs();

        // Load database from file
        if (fs.existsSync(DB_PATH)) {
            const buffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(buffer);
            console.log(`Database loaded from: ${DB_PATH}`);
            console.log('Applying SQLite optimizations...');
            db.exec('PRAGMA journal_mode = WAL;');
            db.exec('PRAGMA synchronous = NORMAL;');
            db.exec('PRAGMA cache_size = -2000;');
            db.exec('PRAGMA temp_store = MEMORY;');
            db.exec('PRAGMA mmap_size = 30000000;');
            console.log('SQLite optimizations applied (WAL mode, 2MB cache)');
        } else {
            db = new SQL.Database();
            console.log('Created new SQLite database');
        }

        dbInstance = SQL;

        return db;
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        throw error;
    }
};

/**
 * Get database instance
 */
const getDatabase = async () => {
    if (!db) {
        return await initDatabase();
    }
    return db;
};

/**
 * Save database to disk
 * Important: SQLite in-memory changes need to be persisted
 */
const saveDatabase = () => {
    if (!db) return;

    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
        console.log('Database saved to disk');
    } catch (error) {
        console.error('Failed to save database:', error.message);
        throw error;
    }
};

/**
 * Close database connection gracefully
 */
const closeDatabase = async () => {
    if (db) {
        try {
            // Save before closing
            saveDatabase();
            db.close();
            db = null;
            dbInstance = null;
            console.log('Database closed gracefully');
            return true;
        } catch (error) {
            console.error('Error closing database:', error.message);
            // Don't throw - just log and return false
            return false;
        }
    }
    return true;
};

/**
 * Test database connection
 */
const testConnection = async () => {
    try {
        const database = await getDatabase();
        const result = database.exec('SELECT 1');
        console.log('Database connection test successful');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error.message);
        return false;
    }
};

/**
 * Execute a SELECT query
 * @param {string} sql - SQL query string
 * @param {array} params - Query parameters
 * @returns {array} - Array of row objects
 */
const query = async (sql, params = []) => {
    const database = await getDatabase();
    const stmt = database.prepare(sql);

    // Bind parameters
    if (params && params.length > 0) {
        stmt.bind(params);
    }

    const rows = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        rows.push(row);
    }

    stmt.free();
    return rows;
};

/**
 * Execute a query and return first row only
 * @param {string} sql - SQL query string
 * @param {array} params - Query parameters
 * @returns {object|null} - Single row object or null
 */
const queryOne = async (sql, params = []) => {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
};

/**
 * Execute an INSERT/UPDATE/DELETE query
 * @param {string} sql - SQL query string
 * @param {array} params - Query parameters
 * @returns {object} - Result with changes count
 */
const execute = async (sql, params = []) => {
    const database = await getDatabase();
    const stmt = database.prepare(sql);

    if (params && params.length > 0) {
        stmt.bind(params);
    }

    stmt.step();
    stmt.free();
    return {
        changes: database.getRowsModified()
    };
};

module.exports = {
    initDatabase,
    getDatabase,
    saveDatabase,
    closeDatabase,
    testConnection,
    query,
    queryOne,
    execute
};

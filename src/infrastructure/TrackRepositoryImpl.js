const TrackRepository = require('../domain/TrackRepository');
const Track = require('../domain/Track');
const { getPool } = require('./database');
const config = require('../../config/config');

/**
 * Track Repository Implementation
 * Optimized queries for STB performance
 * 
 * NOTE: Using pool.query() instead of pool.execute() because
 * table columns are TEXT type (from CSV import), not proper numeric types.
 * This avoids "Incorrect arguments to mysqld_stmt_execute" errors.
 */

class TrackRepositoryImpl extends TrackRepository {
    constructor() {
        super();
        this.tableName = config.database.table;
    }

    /**
     * Get all tracks with pagination
     */
    async findAll(limit = 10, offset = 0) {
        const pool = getPool();
        // Use query() instead of execute() to avoid type binding issues
        const [rows] = await pool.query(
            `SELECT * FROM ?? LIMIT ? OFFSET ?`,
            [this.tableName, limit, offset]
        );
        return rows.map(row => new Track(row));
    }

    /**
     * Get single track by ID
     */
    async findById(trackId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM ?? WHERE track_id = ?`,
            [this.tableName, trackId]
        );

        if (rows.length === 0) {
            return null;
        }

        return new Track(rows[0]);
    }

    /**
     * Get multiple tracks by IDs (batch operation)
     * Efficient for Book API integration
     */
    async findByIds(trackIds) {
        if (!trackIds || trackIds.length === 0) {
            return [];
        }

        const pool = getPool();
        const placeholders = trackIds.map(() => '?').join(',');
        const [rows] = await pool.query(
            `SELECT * FROM ${this.tableName} WHERE track_id IN (${placeholders})`,
            trackIds
        );

        return rows.map(row => new Track(row));
    }

    /**
     * Search tracks by genre
     */
    async searchByGenre(genre, limit = 10, offset = 0) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM ?? WHERE track_genre = ? LIMIT ? OFFSET ?`,
            [this.tableName, genre, limit, offset]
        );

        return rows.map(row => new Track(row));
    }

    /**
     * Find recommendations based on filters
     * Optional: Pre-filtered recommendations for Gemini AI
     */
    async findRecommendations(filters = {}) {
        const pool = getPool();
        let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
        const params = [];

        // Filter by genre
        if (filters.genre) {
            query += ' AND track_genre = ?';
            params.push(filters.genre);
        }

        // Filter by energy range (mood)
        // Since columns are TEXT, we compare as strings (works for decimals like "0.8")
        if (filters.minEnergy !== undefined) {
            query += ' AND CAST(energy AS DECIMAL(10,4)) >= ?';
            params.push(filters.minEnergy);
        }
        if (filters.maxEnergy !== undefined) {
            query += ' AND CAST(energy AS DECIMAL(10,4)) <= ?';
            params.push(filters.maxEnergy);
        }

        // Filter by valence (happiness)
        if (filters.minValence !== undefined) {
            query += ' AND CAST(valence AS DECIMAL(10,4)) >= ?';
            params.push(filters.minValence);
        }

        // Limit results
        const limit = filters.limit || 20;
        query += ' LIMIT ?';
        params.push(limit);

        const [rows] = await pool.query(query, params);
        return rows.map(row => new Track(row));
    }

    /**
     * Count total tracks
     */
    async count() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT COUNT(*) as total FROM ??`,
            [this.tableName]
        );
        return rows[0].total;
    }

    /**
     * Get available genres
     */
    async getGenres() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT DISTINCT track_genre FROM ?? ORDER BY track_genre`,
            [this.tableName]
        );
        return rows.map(row => row.track_genre);
    }
}

module.exports = TrackRepositoryImpl;

const TrackRepository = require('../domain/TrackRepository');
const Track = require('../domain/Track');
const { query, queryOne } = require('./database');
const config = require('../../config/config');

/**
 * Track Repository Implementation (SQLite)
 * Optimized queries for STB performance
 */

class TrackRepositoryImpl extends TrackRepository {
    constructor() {
        super();
        this.tableName = 'tracks'; // SQLite table name
    }

    /**
     * Get all tracks with pagination
     */
    async findAll(limit = 10, offset = 0) {
        const sql = `SELECT * FROM ${this.tableName} LIMIT ? OFFSET ?`;
        const rows = await query(sql, [limit, offset]);
        return rows.map(row => new Track(row));
    }

    /**
     * Get single track by ID
     */
    async findById(trackId) {
        const sql = `SELECT * FROM ${this.tableName} WHERE track_id = ?`;
        const row = await queryOne(sql, [trackId]);

        if (!row) {
            return null;
        }

        return new Track(row);
    }

    /**
     * Get multiple tracks by IDs (batch operation)
     * Efficient for Book API integration
     */
    async findByIds(trackIds) {
        if (!trackIds || trackIds.length === 0) {
            return [];
        }

        const placeholders = trackIds.map(() => '?').join(',');
        const sql = `SELECT * FROM ${this.tableName} WHERE track_id IN (${placeholders})`;
        const rows = await query(sql, trackIds);

        return rows.map(row => new Track(row));
    }

    /**
     * Search tracks by genre
     */
    async searchByGenre(genre, limit = 10, offset = 0) {
        const sql = `SELECT * FROM ${this.tableName} WHERE track_genre = ? LIMIT ? OFFSET ?`;
        const rows = await query(sql, [genre, limit, offset]);

        return rows.map(row => new Track(row));
    }

    /**
     * Find recommendations based on filters
     * Supports genre, energy, and valence filtering
     */
    async findRecommendations(filters = {}) {
        let sql = `SELECT * FROM ${this.tableName} WHERE 1=1`;
        const params = [];

        // Filter by genre
        if (filters.genre) {
            sql += ' AND track_genre = ?';
            params.push(filters.genre);
        }

        // Filter by energy range (mood)
        if (filters.minEnergy !== undefined) {
            sql += ' AND energy >= ?';
            params.push(filters.minEnergy);
        }
        if (filters.maxEnergy !== undefined) {
            sql += ' AND energy <= ?';
            params.push(filters.maxEnergy);
        }

        // Filter by valence (happiness)
        if (filters.minValence !== undefined) {
            sql += ' AND valence >= ?';
            params.push(filters.minValence);
        }
        if (filters.maxValence !== undefined) {
            sql += ' AND valence <= ?';
            params.push(filters.maxValence);
        }

        // Limit results
        const limit = filters.limit || 20;
        sql += ' LIMIT ?';
        params.push(limit);

        const rows = await query(sql, params);
        return rows.map(row => new Track(row));
    }

    /**
     * Count total tracks
     */
    async count() {
        const sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
        const result = await queryOne(sql);
        return result ? result.total : 0;
    }

    /**
     * Get available genres
     */
    async getGenres() {
        const sql = `SELECT DISTINCT track_genre FROM ${this.tableName} ORDER BY track_genre`;
        const rows = await query(sql);
        return rows.map(row => row.track_genre);
    }
}

module.exports = TrackRepositoryImpl;

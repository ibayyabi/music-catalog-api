const TrackRepositoryImpl = require('../../infrastructure/TrackRepositoryImpl');
const config = require('../../../config/config');

const trackRepository = new TrackRepositoryImpl();

/**
 * Track Controller
 * Handles HTTP requests for track endpoints
 */

class TrackController {
    /**
     * GET /music
     * List all tracks with pagination
     */
    async listTracks(req, res, next) {
        try {
            const limit = Math.min(
                parseInt(req.query.limit) || config.pagination.defaultLimit,
                config.pagination.maxLimit
            );
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const tracks = await trackRepository.findAll(limit, offset);
            const total = await trackRepository.count();

            res.json({
                success: true,
                data: tracks.map(track => track.toListFormat()),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /music/:id
     * Get single track details (Gemini AI format)
     */
    async getTrackById(req, res, next) {
        try {
            const { id } = req.params;
            const track = await trackRepository.findById(id);

            if (!track) {
                return res.status(404).json({
                    success: false,
                    error: 'Track not found'
                });
            }

            res.json({
                success: true,
                data: track.toGeminiFormat()
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /music/batch?ids=1,2,3
     * Get multiple tracks by IDs
     */
    async getBatchTracks(req, res, next) {
        try {
            const ids = req.query.ids ? req.query.ids.split(',') : [];

            if (ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No track IDs provided'
                });
            }

            if (ids.length > 50) {
                return res.status(400).json({
                    success: false,
                    error: 'Maximum 50 tracks per batch request'
                });
            }

            const tracks = await trackRepository.findByIds(ids);

            res.json({
                success: true,
                data: tracks.map(track => track.toGeminiFormat()),
                count: tracks.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /music/search?genre=rock
     * Search tracks by genre
     */
    async searchTracks(req, res, next) {
        try {
            const { genre } = req.query;

            if (!genre) {
                return res.status(400).json({
                    success: false,
                    error: 'Genre parameter is required'
                });
            }

            const limit = Math.min(
                parseInt(req.query.limit) || config.pagination.defaultLimit,
                config.pagination.maxLimit
            );
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const tracks = await trackRepository.searchByGenre(genre, limit, offset);

            res.json({
                success: true,
                data: tracks.map(track => track.toListFormat()),
                filter: { genre },
                count: tracks.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /music/recommendations?genre=rock&mood=energetic
     * Get recommended tracks (optional feature)
     */
    async getRecommendations(req, res, next) {
        try {
            const filters = {};

            // Genre filter
            if (req.query.genre) {
                filters.genre = req.query.genre;
            }

            // Mood-based filters (maps to energy levels)
            if (req.query.mood) {
                const moodMap = {
                    'energetic': { minEnergy: 0.7 },
                    'calm': { maxEnergy: 0.4 },
                    'happy': { minValence: 0.6 },
                    'sad': { maxValence: 0.4 }
                };

                const moodFilter = moodMap[req.query.mood.toLowerCase()];
                if (moodFilter) {
                    Object.assign(filters, moodFilter);
                }
            }

            // Custom energy range
            if (req.query.minEnergy) {
                filters.minEnergy = parseFloat(req.query.minEnergy);
            }
            if (req.query.maxEnergy) {
                filters.maxEnergy = parseFloat(req.query.maxEnergy);
            }

            filters.limit = Math.min(
                parseInt(req.query.limit) || 20,
                config.pagination.maxLimit
            );

            const tracks = await trackRepository.findRecommendations(filters);

            res.json({
                success: true,
                data: tracks.map(track => track.toGeminiFormat()),
                filters,
                count: tracks.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /music/genres
     * Get available genres
     */
    async getGenres(req, res, next) {
        try {
            const genres = await trackRepository.getGenres();

            res.json({
                success: true,
                data: genres,
                count: genres.length
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TrackController();

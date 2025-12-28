const express = require('express');
const trackController = require('../controllers/trackController');
const { authenticate, optionalAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * Track Routes
 * All routes return JSON responses
 */

/**
 * @swagger
 * /music/genres:
 *   get:
 *     summary: Get all available genres
 *     description: Returns a list of all music genres. This is a public endpoint that doesn't require authentication.
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: List of genres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Genre'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/genres', trackController.getGenres.bind(trackController));

/**
 * @swagger
 * /music:
 *   get:
 *     summary: List all tracks with pagination
 *     description: Returns a paginated list of music tracks. Supports filtering by genre and pagination.
 *     tags: [Tracks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre name (case-insensitive)
 *     responses:
 *       200:
 *         description: Paginated list of tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Track'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', authenticate, trackController.listTracks.bind(trackController));

/**
 * @swagger
 * /music/batch:
 *   get:
 *     summary: Get multiple tracks by IDs
 *     description: Returns multiple tracks in a single request using comma-separated track IDs
 *     tags: [Tracks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated track IDs (e.g., "1,2,3,4,5")
 *         example: "1,2,3"
 *     responses:
 *       200:
 *         description: List of requested tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Track'
 *       400:
 *         description: Bad request - missing or invalid IDs parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: 'ids parameter is required'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/batch', authenticate, trackController.getBatchTracks.bind(trackController));

/**
 * @swagger
 * /music/search:
 *   get:
 *     summary: Search tracks
 *     description: Search tracks by name, composer, or genre with pagination
 *     tags: [Tracks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (searches in track name and composer)
 *         example: "rock"
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre name
 *         example: "Rock"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of items per page (max 100)
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Track'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/search', authenticate, trackController.searchTracks.bind(trackController));

/**
 * @swagger
 * /music/recommendations:
 *   get:
 *     summary: Get music recommendations
 *     description: Get personalized track recommendations based on genre and mood
 *     tags: [Tracks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Genre preference for recommendations
 *         example: "Rock"
 *       - in: query
 *         name: mood
 *         schema:
 *           type: string
 *         description: Mood preference (energetic, calm, etc.)
 *         example: "energetic"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of recommendations (max 50)
 *     responses:
 *       200:
 *         description: List of recommended tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Track'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/recommendations', authenticate, trackController.getRecommendations.bind(trackController));

/**
 * @swagger
 * /music/{id}:
 *   get:
 *     summary: Get track by ID
 *     description: Returns detailed information about a specific track
 *     tags: [Tracks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Track ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Track details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Track'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', authenticate, trackController.getTrackById.bind(trackController));

module.exports = router;

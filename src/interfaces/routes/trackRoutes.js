const express = require('express');
const trackController = require('../controllers/trackController');
const { authenticate, optionalAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * Track Routes
 * All routes return JSON responses
 */

// Public routes (no authentication required)
router.get('/genres', trackController.getGenres.bind(trackController));

// Protected routes (API Key required)
router.get('/', authenticate, trackController.listTracks.bind(trackController));
router.get('/batch', authenticate, trackController.getBatchTracks.bind(trackController));
router.get('/search', authenticate, trackController.searchTracks.bind(trackController));
router.get('/recommendations', authenticate, trackController.getRecommendations.bind(trackController));
router.get('/:id', authenticate, trackController.getTrackById.bind(trackController));

module.exports = router;

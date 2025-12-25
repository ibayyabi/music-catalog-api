/**
 * Track Repository Interface
 * Defines contract for data access operations
 */

class TrackRepository {
    async findAll(limit, offset) {
        throw new Error('Method not implemented');
    }

    async findById(trackId) {
        throw new Error('Method not implemented');
    }

    async findByIds(trackIds) {
        throw new Error('Method not implemented');
    }

    async searchByGenre(genre, limit, offset) {
        throw new Error('Method not implemented');
    }

    async findRecommendations(filters) {
        throw new Error('Method not implemented');
    }

    async count() {
        throw new Error('Method not implemented');
    }
}

module.exports = TrackRepository;

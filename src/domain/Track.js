/**
 * Track Entity (Domain Model)
 * Represents a music track with audio features
 */

class Track {
    constructor(data) {
        this.track_id = data.track_id;
        this.track_name = data.track_name;
        this.artists = data.artists;
        this.album_name = data.album_name;
        this.track_genre = data.track_genre;
        this.audio_features = {
            energy: parseFloat(data.energy) || 0,
            valence: parseFloat(data.valence) || 0,
            acousticness: parseFloat(data.acousticness) || 0,
            tempo: parseFloat(data.tempo) || 0
        };
    }

    /**
     * Format for Gemini AI integration
     * Returns structured data suitable for AI processing
     */
    toGeminiFormat() {
        return {
            track_id: this.track_id,
            track_name: this.track_name,
            artists: this.artists,
            album_name: this.album_name,
            track_genre: this.track_genre,
            audio_features: this.audio_features
        };
    }

    /**
     * Format for API response (list view)
     * Returns minimal data for pagination efficiency
     */
    toListFormat() {
        return {
            track_id: this.track_id,
            track_name: this.track_name,
            artists: this.artists,
            track_genre: this.track_genre
        };
    }

    /**
     * Validate track data
     */
    static validate(data) {
        const errors = [];

        if (!data.track_id) errors.push('track_id is required');
        if (!data.track_name) errors.push('track_name is required');
        if (!data.track_genre) errors.push('track_genre is required');

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = Track;

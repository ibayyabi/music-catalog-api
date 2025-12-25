# Music Catalog API

Lightweight Music Catalog Microservice optimized for Settop Box (STB) devices. Built with Express.js and Domain-Driven Design (DDD) architecture for integration with Book Catalog API via Gemini AI recommendations service.

## 🎯 Project Overview

**Anggota**: B - Sistem Terintegrasi  
**Stack**: Express.js + MySQL  
**Architecture**: Domain-Driven Design (DDD)  
**Optimization**: STB-optimized with Connection Pool & minimal dependencies

## 📋 Features

- ✅ Lightweight REST API with compression
- ✅ Connection Pool (max 5 connections) for STB efficiency
- ✅ API Key authentication for inter-service communication
- ✅ Pagination support (10-20 items per page)
- ✅ Batch operations for efficient data retrieval
- ✅ Docker support with alpine image (< 150MB)
- ✅ Graceful shutdown handling
- ✅ Health check endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MySQL Server 8.0+
- Existing music dataset imported in MySQL

### Installation

1. **Clone & Install**
```bash
cd /home/ikhbarr/Documents/File\ Ibay/TST-API
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_catalog        # Your database name
DB_TABLE=tracks              # Your table name

# API Security
API_KEY=your-secret-api-key-here
```

3. **Add Indexes (Optional but Recommended)**
```bash
mysql -u root -p < scripts/add-indexes.sql
```

4. **Start Server**
```bash
npm start
```

Server will run on `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication

All endpoints (except `/health` and `/music/genres`) require API Key authentication:

```bash
X-API-Key: your-secret-api-key-here
```

### Base URL
```
http://localhost:3000
```

---

### 1. Health Check (Public)

**GET** `/health`

Check API status.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-12-25T14:20:00.000Z",
  "uptime": 123.45
}
```

---

### 2. List All Tracks

**GET** `/music?page=1&limit=10`

Get paginated list of tracks.

**Parameters:**
- `page` (optional): Page number, default = 1
- `limit` (optional): Items per page, default = 10, max = 20

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/music?page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "track_id": "123",
      "track_name": "Song Title",
      "artists": "Artist Name",
      "track_genre": "rock"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1000,
    "totalPages": 100
  }
}
```

---

### 3. Get Track by ID (Gemini AI Format)

**GET** `/music/:id`

Get detailed track information with audio features for Gemini AI.

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/music/123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "track_id": "123",
    "track_name": "Song Title",
    "artists": "Artist Name",
    "album_name": "Album Name",
    "track_genre": "rock",
    "audio_features": {
      "energy": 0.8,
      "valence": 0.6,
      "acousticness": 0.2,
      "tempo": 120.5
    }
  }
}
```

---

### 4. Batch Get Tracks

**GET** `/music/batch?ids=1,2,3`

Get multiple tracks in one request (efficient for Book API integration).

**Parameters:**
- `ids` (required): Comma-separated track IDs, max 50 IDs

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/music/batch?ids=123,456,789"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "track_id": "123",
      "track_name": "Song 1",
      "artists": "Artist 1",
      "album_name": "Album 1",
      "track_genre": "rock",
      "audio_features": { ... }
    },
    { ... }
  ],
  "count": 3
}
```

---

### 5. Search by Genre

**GET** `/music/search?genre=rock&page=1&limit=10`

Filter tracks by genre.

**Parameters:**
- `genre` (required): Genre name
- `page` (optional): Page number
- `limit` (optional): Items per page

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/music/search?genre=rock&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "filter": { "genre": "rock" },
  "count": 20
}
```

---

### 6. Get Recommendations (Optional)

**GET** `/music/recommendations?genre=rock&mood=energetic&limit=20`

Get pre-filtered recommendations based on genre and mood.

**Parameters:**
- `genre` (optional): Genre filter
- `mood` (optional): `energetic`, `calm`, `happy`, `sad`
- `minEnergy` (optional): 0.0 - 1.0
- `maxEnergy` (optional): 0.0 - 1.0
- `limit` (optional): Max 20

**Mood Mappings:**
- `energetic`: energy >= 0.7
- `calm`: energy <= 0.4
- `happy`: valence >= 0.6
- `sad`: valence <= 0.4

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3000/music/recommendations?genre=rock&mood=energetic&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "filters": {
    "genre": "rock",
    "minEnergy": 0.7,
    "limit": 10
  },
  "count": 10
}
```

---

### 7. Get Available Genres (Public)

**GET** `/music/genres`

Get list of all available genres.

**Example:**
```bash
curl http://localhost:3000/music/genres
```

**Response:**
```json
{
  "success": true,
  "data": ["rock", "pop", "jazz", "classical"],
  "count": 4
}
```

---

## 🔗 Integration with Book Catalog API

### Workflow for Gemini AI Recommendations

1. **Book API** calls Music API to get track details:
```javascript
// Example integration from Book API
const getMusicForRecommendation = async (trackId) => {
  const response = await fetch(`http://localhost:3000/music/${trackId}`, {
    headers: {
      'X-API-Key': 'your-api-key'
    }
  });
  return response.json();
};
```

2. **Combine Data** for Gemini AI input:
```javascript
const geminiInput = {
  book: { title: "...", genre: "...", mood: "..." },
  music: musicData.data // From Music API
};
// Send to Gemini AI for recommendations
```

3. **Batch Operations** for efficiency:
```javascript
// Get multiple tracks at once
const tracks = await fetch(
  `http://localhost:3000/music/batch?ids=1,2,3`,
  { headers: { 'X-API-Key': 'your-api-key' } }
);
```

---

## 🐳 Docker Deployment

### Build & Run with Docker Compose

```bash
# Start both MySQL and API
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Build Docker Image Only

```bash
# Build
docker build -t music-catalog-api .

# Run
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=your_password \
  -e API_KEY=your-api-key \
  music-catalog-api
```

**Image Size**: < 150MB (using node:alpine)

---

## 📊 Database Configuration

### Expected Table Structure

Your existing table should have these columns:

| Column | Type | Description |
|--------|------|-------------|
| `track_id` | VARCHAR/TEXT | Unique track identifier |
| `track_name` | VARCHAR/TEXT | Track name |
| `artists` | VARCHAR/TEXT | Artist name(s) |
| `album_name` | VARCHAR/TEXT | Album name |
| `track_genre` | VARCHAR/TEXT | Genre |
| `energy` | FLOAT/DECIMAL | Energy level (0-1) |
| `valence` | FLOAT/DECIMAL | Happiness (0-1) |
| `acousticness` | FLOAT/DECIMAL | Acoustic quality (0-1) |
| `tempo` | FLOAT/DECIMAL | BPM |

### Add Indexes for Performance

```bash
mysql -u root -p your_database < scripts/add-indexes.sql
```

This adds indexes on:
- `track_genre` - for genre filtering
- `track_name` - for name searches
- `energy`, `valence` - for recommendations

---

## ⚡ Performance Optimization for STB

### Connection Pool

The API uses connection pooling with these settings:

```javascript
connectionLimit: 5        // Max concurrent connections
queueLimit: 10           // Max queued requests
connectTimeout: 10000    // 10 seconds
queryTimeout: 30000      // 30 seconds
```

**Why this matters for STB:**
1. Prevents RAM exhaustion with limited connections
2. Reuses connections instead of creating new ones
3. Automatically cleans up idle connections
4. Prevents database connection leaks

### Response Compression

All responses are compressed using gzip/deflate to reduce bandwidth.

### Request Size Limits

- JSON body limit: 100KB
- Prevents memory issues on STB

---

## 🔧 Troubleshooting

### Database Connection Failed

```bash
Error: Database connection failed. Please check if MySQL is running.
```

**Solution:**
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check credentials in `.env`
3. Test connection: `mysql -u username -p database_name`

### Table Not Found

```bash
Error: Database table not found. Please check your configuration.
```

**Solution:**
1. Verify table name in `.env` matches your database
2. Check table exists: `SHOW TABLES;`

### API Key Invalid

```bash
{"success": false, "error": "Invalid API key"}
```

**Solution:**
1. Check `X-API-Key` header matches `.env` API_KEY
2. Ensure header name is exact: `X-API-Key`

---

## 📝 Project Structure

```
TST-API/
├── src/
│   ├── domain/              # Business logic
│   │   ├── Track.js         # Track entity
│   │   └── TrackRepository.js
│   ├── infrastructure/      # Database & external services
│   │   ├── database.js      # Connection pool
│   │   └── TrackRepositoryImpl.js
│   ├── interfaces/          # API layer
│   │   ├── controllers/
│   │   │   └── trackController.js
│   │   └── routes/
│   │       └── trackRoutes.js
│   ├── middleware/          # Auth & error handling
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── app.js              # Express app
│   └── server.js           # Server startup
├── config/
│   └── config.js           # Configuration
├── scripts/
│   ├── reference-schema.sql
│   └── add-indexes.sql
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 🎓 Notes for Anggota A (Book Catalog Integration)

### Key Points:

1. **Authentication**: Use `X-API-Key` header for all requests
2. **Gemini AI Format**: Use `/music/:id` endpoint for detailed audio features
3. **Batch Operations**: Use `/music/batch` for multiple tracks (more efficient than individual requests)
4. **CORS**: Add your Book API origin to `ALLOWED_ORIGINS` in `.env`
5. **Error Handling**: All responses follow `{success: true/false, data/error: ...}` structure

### Example Integration Code:

```javascript
// In your Book Catalog API
const MUSIC_API_URL = 'http://localhost:3000';
const MUSIC_API_KEY = 'your-api-key';

async function getTrackForGemini(trackId) {
  try {
    const response = await fetch(`${MUSIC_API_URL}/music/${trackId}`, {
      headers: { 'X-API-Key': MUSIC_API_KEY }
    });
    const result = await response.json();
    
    if (result.success) {
      return result.data; // Ready for Gemini AI
    }
  } catch (error) {
    console.error('Music API error:', error);
  }
}
```

---

## 📄 License

ISC - Proyek Sistem Terintegrasi

---

## 👥 Author

Anggota B - Sistem Terintegrasi  
Music Catalog Microservice

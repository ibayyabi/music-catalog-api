# Music Catalog API
Layanan mikroservis yang dioptimalkan untuk _deployment_ via set top box. Dibangun menggunakan express.js dan menggunakan pendekatan domain driven design untuk integrasi API katalog buku

## 🎯 Project Overview
 
**Stack**: Express.js + MySQL  
**Architecture**: Domain-Driven Design (DDD)  
**Optimization**: STB-optimized with Connection Pool & minimal dependencies

## 📋 Features

- ✅ REST API dengan kompresi
- ✅ Connection Pool (max 5 connections) untuk efisiensi STB
- ✅ Autentikasi API key untuk komunikasi antar layanan
- ✅ Support paginasi (10-20 items per page)
- ✅ Pengambilan data dengan pendekatan _batching_
- ✅ Docker support dengan alphine image (< 150MB)
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

Semua endpoint (kecuali `/health`, `/music/genres`, dan `/api-docs`) membutuhkan autentikasi API Key :

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

Mendapatkan paginasi list of tracks.

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

Mendapatkan informasi detail tentang musik.

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

Mendapatkan beberapa track sekaligus dalam satu request

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

Mencari musik berdasarkan genre.

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

Mendapatkan lagu berdasarkan genre dan mood.

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

Mendapatkan semua genre yang _available_

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

### Table Structure

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


### Response Compression

Semua respons dikompres menggunakan gzip/deflate untuk mengurangi penggunaan bandwidth.

### Request Size Limits

- JSON body limit: 100KB
- Prevents memory issues on STB

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

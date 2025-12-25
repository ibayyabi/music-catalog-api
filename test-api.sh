#!/bin/bash
# Test Music Catalog API Script
# Run this after starting the server

API_URL="http://localhost:3000"
API_KEY="test-api-key-12345"  # Sesuaikan dengan API_KEY di .env Anda

echo "==========================================="
echo "🎵 Music Catalog API - Testing Script"
echo "==========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check (no auth required)..."
curl -s "$API_URL/health" | jq '.'
echo ""
echo ""

# Test 2: API Info
echo "2️⃣  Testing API Info..."
curl -s "$API_URL/" | jq '.'
echo ""
echo ""

# Test 3: Get Genres (no auth required)
echo "3️⃣  Testing Get Genres..."
curl -s "$API_URL/music/genres" | jq '.'
echo ""
echo ""

# Test 4: List Tracks (with auth)
echo "4️⃣  Testing List Tracks (page 1, limit 5)..."
curl -s -H "X-API-Key: $API_KEY" "$API_URL/music?page=1&limit=5" | jq '.'
echo ""
echo ""

# Test 5: Get Track by ID (replace with actual track_id from your database)
echo "5️⃣  Testing Get Track by ID..."
echo "⚠️  Note: Replace '1' with actual track_id from your database"
curl -s -H "X-API-Key: $API_KEY" "$API_URL/music/1" | jq '.'
echo ""
echo ""

# Test 6: Search by Genre
echo "6️⃣  Testing Search by Genre (genre: rock)..."
echo "⚠️  Note: Replace 'rock' with actual genre from your database"
curl -s -H "X-API-Key: $API_KEY" "$API_URL/music/search?genre=rock&limit=5" | jq '.'
echo ""
echo ""

# Test 7: Batch Get Tracks
echo "7️⃣  Testing Batch Get Tracks..."
echo "⚠️  Note: Replace with actual track IDs from your database"
curl -s -H "X-API-Key: $API_KEY" "$API_URL/music/batch?ids=1,2,3" | jq '.'
echo ""
echo ""

# Test 8: Recommendations
echo "8️⃣  Testing Recommendations (genre: rock, mood: energetic)..."
curl -s -H "X-API-Key: $API_KEY" "$API_URL/music/recommendations?genre=rock&mood=energetic&limit=5" | jq '.'
echo ""
echo ""

echo "==========================================="
echo "✅ Testing Complete!"
echo "==========================================="

# Quick Start Testing Guide

## Prerequisites Check

Sebelum mulai, pastikan:
- ✅ MySQL sudah running
- ✅ Database musik sudah di-import
- ✅ File `.env` sudah dibuat dengan kredensial yang benar

## Step-by-Step Testing

### 1. Setup File `.env`

Buat file `.env` dari template:

```bash
cp .env.example .env
nano .env
```

**Isi dengan data MySQL Anda:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=your_database_name
DB_TABLE=your_table_name
API_KEY=test-api-key-12345
```

### 2. Verifikasi Database Connection

Test koneksi ke database Anda:

```bash
mysql -u root -p -e "USE your_database_name; SHOW TABLES;"
```

Pastikan tabel musik Anda muncul di list.

### 3. Start Server

```bash
npm start
```

**Output yang diharapkan:**
```
Testing database connection...
✓ Database connection test successful
✓ Database pool created with 5 max connections

==================================================
🎵 Music Catalog API - STB Optimized
==================================================
Server running on port 3000
Environment: development
API Documentation: http://localhost:3000/
==================================================
```

### 4. Testing (di Terminal Baru)

Buka terminal baru dan jalankan:

#### A. Manual Testing dengan curl

**Test 1: Health Check**
```bash
curl http://localhost:3000/health
```

**Test 2: List Tracks (butuh API Key)**
```bash
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/music?limit=5"
```

**Test 3: Get Track by ID**
```bash
# Ganti '1' dengan track_id dari database Anda
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/music/1"
```

**Test 4: Search by Genre**
```bash
# Ganti 'rock' dengan genre dari database Anda
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/music/search?genre=rock&limit=5"
```

**Test 5: Get Genres**
```bash
curl http://localhost:3000/music/genres
```

#### B. Automated Testing dengan Script

Jalankan script testing otomatis:

```bash
./test-api.sh
```

Script ini akan test semua 7 endpoints secara berurutan.

### 5. Testing dengan Browser

Buka browser dan kunjungi:

- **API Info**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health
- **Genres**: http://localhost:3000/music/genres

Untuk endpoint yang butuh API Key, gunakan extension seperti:
- Postman
- Thunder Client (VS Code extension)
- REST Client (VS Code extension)

## Troubleshooting

### Error: Database connection failed

**Solusi:**
```bash
# Cek MySQL status
systemctl status mysql

# Start MySQL jika belum running
sudo systemctl start mysql

# Test connection manual
mysql -u root -p
```

### Error: Table not found

**Solusi:**
```bash
# Verifikasi tabel ada
mysql -u root -p -e "USE your_database; SHOW TABLES;"

# Pastikan DB_TABLE di .env sesuai dengan nama tabel
```

### Error: Invalid API key

**Solusi:**
Pastikan value `API_KEY` di `.env` sama dengan yang digunakan di header `X-API-Key`

### Error: Port 3000 already in use

**Solusi:**
```bash
# Ubah PORT di .env
PORT=3001

# Atau kill process di port 3000
lsof -ti:3000 | xargs kill -9
```

## Next: Integration Testing

Setelah API berjalan, Anda bisa:

1. **Share dengan Anggota A:**
   - API Key dari `.env`
   - URL: `http://localhost:3000`
   - README.md untuk dokumentasi

2. **Test dengan Postman Collection** (opsional)
3. **Deploy dengan Docker** (lihat README.md)

## Quick Commands Reference

```bash
# Start server
npm start

# Test health
curl http://localhost:3000/health

# Get all genres
curl http://localhost:3000/music/genres

# List tracks (with auth)
curl -H "X-API-Key: test-api-key-12345" \
  "http://localhost:3000/music?limit=10"

# Run automated tests
./test-api.sh
```

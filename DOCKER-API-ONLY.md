# Deployment dengan Docker API Only + MySQL aaPanel

## 🎯 Setup: Docker untuk API, MySQL dari aaPanel

### **Prerequisites**

1. **MySQL dari aaPanel sudah running**
2. **Database sudah dibuat di aaPanel**
3. **Dataset sudah di-import ke database**

---

## 📋 **Step-by-Step Deployment**

### **1. Import Dataset ke MySQL aaPanel**

**Via aaPanel Web Interface:**
1. Login ke aaPanel
2. Database → Pilih database → Import
3. Upload `musikk_fixed.sql` (extract dari .gz dulu)
4. Execute import

**Via Command Line:**
```bash
# SSH ke STB
ssh root@192.168.100.37

# Extract dataset
cd /opt/music-catalog-api
gunzip database/musikk_fixed.sql.gz

# Import ke MySQL aaPanel
mysql -u root -p nama_database < database/musikk_fixed.sql

# Verify
mysql -u root -p -e "USE nama_database; SELECT COUNT(*) FROM tabel_musik;"
```

---

### **2. Setup .env File**

```bash
cd /opt/music-catalog-api
cp .env.example .env
nano .env
```

**Edit dengan credentials aaPanel MySQL:**

```env
# Server
PORT=3000
NODE_ENV=production

# Database - dari aaPanel
DB_HOST=localhost
DB_PORT=3306
DB_USER=root                    # User MySQL aaPanel
DB_PASSWORD=password_aapanel    # Password dari aaPanel
DB_NAME=nama_database_aapanel   # Database yang sudah dibuat
DB_TABLE=tabel_musik            # Tabel hasil import

# Connection Pool (optimized for STB)
DB_CONNECTION_LIMIT=2
DB_QUEUE_LIMIT=5

# Security
API_KEY=production-secure-key-change-this

# CORS
ALLOWED_ORIGINS=http://192.168.100.37:3001
```

**PENTING:** 
- `DB_HOST=localhost` (bukan `host.docker.internal` karena pakai `network_mode: host`)
- Gunakan credentials MySQL dari aaPanel

---

### **3. Start Docker API**

```bash
# Build dan start API container
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify container running
docker ps
```

---

### **4. Test API**

```bash
# Health check
curl http://localhost:3000/health

# Get genres
curl http://localhost:3000/music/genres

# List tracks (ganti dengan API_KEY dari .env)
curl -H "X-API-Key: production-secure-key-change-this" \
  "http://localhost:3000/music?limit=5"
```

---

## 🔧 **Management Commands**

### View Logs
```bash
docker-compose logs -f api
```

### Restart API
```bash
docker-compose restart
```

### Stop API
```bash
docker-compose down
```

### Update Code
```bash
cd /opt/music-catalog-api
git pull origin main
docker-compose up -d --build
```

### Check Resource Usage
```bash
docker stats music-api
```

---

## 📊 **Resource Usage**

**Dengan setup ini:**
- **API Container**: ~100-150MB RAM
- **MySQL aaPanel**: ~200-300MB RAM (sudah running)
- **Total Extra**: ~150MB (hanya API container)

✅ **Lebih hemat** dibanding full Docker Compose!

---

## 🆘 **Troubleshooting**

### API tidak bisa connect ke MySQL

**Problem:** Error "ECONNREFUSED" atau "Access denied"

**Solution:**
```bash
# 1. Cek MySQL running
systemctl status mysql

# 2. Test connection dari host
mysql -u root -p -e "SHOW DATABASES;"

# 3. Verify credentials di .env
cat .env | grep DB_

# 4. Check MySQL grants
mysql -u root -p
> GRANT ALL ON database_name.* TO 'root'@'localhost';
> FLUSH PRIVILEGES;
```

### Container tidak start

```bash
# Check logs
docker-compose logs

# Test manual run
docker run --rm -it --network host \
  -e DB_HOST=localhost \
  -e DB_PASSWORD=yourpass \
  music-catalog-api node src/server.js
```

### Port 3000 already in use

```bash
# Find process
lsof -i :3000

# Change port in .env
PORT=3001

# Restart
docker-compose up -d
```

---

## ✅ **Keuntungan Setup Ini**

| Aspek | Keuntungan |
|-------|-----------|
| RAM Usage | ✅ Hemat (~150MB vs ~800MB full Docker) |
| MySQL Control | ✅ Via aaPanel (backup, manage, monitoring) |
| Database Sharing | ✅ Bisa diakses aplikasi lain |
| API Isolation | ✅ API tetap isolated dalam container |
| Update | ✅ Mudah via git pull + rebuild |

---

## 🔒 **Security Checklist**

- [ ] MySQL hanya listen di localhost (tidak exposed)
- [ ] API_KEY diganti dari default
- [ ] DB_PASSWORD strong
- [ ] .env tidak masuk Git
- [ ] Firewall configured (port 3000 jika perlu public)

---

## 📝 **Quick Reference**

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Update
git pull && docker-compose up -d --build

# Stats
docker stats music-api
```

---

Selamat! API running dengan Docker, MySQL dari aaPanel! 🎉

# Docker Compose Deployment Guide

## 🐳 Deployment dengan Docker Compose di STB

### **Prerequisites di STB**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose

# Verify
docker --version
docker-compose --version
```

---

## 🚀 **Deployment Steps**

### **1. Clone Repository di STB**

```bash
ssh root@192.168.100.37

cd /opt
git clone https://github.com/ibayyabi/music-catalog-api.git
cd music-catalog-api
```

### **2. Create .env File**

```bash
cp .env.example .env
nano .env
```

**Edit dengan credentials STB:**

```env
# Server
PORT=3000
NODE_ENV=production

# Database (akan digunakan oleh Docker containers)
DB_USER=root
DB_PASSWORD=secure_password_here
DB_NAME=music_db
DB_TABLE=tabel_musik
DB_PORT=3306

# Connection Pool (optimized for STB)
DB_CONNECTION_LIMIT=2
DB_QUEUE_LIMIT=5

# Security
API_KEY=production-secure-api-key

# CORS
ALLOWED_ORIGINS=http://192.168.100.37:3001
```

Save: `Ctrl+X`, `Y`, `Enter`

### **3. Extract Dataset SQL**

```bash
# Dataset ada dalam bentuk .gz, extract dulu
gunzip database/musikk_fixed.sql.gz

# Verify
ls -lh database/
```

**PENTING:** File SQL harus di folder `database/` dan akan otomatis di-import saat MySQL container pertama kali start.

### **4. Start Docker Compose**

```bash
# Build dan start semua services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Apa yang terjadi:**
1. ✅ MySQL container start dengan database `music_db`
2. ✅ SQL file di `database/` otomatis di-import
3. ✅ API container wait sampai MySQL ready
4. ✅ API connect ke MySQL dan start

### **5. Verify Deployment**

```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs api
docker-compose logs mysql

# Test API
curl http://localhost:3000/health

# Test dengan API Key
curl -H "X-API-Key: production-secure-api-key" \
  "http://localhost:3000/music?limit=5"
```

---

## 📊 **Management Commands**

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f mysql
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Services
```bash
# Stop all (containers tetap ada)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove including volumes (⚠️ DATA HILANG)
docker-compose down -v
```

### Update Code
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# View new logs
docker-compose logs -f api
```

### Check Resource Usage
```bash
# Monitor real-time
docker stats

# Specific container
docker stats music-api music-db
```

---

## 🔧 **Troubleshooting**

### Container tidak start
```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs mysql
docker-compose logs api
```

### Database import gagal
```bash
# Check MySQL logs
docker-compose logs mysql

# Manual import
docker exec -i music-db mysql -uroot -p<password> music_db < database/musikk_fixed.sql
```

### API tidak connect ke database
```bash
# Check network
docker network ls
docker network inspect music-catalog-api_music-network

# Check environment variables
docker-compose exec api printenv | grep DB_
```

### Out of Memory
```bash
# Check resource usage
docker stats

# Adjust limits in docker-compose.yml
# memory: 256M -> 128M (API)
# memory: 512M -> 256M (MySQL)
```

### Port already in use
```bash
# Find process using port
lsof -i :3000

# Change port in .env
PORT=3001

# Restart
docker-compose up -d
```

---

## 🎯 **Production Best Practices**

### 1. **Persistent Data**
```bash
# Backup database
docker exec music-db mysqldump -uroot -p<password> music_db > backup.sql

# Restore database
docker exec -i music-db mysql -uroot -p<password> music_db < backup.sql
```

### 2. **Auto-restart on Reboot**
Docker Compose sudah set `restart: unless-stopped`, jadi container akan auto-start saat STB reboot.

### 3. **Resource Monitoring**
```bash
# Setup cron untuk monitoring
crontab -e

# Add line:
*/5 * * * * docker stats --no-stream >> /var/log/docker-stats.log
```

### 4. **Cleanup Old Images**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 📋 **Quick Reference**

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Update
git pull && docker-compose up -d --build

# Backup
docker exec music-db mysqldump -uroot -p music_db > backup.sql
```

---

## 🔒 **Security Checklist**

- [ ] `.env` file tidak masuk Git (di `.gitignore`)
- [ ] `API_KEY` diganti dari default
- [ ] `DB_PASSWORD` strong & secure
- [ ] Port 3306 (MySQL) tidak exposed ke public (hanya internal Docker network)
- [ ] Port 3000 (API) protected dengan firewall jika perlu

---

## 💡 **Keuntungan Docker Compose vs Manual**

| Aspek | Docker Compose | Manual |
|-------|----------------|--------|
| Setup | ✅ Cepat (1 command) | ❌ Banyak step |
| Isolasi | ✅ Containers isolated | ❌ Langsung di system |
| MySQL | ✅ Auto-included | ❌ Harus install manual |
| Update | ✅ `git pull && docker-compose up -d --build` | ❌ Manual restart |
| Rollback | ✅ Mudah (ganti image tag) | ❌ Sulit |
| Portability | ✅ Works di mana saja | ❌ Depend on system |

---

Selamat! API Anda running dengan Docker Compose! 🎉

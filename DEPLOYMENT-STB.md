# Deployment Guide untuk Settop Box (STB)

## 📋 Prerequisites

Sebelum deploy ke STB, pastikan:
- ✅ STB memiliki akses ke MySQL database (lokal atau remote)
- ✅ STB memiliki Node.js >= 18 ATAU Docker installed
- ✅ Minimal 512MB RAM available (recommended 1GB)
- ✅ Network connectivity untuk npm install (jika deploy pertama kali)

---

## 🚀 Opsi Deployment

### **Opsi 1: Docker Deployment (RECOMMENDED untuk STB)**

Docker lebih aman dan isolated, cocok untuk STB dengan resource terbatas.

#### **Step 1: Persiapan Files**

Transfer files ke STB:
```bash
# Di komputer development Anda
cd /home/ikhbarr/Documents/File\ Ibay/TST-API

# Compress project (exclude node_modules)
tar -czf music-api.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .

# Transfer ke STB via SCP
scp music-api.tar.gz user@stb-ip:/home/user/
```

#### **Step 2: Extract di STB**

```bash
# SSH ke STB
ssh user@stb-ip

# Extract
tar -xzf music-api.tar.gz -C /opt/music-api

cd /opt/music-api
```

#### **Step 3: Configure Environment**

```bash
# Buat .env file
nano .env
```

Isi dengan konfigurasi STB:
```env
# Server
PORT=3000
NODE_ENV=production

# Database (bisa lokal STB atau remote server)
DB_HOST=localhost  # atau IP database server
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_db
DB_TABLE=tabel_musik

# Connection Pool (optimized for STB)
DB_CONNECTION_LIMIT=3  # Lebih rendah untuk STB dengan RAM terbatas
DB_QUEUE_LIMIT=5

# API Security
API_KEY=production-api-key-change-this

# CORS
ALLOWED_ORIGINS=http://stb-local-ip:3001
```

**PENTING untuk STB**: Kurangi `DB_CONNECTION_LIMIT` dari 5 ke **2-3** untuk STB dengan RAM terbatas!

#### **Step 4: Build & Run Docker Container**

```bash
# Build image
docker build -t music-catalog-api .

# Run container
docker run -d \
  --name music-api \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  --memory="256m" \
  --memory-swap="512m" \
  --cpus="0.5" \
  music-catalog-api

# Cek logs
docker logs -f music-api
```

**Resource Limits untuk STB:**
- `--memory="256m"`: Limit RAM ke 256MB
- `--memory-swap="512m"`: Total memory + swap
- `--cpus="0.5"`: Limit CPU usage

#### **Step 5: Verify**

```bash
# Test dari STB
curl http://localhost:3000/health

# Test dari external
curl http://stb-ip:3000/health
```

---

### **Opsi 2: Manual Deployment (Tanpa Docker)**

Jika STB tidak support Docker, deploy manual dengan Node.js.

#### **Step 1: Transfer & Extract** (sama seperti Opsi 1)

#### **Step 2: Install Dependencies**

```bash
cd /opt/music-api

# Install production dependencies only
npm ci --only=production --no-audit --no-fund
```

#### **Step 3: Configure Environment** (sama seperti Opsi 1)

#### **Step 4: Setup Systemd Service**

Buat service agar auto-start saat STB reboot:

```bash
sudo nano /etc/systemd/system/music-api.service
```

Isi dengan:
```ini
[Unit]
Description=Music Catalog API for STB
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/music-api
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10

# Resource limits untuk STB
MemoryLimit=256M
CPUQuota=50%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=music-api

[Install]
WantedBy=multi-user.target
```

#### **Step 5: Start Service**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start
sudo systemctl enable music-api

# Start service
sudo systemctl start music-api

# Check status
sudo systemctl status music-api

# View logs
sudo journalctl -u music-api -f
```

---

## 🔧 Optimasi untuk STB

### **1. Kurangi Connection Pool**

Edit `config/config.js` atau `.env`:
```env
DB_CONNECTION_LIMIT=2  # Dari 5 ke 2-3 untuk STB
DB_QUEUE_LIMIT=5       # Dari 10 ke 5
```

### **2. Enable Swap Memory** (jika STB support)

```bash
# Cek swap
free -h

# Jika tidak ada swap, buat file swap 512MB
sudo fallocate -l 512M /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### **3. Monitoring Resource Usage**

```bash
# Monitor real-time
top -p $(pgrep -f "node src/server")

# Atau dengan htop (lebih user-friendly)
htop -p $(pgrep -f "node src/server")

# Docker stats (jika pakai Docker)
docker stats music-api
```

---

## 🌐 Networking Setup

### **Jika Book Catalog API di Device Berbeda**

1. **Expose Port di STB Firewall:**
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3000/tcp

# Firewalld (CentOS/Fedora)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

2. **Update CORS di .env:**
```env
ALLOWED_ORIGINS=http://book-api-ip:port,http://another-service:port
```

3. **Test dari External:**
```bash
curl http://stb-ip:3000/health
```

---

## 📊 Database Options untuk STB

### **Opsi A: MySQL Lokal di STB**

**Pros:**
- Latency rendah
- Tidak perlu network

**Cons:**
- Konsumsi RAM tambahan (~200-300MB)

**Setup:**
```bash
# Install MySQL di STB
sudo apt install mysql-server

# Import database
mysql -u root -p < /path/to/music_db_dump.sql

# Configure di .env
DB_HOST=localhost
```

### **Opsi B: MySQL Remote (Recommended untuk STB dengan RAM Terbatas)**

**Pros:**
- Hemat RAM di STB
- Centralized database

**Cons:**
- Network dependency
- Latency sedikit lebih tinggi

**Setup di .env:**
```env
DB_HOST=192.168.1.100  # IP server database
DB_PORT=3306
```

**Ensure MySQL server allow remote connections:**
```bash
# Di MySQL server
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Set bind-address
bind-address = 0.0.0.0

# Restart MySQL
sudo systemctl restart mysql

# Grant access
mysql -u root -p
GRANT ALL ON music_db.* TO 'root'@'stb-ip' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
```

---

## 🔍 Troubleshooting di STB

### **1. Out of Memory (OOM)**

**Gejala:** Process killed tiba-tiba

**Solusi:**
```bash
# Kurangi connection pool di .env
DB_CONNECTION_LIMIT=2

# Add swap memory (jika belum ada)

# Restart service
sudo systemctl restart music-api
```

### **2. Slow Response**

**Gejala:** API response > 1 detik

**Solusi:**
```bash
# Check CPU usage
top

# Add indexes di database
mysql -u root -p music_db < scripts/add-indexes.sql

# Check network latency (jika DB remote)
ping db-server-ip
```

### **3. Service Crash on Boot**

**Gejala:** Service tidak start saat STB reboot

**Solusi:**
```bash
# Pastikan MySQL start dulu
sudo systemctl enable mysql
sudo systemctl start mysql

# Tambah delay di service
# Edit /etc/systemd/system/music-api.service
# Tambahkan:
[Service]
ExecStartPre=/bin/sleep 10  # Wait 10 seconds

# Reload & restart
sudo systemctl daemon-reload
sudo systemctl restart music-api
```

---

## 📝 Checklist Deployment

### Pre-Deployment
- [ ] Test API di development berhasil
- [ ] Database sudah ada di target server
- [ ] .env file configured dengan benar
- [ ] Connection pool disesuaikan untuk STB (2-3)
- [ ] API_KEY diganti dari default

### Deployment
- [ ] Files transferred ke STB
- [ ] Dependencies installed (atau Docker image built)
- [ ] Service running
- [ ] Health check berhasil
- [ ] Test minimal 1 endpoint dengan API Key

### Post-Deployment
- [ ] Monitor memory usage (harus < 300MB)
- [ ] Monitor CPU usage (harus < 50%)
- [ ] Test dari Book Catalog API
- [ ] Setup auto-restart (systemd atau Docker)
- [ ] Backup .env file

---

## 🎯 Production Checklist

```bash
# 1. Change default API key
API_KEY=<generate-secure-random-key>

# 2. Set production mode
NODE_ENV=production

# 3. Reduce pool size
DB_CONNECTION_LIMIT=2

# 4. Enable monitoring
# Install monitoring tool (optional)
npm install -g pm2  # Jika tidak pakai Docker/systemd

# 5. Test all endpoints
./test-api.sh  # Run dari STB
```

---

## 📈 Expected Performance pada STB

**Resource Usage (dengan 2-3 connection pool):**
- RAM: ~150-250MB
- CPU: ~10-30% (idle), ~40-60% (load)
- Response Time: < 200ms (local DB), < 500ms (remote DB)

**Capacity:**
- Concurrent Requests: ~20-50 (tergantung STB specs)
- Database Size: Up to 10,000 tracks tanpa performance issues

---

## 🆘 Support Scripts

### Quick Deploy Script

Buat script `deploy-stb.sh`:
```bash
#!/bin/bash
# Quick deployment script for STB

echo "Deploying Music Catalog API to STB..."

# Stop existing service
sudo systemctl stop music-api 2>/dev/null || true

# Update code
cd /opt/music-api
git pull || echo "No git repo, skipping pull"

# Install dependencies (if needed)
npm ci --only=production

# Restart service
sudo systemctl start music-api

# Check status
sleep 3
sudo systemctl status music-api

# Test health
curl -s http://localhost:3000/health | jq '.'

echo "Deployment complete!"
```

### Health Monitor Script

Buat `monitor-health.sh`:
```bash
#!/bin/bash
# Monitor API health and auto-restart if needed

while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
  
  if [ "$response" != "200" ]; then
    echo "API unhealthy! Restarting..."
    sudo systemctl restart music-api
    sleep 10
  else
    echo "API healthy - $(date)"
  fi
  
  sleep 60  # Check every minute
done
```

---

## 🎓 Summary

**Recommended Deployment für STB:**
1. **Use Docker** (isolated & reproducible)
2. **Connection Pool: 2-3** (instead of 5)
3. **Remote MySQL** (save STB RAM)
4. **Enable swap** (512MB)
5. **Monitor resources** dengan docker stats atau htop

**Command untuk Start:**
```bash
docker run -d --name music-api --restart unless-stopped \
  -p 3000:3000 --env-file .env \
  --memory="256m" --cpus="0.5" \
  music-catalog-api
```

Need help with specific STB model atau ada error saat deployment? Let me know! 🚀

# CraftAgent Deployment Guide

Complete procedure for hosting CraftAgent in production.

---

## 🚀 Deployment Overview

### Architecture Diagram

```
Internet
    ↓
CloudFlare (CDN, DDoS Protection)
    ↓
Nginx (Reverse Proxy, SSL)
    ↓
FastAPI Backend (Multiple instances)
    ↓
    ├─ PostgreSQL (Database)
    ├─ Redis (Cache, Message Queue)
    └─ Celery Workers (Background Tasks)

Frontend (React/Vite) → CDN/S3 Bucket
```

### Hosting Options Comparison

| Option | Cost | Difficulty | Best For |
|--------|------|------------|----------|
| **Heroku** | $50-500/mo | Easy | Startups, quick deployment |
| **Railway** | $5-50/mo | Easy | Small projects, learning |
| **DigitalOcean** | $5-100/mo | Medium | Production, scalability |
| **AWS** | $10-500+/mo | Hard | Large scale, enterprise |
| **Render** | $7-100/mo | Easy | Full-stack apps |
| **PythonAnywhere** | $5-50/mo | Medium | Python-focused |
| **Docker + VPS** | $5-50/mo | Hard | Full control |

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with all code pushed
- ✅ Database (PostgreSQL) setup
- ✅ Redis instance running
- ✅ Anthropic API key
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (free via Let's Encrypt)

---

## 🌍 Option 1: Deploy to Railway (Recommended for Beginners)

**Cost**: $5-50/month | **Setup Time**: 15 minutes

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Project

```bash
# From Railway dashboard
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your craftgent repository
4. Railway automatically detects FastAPI backend
```

### Step 3: Add Database Services

```bash
# In Railway Dashboard:
1. Click "Add Service" → PostgreSQL
2. Click "Add Service" → Redis
3. Railway auto-creates databases and provides connection URLs
```

### Step 4: Set Environment Variables

```bash
# In Railway Dashboard → Variables
ANTHROPIC_API_KEY=your_api_key_here
SECRET_KEY=generate_32_char_random_string
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://default:password@host:6379
APP_ENV=production
CORS_ORIGINS=https://yourdomain.com
```

### Step 5: Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Upload to Railway static hosting or:
# Use Vercel for free frontend hosting
```

### Step 6: Configure Custom Domain

```bash
# In Railway Dashboard:
1. Click Settings → Custom Domain
2. Add your domain: yourdomain.com
3. Update DNS records at your registrar
4. Wait 10-30 minutes for DNS propagation
```

---

## 🏔️ Option 2: Deploy to DigitalOcean (Recommended for Production)

**Cost**: $5-50/month | **Setup Time**: 45 minutes

### Step 1: Create DigitalOcean Account

1. Go to [digitalocean.com](https://www.digitalocean.com/)
2. Sign up and add payment method
3. Create new Droplet

### Step 2: Create Droplet (VPS)

```bash
# In DigitalOcean Console:
1. Choose: Ubuntu 22.04 LTS
2. Size: $6/month (2GB RAM, 1 vCPU) - minimum
3. Add SSH key for secure access
4. Create Droplet
5. Note the IP address (e.g., 192.168.1.1)
```

### Step 3: SSH into Droplet

```bash
ssh root@192.168.1.1

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3.12 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx curl git
```

### Step 4: Deploy Backend

```bash
# Clone repository
cd /home
git clone https://github.com/yourusername/craftgent.git
cd craftgent/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Test backend locally
uvicorn app.main:app --reload --port 8000
```

### Step 5: Setup PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE craftgent;
CREATE USER craftgent_user WITH PASSWORD 'strong_password_here';
ALTER ROLE craftgent_user SET client_encoding TO 'utf8';
ALTER ROLE craftgent_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE craftgent_user SET default_transaction_deferrable TO on;
ALTER ROLE craftgent_user SET default_transaction_read_uncommitted TO off;
GRANT ALL PRIVILEGES ON DATABASE craftgent TO craftgent_user;
\q

# Update .env file with database URL:
DATABASE_URL=postgresql://craftgent_user:strong_password_here@localhost:5432/craftgent
```

### Step 6: Setup Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/craftgent-backend.service

# Paste this content:
[Unit]
Description=CraftAgent FastAPI Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=notify
User=www-data
WorkingDirectory=/home/craftgent/backend
Environment="PATH=/home/craftgent/backend/venv/bin"
ExecStart=/home/craftgent/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable craftgent-backend
sudo systemctl start craftgent-backend
sudo systemctl status craftgent-backend
```

### Step 7: Setup Nginx Reverse Proxy

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/craftgent

# Paste this content:
upstream craftgent_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://craftgent_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /ws/ {
        proxy_pass http://craftgent_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://craftgent_backend;
        proxy_set_header Host $host;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/craftgent /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Step 8: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Step 9: Update Nginx for HTTPS

```bash
# Update nginx config
sudo nano /etc/nginx/sites-available/craftgent

# Replace with:
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of config same as above ...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 10: Deploy Frontend

```bash
# Build frontend
cd /home/craftgent/frontend
npm run build

# Option A: Host on same server
sudo cp -r dist /var/www/craftgent
sudo chown -R www-data:www-data /var/www/craftgent

# Option B: Deploy to Vercel (recommended)
npm install -g vercel
vercel --prod

# Option C: Deploy to Netlify
# Connect GitHub repo to Netlify dashboard
```

---

## ☁️ Option 3: Deploy to AWS (Enterprise)

**Cost**: $10-500+/month | **Setup Time**: 2+ hours

### Architecture

```
CloudFront CDN
    ↓
API Gateway / ALB
    ↓
ECS Fargate (Backend containers)
    ↓
RDS PostgreSQL
CloudCache (Redis)
S3 (Frontend)
```

### Quick Setup

1. **Frontend**: Upload built files to S3 bucket
2. **Backend**: 
   - Create RDS PostgreSQL instance
   - Create ElastiCache Redis
   - Deploy to ECS Fargate or EC2
3. **CDN**: CloudFront for static assets
4. **DNS**: Route 53 for domain

See [AWS Deployment Guide](https://aws.amazon.com/getting-started/) for detailed steps.

---

## 🐳 Option 4: Docker Deployment (Any Host)

### Step 1: Create Dockerfile (Backend)

```dockerfile
# Dockerfile (in backend/)
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 2: Create Docker Compose

```yaml
# docker-compose.yml (root)
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: craftgent
      POSTGRES_USER: craftgent_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://craftgent_user:secure_password@postgres:5432/craftgent
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### Step 3: Deploy

```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## 📊 Post-Deployment Checklist

### Security

- ✅ Enable HTTPS/SSL
- ✅ Set strong SECRET_KEY (32+ random characters)
- ✅ Restrict CORS_ORIGINS to your domain
- ✅ Enable firewall (UFW on Linux)
- ✅ Regular security updates (apt update && upgrade)
- ✅ Use environment variables for secrets
- ✅ Enable database backups
- ✅ Monitor API rate limits

### Performance

- ✅ Enable caching (Redis, Nginx)
- ✅ Gzip compression in Nginx
- ✅ CDN for static assets (CloudFlare, CloudFront)
- ✅ Database query optimization
- ✅ Connection pooling enabled
- ✅ Monitor response times

### Monitoring & Logging

- ✅ Setup error tracking (Sentry)
- ✅ Monitor server resources (CPU, RAM, Disk)
- ✅ Log rotation configured
- ✅ Health checks automated
- ✅ Alerts for critical errors
- ✅ Database backups automated

### Maintenance

- ✅ Regular backups (daily PostgreSQL dumps)
- ✅ Update dependencies monthly
- ✅ Monitor disk space
- ✅ Clean up old logs
- ✅ Performance optimization
- ✅ Security patches applied

---

## 🔍 Monitoring & Observability

### Setup Sentry (Error Tracking)

```bash
# Install
pip install sentry-sdk

# Add to app initialization
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn@sentry.io/123456",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0
)
```

### Setup HealthChecks.io

```bash
# Periodic endpoint health checks
curl -X POST https://hc-ping.com/your-uuid-here
```

### Monitor with Uptime Robot

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add your API endpoint: `https://yourdomain.com/api/health`
3. Get alerts if site goes down

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check logs
journalctl -u craftgent-backend -n 100

# Test locally
source venv/bin/activate
uvicorn app.main:app --reload

# Check database connection
psql postgresql://user:pass@localhost/craftgent
```

### Database connection fails

```bash
# Verify PostgreSQL running
sudo systemctl status postgresql

# Check connection string in .env
# Format: postgresql://user:password@host:port/database
```

### Nginx returns 502

```bash
# Check backend running
sudo systemctl status craftgent-backend

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify upstream in nginx config
sudo nginx -t
```

### SSL certificate expired

```bash
# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew
```

---

## 📈 Scaling

### Horizontal Scaling (Multiple Servers)

```
Load Balancer (HAProxy / Nginx)
    ├─ Backend Server 1
    ├─ Backend Server 2
    └─ Backend Server 3

Shared:
    ├─ PostgreSQL (single RDS instance)
    └─ Redis (single ElastiCache instance)
```

### Vertical Scaling (Bigger Server)

1. Upgrade droplet size in DigitalOcean
2. Restart services
3. Monitor performance

### Database Scaling

```bash
# Add read replicas for read-heavy workloads
# Connection pooling with PgBouncer
# Caching with Redis
# Database indexes optimization
```

---

## 💾 Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DB_NAME="craftgent"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
pg_dump postgresql://user:pass@localhost/$DB_NAME > $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_$TIMESTAMP.sql.gz s3://your-bucket/backups/
```

Add to crontab:
```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🎯 Deployment Summary

| Step | Time | Provider |
|------|------|----------|
| 1. Choose hosting | 5 min | - |
| 2. Create account | 5 min | Railway/DO/AWS |
| 3. Setup database | 10 min | PostgreSQL |
| 4. Deploy backend | 15 min | Droplet/Railway |
| 5. Setup SSL | 10 min | Let's Encrypt |
| 6. Deploy frontend | 10 min | Vercel/Netlify |
| 7. Configure domain | 10 min | Registrar |
| 8. Setup monitoring | 10 min | Sentry/UptimeRobot |

**Total**: ~75 minutes from start to fully deployed production site

---

## 📞 Support Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **DigitalOcean Guides**: [digitalocean.com/community/tutorials](https://www.digitalocean.com/community/tutorials)
- **FastAPI Deployment**: [fastapi.tiangolo.com/deployment](https://fastapi.tiangolo.com/deployment/)
- **Nginx Docs**: [nginx.org/en/docs](https://nginx.org/en/docs/)
- **Let's Encrypt**: [letsencrypt.org](https://letsencrypt.org)

---

**Status**: Ready for Production  
**Last Updated**: 2026-04-06  
**Recommended**: Railway (easiest) or DigitalOcean (best control)

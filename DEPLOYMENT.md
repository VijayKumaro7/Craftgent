# Phase 4: Production Deployment Guide 🚀

Complete guide for deploying CraftAgent to production using Docker Compose, Nginx, and CI/CD.

---

## Table of Contents

1. [Local Development with Docker](#local-development-with-docker)
2. [Production Deployment](#production-deployment)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Monitoring & Maintenance](#monitoring--maintenance)
5. [Troubleshooting](#troubleshooting)
6. [Security Checklist](#security-checklist)

---

## Local Development with Docker

### Prerequisites

- Docker Desktop (includes Docker Engine and Docker Compose)
- `.env` file with required variables (copy from `.env.example`)

### Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/vijaykumaro7/craftgent.git
cd craftgent

# 2. Create environment file
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY

# 3. Start all services
docker-compose up -d

# 4. Check service health
docker-compose ps
```

### Services Running

- **Frontend:** http://localhost:5173 (Vite dev server)
- **Backend API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **ChromaDB:** localhost:8001

### Useful Commands

```bash
# View logs
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs

# Run database migrations
docker-compose exec backend alembic upgrade head

# Access backend shell
docker-compose exec backend bash

# Stop all services
docker-compose down

# Rebuild images
docker-compose build

# Clean up volumes (WARNING: deletes data)
docker-compose down -v
```

---

## Production Deployment

### 1. Server Setup

**Minimum Requirements:**
- 2GB RAM
- 10GB storage
- Ubuntu 20.04+ or similar Linux
- Docker & Docker Compose installed
- Domain name (for HTTPS)

**Install Docker:**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Environment Configuration

```bash
# SSH into your server
ssh user@your-server.com

# Create application directory
mkdir -p ~/craftgent && cd ~/craftgent

# Clone repository
git clone https://github.com/vijaykumaro7/craftgent.git .

# Create production environment
cp .env.example .env.prod
```

**Edit `.env.prod` with production values:**

```bash
# REQUIRED: Set these for production
ANTHROPIC_API_KEY=sk-ant-xxxxx
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
POSTGRES_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
REDIS_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# CORS for your domain
CORS_ORIGINS=https://craftgent.example.com,https://api.craftgent.example.com

# Environment
APP_ENV=production
LOG_LEVEL=info
```

### 3. SSL/TLS Setup

```bash
# Create directory for SSL certificates
mkdir -p nginx/ssl

# Option A: Using Let's Encrypt with Certbot
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --standalone \
  -d craftgent.example.com \
  -d api.craftgent.example.com

# Copy certificates
sudo cp /etc/letsencrypt/live/craftgent.example.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/craftgent.example.com/privkey.pem nginx/ssl/key.pem
sudo chown $USER:$USER nginx/ssl/*

# Option B: Self-signed certificate (testing only)
openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes
```

### 4. Deploy Application

```bash
# Set environment variables from .env.prod
set -a
source .env.prod
set +a

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services are running
docker-compose -f docker-compose.prod.yml ps

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check health
curl https://craftgent.example.com/api/health
```

### 5. Backup Strategy

```bash
# Create backup directory
mkdir -p /backups

# Backup PostgreSQL daily
0 2 * * * docker-compose -f /home/user/craftgent/docker-compose.prod.yml \
  exec -T postgres pg_dump -U craftgent craftgent | \
  gzip > /backups/craftgent-$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "craftgent-*.sql.gz" -mtime +30 -delete
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Automatically tests, builds, and deploys on push to `main` or `develop` branches.

**Stages:**

1. **Backend Tests** - Run pytest, type checking
2. **Frontend Tests** - Build, type checking, linting
3. **Docker Build** - Build and push images to GitHub Container Registry
4. **Security Scan** - Trivy vulnerability scanning
5. **Deploy** - Deploy to production (main branch only)

### Setup

```bash
# 1. Create deployment SSH key
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""

# 2. Add public key to your server's authorized_keys
cat deploy_key.pub | ssh user@your-server.com "cat >> ~/.ssh/authorized_keys"

# 3. Add secrets to GitHub repository settings:
# - DEPLOY_KEY: (contents of deploy_key)
# - DEPLOY_HOST: your-server.com
# - DEPLOY_USER: user
# - ANTHROPIC_API_KEY: sk-ant-xxxxx
```

### Workflow Triggers

- Push to `main` or `develop` → Run tests + build images
- Push to `main` → Also deploy to production
- Pull requests → Run tests only

### View Workflow Status

- GitHub UI: Actions tab
- CLI: `gh run list -R vijaykumaro7/craftgent`

### Custom Deployment

If you don't use GitHub Actions, deploy manually:

```bash
cd ~/craftgent

# Pull latest code
git pull origin main

# Update environment variables if needed
# vim .env.prod

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
curl https://craftgent.example.com/api/health
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs --follow backend

# API health
curl https://craftgent.example.com/api/health

# Database
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_isready -U craftgent -d craftgent
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Cleanup unused images/volumes
docker system prune -a
```

### Database Maintenance

```bash
# Backup (manual)
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U craftgent craftgent > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U craftgent craftgent < backup.sql

# Connection stats
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U craftgent craftgent -c "SELECT * FROM pg_stat_activity;"
```

### Log Management

```bash
# View container logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100 backend

# Archive old logs
cd /var/lib/docker/containers
find . -name "*.log" -mtime +30 -delete
```

### Update Services

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart with new images
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Port already in use: change ports in compose file
# - Missing environment variables: check .env.prod
# - Volume permission errors: check file ownership
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U craftgent -d craftgent -c "SELECT 1"
```

### API not responding

```bash
# Check backend service
docker-compose -f docker-compose.prod.yml logs backend

# Check Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Test API directly
curl http://craftgent-backend:8000/api/health
```

### High memory usage

```bash
# Check which containers are using memory
docker stats

# Restart problematic container
docker-compose -f docker-compose.prod.yml restart backend

# Clear cache
docker system prune -a
```

### SSL certificate issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew --force-renewal

# Copy to application
sudo cp /etc/letsencrypt/live/craftgent.example.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/craftgent.example.com/privkey.pem nginx/ssl/key.pem
```

---

## Security Checklist

- [ ] **Environment Variables**
  - [ ] `ANTHROPIC_API_KEY` set from secure source
  - [ ] `SECRET_KEY` is cryptographically random
  - [ ] Database passwords are strong (32+ chars)
  - [ ] `.env.prod` is never committed to git

- [ ] **Network Security**
  - [ ] Firewall blocks all ports except 80, 443
  - [ ] SSH key-based auth only (no passwords)
  - [ ] Fail2ban or similar for brute-force protection
  - [ ] VPN for internal access if possible

- [ ] **Database Security**
  - [ ] PostgreSQL not exposed to internet
  - [ ] Regular automated backups (encrypted)
  - [ ] Backup integrity tested (restore test)
  - [ ] Old backups deleted regularly

- [ ] **TLS/SSL**
  - [ ] Valid certificate from Let's Encrypt
  - [ ] Certificate renewal automated
  - [ ] HSTS header enabled (nginx.conf)
  - [ ] TLS 1.2+ only, weak ciphers disabled

- [ ] **Application Security**
  - [ ] `APP_ENV=production` set
  - [ ] Debug mode disabled
  - [ ] CORS origins restricted to your domain
  - [ ] Rate limiting enabled (nginx)

- [ ] **Monitoring**
  - [ ] Logs collected and rotated
  - [ ] Uptime monitoring configured
  - [ ] Error tracking (Sentry or similar)
  - [ ] Alerts configured for failures

- [ ] **Updates**
  - [ ] Docker images regularly updated
  - [ ] Security patches applied promptly
  - [ ] Python/Node dependencies updated
  - [ ] OS security updates installed

---

## Scaling to Production

### Single Server Setup
- Good for: MVP, low-moderate traffic (< 1000 req/min)
- Cost: $5-20/month
- Components: App, DB, Redis, Nginx on one server

### Multi-Server Setup (Load Balanced)
- Good for: Growing traffic, high availability
- Cost: $50-200/month
- Components:
  - Load balancer (Nginx)
  - 2+ API servers
  - 1 database server
  - Redis cluster
  - CDN for static files

### Cloud Platform Deployment
- **Railway:** easiest, git-based deploy
- **DigitalOcean:** good value, straightforward
- **AWS:** most features, complex
- **Heroku:** simple but expensive at scale

---

## Next Steps

1. **Monitor:** Set up uptime monitoring and error tracking
2. **Optimize:** Profile performance and optimize bottlenecks
3. **Scale:** Add load balancing and database replication
4. **Secure:** Implement WAF, DDoS protection, rate limiting
5. **Backup:** Automate backups and test recovery
6. **Maintain:** Regular security updates and dependency upgrades

---

## Support

- **Docs:** See [README.md](./README.md)
- **Issues:** Report bugs on [GitHub Issues](https://github.com/vijaykumaro7/craftgent/issues)
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Happy Deploying! 🚀**

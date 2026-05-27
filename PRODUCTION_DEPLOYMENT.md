# Production Deployment Guide

## Prerequisites

This guide covers deploying Craftgent to production with security hardening. You'll need:

- Docker & Docker Compose (or container orchestration: Kubernetes, etc.)
- Managed PostgreSQL database (AWS RDS, Supabase, Google Cloud SQL, etc.)
- HTTPS certificate (Let's Encrypt, AWS ACM, etc.)
- Monitoring service (optional but recommended: Sentry, DataDog, etc.)
- Email service for password reset (optional: SendGrid, AWS SES, etc.)

---

## 1. HTTPS/TLS Setup

### Option A: Using Let's Encrypt with Nginx (Recommended)

#### Install Certbot

```bash
# On your server (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

#### Generate Certificate

```bash
# Replace yourdomain.com with your actual domain
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --agree-tos \
  --email your-email@example.com
```

Certificates are stored at:
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem` (public cert)
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem` (private key)

#### Auto-Renewal

```bash
# Certbot auto-renews by default, but verify
sudo systemctl status certbot.timer
# Or manually renew
sudo certbot renew
```

#### Mount Certificates in Docker

In `docker-compose.prod.yml`:

```yaml
services:
  nginx:
    volumes:
      - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/certs:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
```

### Option B: Using AWS ACM (Certificate Manager)

If running on AWS:

```bash
# Create certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com \
  --validation-method DNS

# Verify DNS records as instructed
# Attach to Application Load Balancer in AWS console
```

### Option C: Using Cloudflare (Easiest)

1. Point your domain to Cloudflare nameservers
2. Go to SSL/TLS → Origin Server
3. Click "Create Certificate"
4. Cloudflare generates free SSL cert
5. Download and use in your Nginx/proxy

---

## 2. Managed PostgreSQL Setup

### Option A: AWS RDS (Recommended for AWS Users)

#### Create RDS Database

```bash
aws rds create-db-instance \
  --db-instance-identifier craftgent-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username craftgent_admin \
  --master-user-password "$(openssl rand -base64 32)" \
  --allocated-storage 20 \
  --storage-type gp3 \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxxxxx \
  --backup-retention-period 7 \
  --enable-encryption \
  --kms-key-id arn:aws:kms:region:account:key/id
```

#### Get Connection Details

```bash
aws rds describe-db-instances \
  --db-instance-identifier craftgent-prod \
  --query 'DBInstances[0].Endpoint'

# Output: craftgent-prod.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com:5432
```

#### Set Environment Variable

```bash
# In production .env
DATABASE_URL=postgresql+asyncpg://craftgent_admin:PASSWORD@craftgent-prod.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/craftgent?sslmode=require

# Note: ?sslmode=require enforces encryption
```

### Option B: Supabase (Easiest PostgreSQL)

Supabase is a managed PostgreSQL service with built-in security:

```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Copy connection string from Settings → Database

# In production .env
DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Option C: Google Cloud SQL

```bash
# Create instance
gcloud sql instances create craftgent-prod \
  --database-version=POSTGRES_16 \
  --region=us-central1 \
  --tier=db-f1-micro \
  --storage-type=PD_SSD \
  --storage-size=10GB \
  --backup-start-time=03:00

# Get connection
gcloud sql instances describe craftgent-prod

# Set DATABASE_URL with Cloud Proxy
DATABASE_URL=postgresql+asyncpg://craftgent:PASSWORD@/craftgent?host=/cloudsql/project:region:instance
```

### Option D: Self-Managed PostgreSQL (Not Recommended)

If you must manage PostgreSQL yourself:

```bash
# Production-grade setup
docker run -d \
  --name postgres-prod \
  --restart always \
  -v /data/postgres:/var/lib/postgresql/data \
  -e POSTGRES_DB=craftgent \
  -e POSTGRES_USER=craftgent_admin \
  -e POSTGRES_PASSWORD="$(openssl rand -base64 32)" \
  --network prod-network \
  --log-driver json-file \
  --log-opt max-size=100m \
  --log-opt max-file=10 \
  postgres:16-alpine

# IMPORTANT: Set up backups!
# IMPORTANT: Enable replication for HA!
```

### Database Security Checklist

- [x] Encryption at rest enabled
- [x] Encryption in transit enabled (SSL)
- [x] Backups automated (daily minimum)
- [x] Backup retention: 7+ days
- [x] Point-in-time recovery enabled
- [x] Connection pooling configured
- [x] IP whitelist/security group (only app server IPs)
- [x] Read replicas for scaling (optional)
- [x] Monitoring/alerts configured

---

## 3. SECRET_KEY Rotation (Production)

### Generate Strong SECRET_KEY

```bash
# Generate 32+ character random key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Output: something like: "ABC123xyz_-QWE456rty...full32chars"
```

### Store in Environment Variables

**NEVER commit secrets to git.** Use one of:

#### Option A: Docker Secrets (Swarm)

```bash
# Create secret
echo "ABC123xyz_-QWE456rty..." | docker secret create craftgent_secret_key -

# Reference in docker-compose
services:
  api:
    secrets:
      - craftgent_secret_key
    environment:
      SECRET_KEY_FILE: /run/secrets/craftgent_secret_key
```

#### Option B: Environment Variables (Any Container Platform)

```bash
# In CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
# Set as secret environment variable

# In docker-compose.prod.yml
services:
  api:
    environment:
      SECRET_KEY: ${SECRET_KEY}  # Set at runtime, never in code
```

#### Option C: AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name craftgent/secret-key \
  --secret-string "ABC123xyz_-QWE456rty..."

# In docker-compose
services:
  api:
    environment:
      SECRET_KEY: !aws-secretsmanager craftgent/secret-key
```

#### Option D: Vault (HashiCorp)

```bash
# Store secret
vault kv put secret/craftgent/secret-key value="ABC123xyz_-QWE456rty..."

# Read in application
curl -H "X-Vault-Token: $VAULT_TOKEN" \
  http://vault:8200/v1/secret/data/craftgent/secret-key
```

### Rotation Strategy

```bash
# DO NOT rotate in place (breaks existing tokens)
# Instead:

# 1. Generate NEW secret
NEW_SECRET="xyz..."

# 2. Add to config, restart app (app validates both old and new)
VALID_SECRETS=[OLD_SECRET, NEW_SECRET]

# 3. Wait for all refresh tokens to expire (7 days max)

# 4. Remove OLD_SECRET from config

# 5. Restart app
```

---

## 4. Monitoring Auth Failures

### Option A: Sentry (Recommended)

Sentry tracks errors and performance in production.

#### Setup

```bash
# 1. Create account at https://sentry.io
# 2. Create project → Python → FastAPI
# 3. Copy DSN (looks like: https://xxx@xxx.ingest.sentry.io/123456)
```

#### Install SDK

```bash
# In backend/requirements.txt
sentry-sdk[fastapi]==1.39.1
```

#### Configure in Backend

```python
# backend/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,  # 10% of transactions
        environment=settings.app_env,
        before_send=lambda event, hint: event if settings.is_production else None,
    )
```

#### Add to .env

```bash
SENTRY_DSN=https://key@sentry.io/123456
```

#### Monitor Auth Errors

In Sentry Dashboard:
1. Go to Issues
2. Filter by `transaction: /api/auth/register` or `/api/auth/login`
3. Set up alerts: email when error rate > 5%

### Option B: DataDog

```python
# backend/requirements.txt
ddtrace==1.18.0
```

```python
# backend/app/main.py
from ddtrace import tracer, patch_all
patch_all()

# Configure in settings
dd_trace_enabled = settings.is_production
```

### Option C: Structured Logging to CloudWatch/Stack Driver

```python
# backend/app/core/logging.py (already uses structlog)

# CloudWatch logs automatically parse JSON
# Set up alerts in CloudWatch:
# - MetricFilter: look for "login_failed" events
# - Alarm: trigger when count > 10 in 5 minutes
```

### Authentication-Specific Monitoring

Add alerts for:

```python
# backend/app/api/auth_router.py

# 1. High failed login rate
logger.warning(
    "login_failed_spike",
    username=username,
    reason="invalid_credentials",
    failed_attempts_last_5min=get_failed_attempts(username),
)

# 2. Brute force attempts
if get_failed_attempts(username) > 5:
    logger.error(
        "brute_force_detected",
        username=username,
        ip_address=request.client.host,
    )

# 3. Registration failures
if registration_failed:
    logger.warning(
        "registration_failed",
        username=username,
        reason=error_detail,
    )
```

#### CloudWatch Alarms

```bash
# Create metric alarm for failed logins
aws cloudwatch put-metric-alarm \
  --alarm-name craftgent-login-failures \
  --alarm-description "Alert if login failures spike" \
  --metric-name LoginFailures \
  --namespace Craftgent \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:region:account:email-topic
```

---

## 5. Complete Production docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL (via managed service, not container)
  # DATABASE_URL points to AWS RDS, Supabase, etc.
  
  # Redis (for task queue)
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

  # ChromaDB (vector store)
  chromadb:
    image: chromadb/chroma:0.6.3
    restart: always
    environment:
      CHROMA_SERVER_HOST: 0.0.0.0
      CHROMA_SERVER_HTTP_PORT: 8001
    volumes:
      - chroma_data:/chroma/chroma
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

  # FastAPI Backend
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    env_file: .env
    environment:
      # Production overrides
      APP_ENV: production
      DEBUG: "false"
      DATABASE_URL: ${DATABASE_URL}  # From managed PostgreSQL
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      CHROMA_HOST: chromadb
      CHROMA_PORT: 8001
      SECRET_KEY: ${SECRET_KEY}  # From secrets manager
      SENTRY_DSN: ${SENTRY_DSN}  # Optional
    depends_on:
      - redis
      - chromadb
    volumes:
      - ./backend:/app
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Celery Worker
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    env_file: .env
    environment:
      APP_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      CHROMA_HOST: chromadb
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - redis
      - chromadb
    volumes:
      - ./backend:/app
    command: celery -A app.tasks.celery_app worker --loglevel=info
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

  # Nginx Reverse Proxy with HTTPS
  nginx:
    image: nginx:1.25-alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/certs:ro
      - ./nginx/dhparam.pem:/etc/nginx/dhparam.pem:ro
    depends_on:
      - api
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

volumes:
  redis_data:
    driver: local
  chroma_data:
    driver: local
```

---

## 6. Production .env Template

```bash
# ═══════════════════════════════════════════════════════════════════════════
# CRAFTGENT PRODUCTION ENVIRONMENT
# ═══════════════════════════════════════════════════════════════════════════

# Application
APP_ENV=production
DEBUG=false
SECRET_KEY=<generated-via-secrets-manager>  # NEVER commit!

# Anthropic API
ANTHROPIC_API_KEY=<from-anthropic-console>

# Database (Managed PostgreSQL)
# Example: AWS RDS
DATABASE_URL=postgresql+asyncpg://craftgent_admin:PASSWORD@craftgent-prod.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/craftgent?sslmode=require

# Example: Supabase
# DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require

# Redis (with auth)
REDIS_URL=redis://:craftagent_redis_password@redis:6379/0
REDIS_PASSWORD=<strong-random-password>

# ChromaDB
CHROMA_HOST=chromadb
CHROMA_PORT=8001
CHROMA_COLLECTION=craftgent_memory

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_PER_MINUTE=20

# Frontend
VITE_API_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com  # Note: wss for HTTPS

# Monitoring (Optional)
SENTRY_DSN=https://key@xxx.ingest.sentry.io/123456
LOG_LEVEL=INFO

# Email (Optional, for password reset)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com

# Third-party APIs (Optional)
TAVILY_API_KEY=<if-using-web-search>
CODE_EXEC_TIMEOUT=10
```

---

## 7. Nginx Configuration for HTTPS

```nginx
# nginx/nginx.conf

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(),microphone=(),camera=()" always;

    # Diffie-Hellman for forward secrecy
    ssl_dhparam /etc/nginx/dhparam.pem;

    # HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates
        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # HSTS (tell browsers to always use HTTPS)
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Proxy to backend
        location / {
            proxy_pass http://api:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_buffering off;
            proxy_request_buffering off;
        }
    }
}
```

Generate Diffie-Hellman parameter:

```bash
openssl dhparam -out nginx/dhparam.pem 2048
```

---

## 8. Deployment Checklist

### Pre-Deployment

- [x] Generate strong SECRET_KEY
- [x] Set up managed PostgreSQL (AWS RDS / Supabase / etc.)
- [x] Provision HTTPS certificate (Let's Encrypt / AWS ACM / etc.)
- [x] Configure environment variables (in secrets manager)
- [x] Set up monitoring (Sentry / CloudWatch / etc.)
- [x] Test database backups
- [x] Create IAM roles (if using AWS)
- [x] Configure security groups / firewall
- [x] Set up CDN (optional: CloudFront / Cloudflare)

### Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Update environment
cp .env.prod .env  # Use production secrets

# 3. Build images
docker-compose -f docker-compose.prod.yml build

# 4. Run migrations
docker-compose -f docker-compose.prod.yml run --rm api \
  alembic upgrade head

# 5. Start services
docker-compose -f docker-compose.prod.yml up -d

# 6. Verify health
curl https://yourdomain.com/health
```

### Post-Deployment

- [x] Verify HTTPS working (https://yourdomain.com)
- [x] Check SSL certificate (https://www.ssllabs.com/ssltest/)
- [x] Verify auth endpoints working
- [x] Monitor logs for errors
- [x] Run smoke tests
- [x] Check monitoring/alerts

---

## 9. Disaster Recovery

### Database Backups

```bash
# AWS RDS automated backups (enabled by default)
# Retention: 7 days, Point-in-time recovery available

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier craftgent-prod \
  --db-snapshot-identifier craftgent-backup-$(date +%Y%m%d)

# List backups
aws rds describe-db-snapshots
```

### Restore from Backup

```bash
# Create new instance from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier craftgent-restored \
  --db-snapshot-identifier craftgent-backup-20240527

# Update DATABASE_URL in .env to point to restored instance
# Run migrations
docker-compose -f docker-compose.prod.yml run --rm api alembic upgrade head
```

### SSL Certificate Renewal

```bash
# Certbot auto-renews, but verify
sudo certbot renew --dry-run

# Or manually
sudo certbot renew

# Reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 10. Scaling Considerations

As you grow, consider:

### Database
- [x] Enable read replicas (AWS RDS / Supabase)
- [x] Use connection pooling (PgBouncer)
- [x] Implement caching layer (Redis)

### API
- [x] Run multiple API instances (load balanced)
- [x] Use container orchestration (Kubernetes)
- [x] Auto-scaling based on CPU/memory

### Frontend
- [x] Deploy to CDN (CloudFlare, CloudFront)
- [x] Enable caching (Cache-Control headers)
- [x] Minify CSS/JS (Vite already does this)

### Example: Kubernetes Deployment

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: craftgent-api
spec:
  replicas: 3  # 3 instances
  selector:
    matchLabels:
      app: craftgent-api
  template:
    metadata:
      labels:
        app: craftgent-api
    spec:
      containers:
      - name: api
        image: craftgent-api:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: craftgent-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: craftgent-secrets
              key: secret-key
        ports:
        - containerPort: 8000
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## Support

For questions:
- HTTPS: See Let's Encrypt docs (https://letsencrypt.org)
- PostgreSQL: See provider docs (AWS RDS, Supabase, Google Cloud SQL)
- Monitoring: See Sentry docs (https://docs.sentry.io)
- Nginx: See Nginx docs (https://nginx.org/en/docs/)

All set for production! 🚀

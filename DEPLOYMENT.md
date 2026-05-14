"""Production deployment checklist and guide."""

# Craftgent Production Deployment Checklist

## ✅ Pre-Deployment

- [ ] All tests passing: `make test`
- [ ] Linting passes: `make lint`
- [ ] Security report reviewed: `SECURITY_REPORT.md`
- [ ] Environment variables set in production
- [ ] Database backups enabled
- [ ] SSL/TLS certificates ready (Let's Encrypt)

## 🔐 Security Configuration

### Secrets Management
- [ ] Generate strong `SECRET_KEY`: 
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] Store in secure vault (Railway, Render, AWS Secrets Manager)
- [ ] Never commit `.env` to repository
- [ ] Rotate secrets quarterly

### HTTPS/TLS
- [ ] Valid SSL certificate (not self-signed)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] HSTS header enabled: `Strict-Transport-Security: max-age=31536000`
- [ ] Certificate auto-renewal configured (certbot)

### CORS Configuration
- [ ] Update `CORS_ORIGINS` to production domain only
- [ ] Remove development origins (localhost:5173)
- [ ] Whitelist-based approach (not wildcard "*")

### Rate Limiting
- [ ] Adjust `RATE_LIMIT_PER_MINUTE` based on expected load
- [ ] Per-user rate limits considered
- [ ] API key rate limiting planned for future public API

## 🗄️ Database

### PostgreSQL
- [ ] Connection pooling configured (pool_size=20)
- [ ] Connection timeout set
- [ ] Backups automated (daily)
- [ ] Backup retention: 30 days
- [ ] Point-in-time recovery enabled
- [ ] Read replicas considered for scaling

### Alembic Migrations
- [ ] All migrations tested locally
- [ ] Test migration rollback: `alembic downgrade -1`
- [ ] Production migration backed up before running
- [ ] Zero-downtime migrations considered

## 📦 Application

### Environment
- [ ] `APP_ENV=production` set
- [ ] `DEBUG=false` enforced
- [ ] Logging level: `INFO` or `WARNING`
- [ ] Sentry/error tracking configured

### Performance
- [ ] Gunicorn workers: 4-8 (based on CPU cores)
- [ ] Worker timeout: 60-120 seconds
- [ ] Max requests per worker: 1000
- [ ] Health checks working: `GET /api/health`

### Monitoring
- [ ] Application logs aggregated (Datadog, New Relic, Sentry)
- [ ] Performance metrics tracked (APM)
- [ ] Alerts configured:
  - High error rate (>5%)
  - Database connection pool exhaustion
  - API response time >1s
  - Memory usage >80%

## 🔄 Task Queue (Celery)

### Redis
- [ ] Redis persistence enabled (`save` configuration)
- [ ] Memory limit set: `maxmemory 512mb`
- [ ] Eviction policy: `allkeys-lru`
- [ ] Password required: `requirepass`
- [ ] Replication/HA considered

### Celery Workers
- [ ] Worker concurrency: 2-4 (based on workload)
- [ ] Task time limit: 15 minutes
- [ ] Dead letter queue monitoring
- [ ] Worker health checks configured

## 🧠 AI / LLM

### Anthropic API
- [ ] API key secured in secrets manager
- [ ] Rate limiting configured
- [ ] Usage monitoring enabled
- [ ] Cost limits set (if available)
- [ ] Fallback strategy planned

### ChromaDB
- [ ] Vector storage persistence enabled
- [ ] Memory limits configured
- [ ] Backup strategy for vectors
- [ ] Collection initialization verified

## 🌐 Frontend

### Build
- [ ] Production build tested: `npm run build`
- [ ] Bundle size optimized (<500KB main bundle)
- [ ] Source maps only in staging (not production)
- [ ] Service worker for offline support (optional)

### Deployment
- [ ] Build artifacts cached for faster deploys
- [ ] Content Security Policy (CSP) headers set
- [ ] CORS correctly configured for API
- [ ] Nginx gzip compression enabled
- [ ] Nginx caching headers optimized

## 📊 Infrastructure

### Docker
- [ ] Multi-stage builds for smaller images
- [ ] Security scanning enabled (Trivy, Docker Scout)
- [ ] Images signed and verified
- [ ] Private registry used (if applicable)

### Orchestration (if using Kubernetes)
- [ ] Persistent volumes for database/Redis data
- [ ] StatefulSets for databases
- [ ] Pod disruption budgets set
- [ ] Resource limits defined
- [ ] Health checks (liveness, readiness) configured
- [ ] Horizontal Pod Autoscaling (HPA) tested

## 📝 Logging & Monitoring

### Structured Logging
- [ ] All logs in JSON format (structlog)
- [ ] Sensitive data (tokens, passwords) never logged
- [ ] Log retention: 30-90 days
- [ ] Log search enabled

### Metrics
- [ ] Response times tracked
- [ ] Request volume monitored
- [ ] Database query performance
- [ ] Cache hit rates
- [ ] Error rates by endpoint

### Alerts
- [ ] Critical errors → PagerDuty/Slack
- [ ] Deployment notifications
- [ ] Uptime monitoring (external)

## 🔐 Access Control

### API Authentication
- [ ] JWT tokens properly validated on every request
- [ ] Token expiration enforced
- [ ] Refresh token rotation working
- [ ] No hardcoded credentials in code

### Database Access
- [ ] Database credentials rotated
- [ ] IP allowlist configured
- [ ] Read-only replica user for backups
- [ ] No direct public access to database

## 🧪 Testing

### Pre-Deployment
- [ ] Smoke tests passed on staging
- [ ] Load testing: 100+ concurrent users
- [ ] Security testing: penetration test completed
- [ ] Database failover tested
- [ ] Backup restoration tested

## 📋 Post-Deployment

- [ ] Deployment verified: health checks passing
- [ ] API endpoints responding
- [ ] Frontend loads and authenticates
- [ ] WebSocket connections working
- [ ] Agent responses returning
- [ ] Monitoring dashboards active
- [ ] Team notified

## 🚨 Rollback Plan

- [ ] Previous version tagged and available
- [ ] Database migration rollback procedure documented
- [ ] Rollback tested in staging
- [ ] Rollback can execute in <5 minutes
- [ ] Post-rollback verification steps clear

## 📅 Maintenance

- [ ] Weekly: Log rotation, cache cleanup
- [ ] Monthly: Dependency updates, security scanning
- [ ] Quarterly: Security audit, performance review
- [ ] Annually: Capacity planning, architecture review

## 🎯 Performance Targets

- API response time: <200ms p95
- Frontend load time: <2s
- Database query time: <50ms p95
- WebSocket message latency: <100ms
- Uptime: 99.5%+ (4.5 hours downtime/month)

# Nginx Configuration for CraftAgent

Reverse proxy configuration for production deployment.

## Files

- **craftgent.conf** - Main Nginx configuration
  - HTTPS/TLS setup
  - API proxy to FastAPI backend
  - Frontend static serving
  - Rate limiting
  - Security headers
  - Caching strategy

- **ssl/** - SSL/TLS certificates directory
  - cert.pem - SSL certificate
  - key.pem - SSL private key

## Configuration Highlights

### Security Features
- HSTS (HTTP Strict Transport Security)
- CSP headers
- XSS protection
- Clickjacking protection
- MIME type sniffing prevention

### Performance
- Gzip compression for responses
- Caching for static assets (30 days)
- Rate limiting (20 req/s for API, 50 req/s for general)
- Connection pooling to backends

### Routing
- `/api/*` → FastAPI backend (8000)
- `/*` → React frontend (3000)
- Health check endpoint
- Static asset caching

## SSL/TLS Setup

### Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone \
  -d craftgent.example.com \
  -d api.craftgent.example.com

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/craftgent.example.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/craftgent.example.com/privkey.pem ssl/key.pem
sudo chown 1000:1000 ssl/*
```

### Self-Signed (Testing)

```bash
# Generate self-signed certificate (valid 1 year)
openssl req -x509 -newkey rsa:4096 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=CraftAgent/CN=localhost"
```

## Customization

### Change Domain Name

Edit `craftgent.conf` line 4:
```nginx
server_name craftgent.example.com;
```

### Change Backend Port

Edit API location block:
```nginx
upstream backend {
    server backend:9000;  # Change from 8000 to 9000
}
```

### Adjust Rate Limiting

Edit at the top:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=50r/s;  # Increase from 20
```

### Add Custom Headers

Add in the server block:
```nginx
add_header X-Custom-Header "value" always;
```

## Testing

### Validate Configuration
```bash
docker run --rm -v $(pwd):/etc/nginx:ro nginx:alpine nginx -t
```

### Test Health Endpoint
```bash
curl -k https://localhost/api/health
```

### Check SSL Certificate
```bash
openssl x509 -in ssl/cert.pem -text -noout
```

## Troubleshooting

### 502 Bad Gateway
- Check backend is running: `docker-compose ps backend`
- Check backend health: `curl http://backend:8000/api/health`
- Check nginx logs: `docker-compose logs nginx`

### SSL Certificate Errors
- Verify certificate exists: `ls -la ssl/`
- Check certificate expiry: `openssl x509 -in ssl/cert.pem -noout -dates`
- Renew with: `sudo certbot renew --force-renewal`

### High Memory Usage
- Reduce worker processes in main nginx.conf
- Lower cache sizes
- Reduce client body buffer size

## References

- [Nginx Docs](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Mozilla SSL Configuration](https://ssl-config.mozilla.org/)

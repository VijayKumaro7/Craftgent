# 🔐 Security Guide

This document outlines security best practices for Craftgent development and deployment.

## Environment Variables

### ⚠️ CRITICAL: Never Commit Secrets

**NEVER commit these files:**
- `.env` (local environment variables)
- API keys, tokens, or passwords
- Private certificates or keys
- Database credentials
- Secret signing keys

**DO commit:**
- `.env.example` (template with placeholder values)
- Public configuration
- Documentation

### Setup Your Local Environment

1. **Create a local `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual values:**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit backend/.env with your:
   # - ANTHROPIC_API_KEY
   # - DATABASE_URL
   # - SECRET_KEY
   # - TAVILY_API_KEY (optional)
   ```

3. **Never push `.env` to git:**
   ```bash
   # .gitignore already has this, but verify:
   git status
   # Should NOT show .env files
   ```

## API Keys & Credentials

### Obtaining Required Keys

**Anthropic API Key:**
1. Go to https://console.anthropic.com
2. Create account and navigate to API keys
3. Generate new API key
4. Copy and paste into `.env.example` → rename to `.env`

**Tavily API Key (Optional, for web search):**
1. Go to https://tavily.com
2. Sign up and get API key
3. Add to `.env` if you want web search features

**PostgreSQL:**
- For development: Use default credentials or create user locally
- For production: Use managed PostgreSQL service with strong passwords

### Rotating Keys

When rotating keys in production:

1. **Generate new key/token**
2. **Update in deployment environment** (don't commit changes)
3. **Test thoroughly** in staging
4. **Switch to new key** in production
5. **Revoke old key** after verification
6. **Never keep old keys in code history**

## Password Security

### Backend Password Hashing

All passwords are hashed with bcrypt:
```python
# In auth/security.py
hashed_password = get_password_hash(password)  # bcrypt with salt
verify_password(plain, hashed)  # Constant-time comparison
```

**Requirements:**
- Minimum 8 characters (enforce in frontend)
- No password stored in plain text
- Bcrypt work factor: 12 (configurable)

## JWT Authentication

### Token Handling

- **Access tokens**: Short-lived (15 minutes)
- **Refresh tokens**: Longer-lived (7 days), stored securely
- **Signing key**: Must be 32+ random characters

### Generate a Secure Secret Key

```bash
# Option 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -base64 32

# Copy the output to SECRET_KEY in .env
```

### Token Rotation

- Refresh tokens automatically rotate on each refresh
- Old tokens are invalidated
- Stored securely (httpOnly cookies in production)

## Database Security

### Development
- Use local PostgreSQL with weak credentials (development only)
- Enable backup locally

### Production
- Use managed database service (AWS RDS, Supabase, etc.)
- Enable SSL/TLS connections
- Strong, random passwords (32+ characters)
- Regular automated backups
- Access restricted to application servers only
- Enable encryption at rest

## File Upload Security

### Current Protections
- File size limit: 10 MB per file
- Maximum 5 files per message
- Supported file types only (CSV, JSON, PDF, code)
- Files scanned for malicious content

### Best Practices
- Never execute uploaded files
- Validate file types on backend
- Scan with antivirus (optional, in production)
- Store in secure location outside web root
- Clean up old files regularly

## CORS & Cross-Origin Security

### Production Configuration

```env
# .env
FRONTEND_URL=https://your-domain.com
FRONTEND_PROD_URL=https://your-domain.com
```

### CORS Whitelist

Only allow requests from your frontend domain:
```python
# backend/app/core/config.py
ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
]
```

**DO NOT:** Use `"*"` in production

## HTTPS & TLS

### Development
- HTTP is fine for localhost development

### Production
- **MUST use HTTPS** (TLS 1.2 or higher)
- Use Let's Encrypt (free SSL certificates)
- Auto-renewal enabled
- Configured in Nginx

## Secrets Management in CI/CD

### GitHub Actions

Store secrets in GitHub repository settings:

1. Go to Settings → Secrets and Variables → Actions
2. Add secrets:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL_PROD`
   - `SECRET_KEY_PROD`
   - etc.

3. Use in workflows:
   ```yaml
   - name: Deploy
     env:
       ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
   ```

**Never:**
- Log secrets in CI output
- Commit secrets to repository
- Hardcode credentials in code

## Security Headers

### Nginx Configuration

Production Nginx includes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy` rules

See `nginx/craftgent-https.conf` for full configuration.

## Dependency Security

### Regular Updates

```bash
# Backend
cd backend
pip list --outdated
pip install --upgrade -r requirements.txt

# Frontend
cd frontend
npm outdated
npm update
```

### Security Audits

```bash
# Python
pip audit

# Node.js
npm audit
```

### Monitor for Vulnerabilities

- GitHub's Dependabot (automatic)
- npm audit (npm packages)
- pip audit (Python packages)

## Data Privacy

### User Data

- Session data stored encrypted in database
- Message history is isolated per user
- No sharing between users
- RAG memory scoped to user + agent + session

### Compliance

- GDPR: Users can request data deletion
- Data retention: Delete after inactivity (configure as needed)
- Encryption at rest (PostgreSQL with encryption)
- Encryption in transit (HTTPS + WSS)

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. **Email** vijaybgaddi07@gmail.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. Allow time for response before public disclosure

## Security Checklist for Deployment

- [ ] All `.env` files use strong, random values
- [ ] `SECRET_KEY` is 32+ random characters
- [ ] Database passwords are strong (32+ chars, random)
- [ ] HTTPS/TLS is enabled
- [ ] CORS is restricted to your domain
- [ ] Secrets are in environment, not in code
- [ ] `.env*` files are in `.gitignore`
- [ ] Database backups are automated
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are up to date and audited
- [ ] File upload validation is strict
- [ ] Rate limiting is enabled (optional)
- [ ] Monitoring and alerting is set up

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Anthropic API Security](https://docs.anthropic.com/en/docs/build-a-chatbot)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-syntax.html)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security](https://react.dev/community/acknowledgements)

---

**Questions?** Email vijaybgaddi07@gmail.com or open a [GitHub Discussion](https://github.com/vijaykumaro7/craftgent/discussions)

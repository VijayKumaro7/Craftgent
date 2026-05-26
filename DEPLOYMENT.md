# Craftgent Deployment Guide

## Netlify Deployment (Frontend)

### Prerequisites
- GitHub account with the Craftgent repository
- Netlify account (free tier available)
- Deployed backend API (FastAPI service)

### Step 1: Connect GitHub to Netlify

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select the Craftgent repository
5. Configure build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `18.19.0`

### Step 2: Set Required Environment Variables

**CRITICAL**: The frontend needs these environment variables to communicate with your backend API.

In Netlify UI: **Site settings** → **Build & deploy** → **Environment**

Add these variables:

#### VITE_API_URL
- **Value**: URL to your deployed backend API
- **Examples**:
  - Local development: `http://localhost:8000`
  - Heroku: `https://your-app.herokuapp.com`
  - Railway: `https://your-app.up.railway.app`
  - Custom domain: `https://api.yourdomain.com`

#### VITE_WS_URL
- **Value**: WebSocket URL to your backend
- **Examples**:
  - Local development: `ws://localhost:8000`
  - Heroku/Railway (HTTPS): `wss://your-app.herokuapp.com`
  - Custom domain (HTTPS): `wss://api.yourdomain.com`
- **Note**: Use `wss://` (secure WebSocket) for production HTTPS deployments

### Step 3: Deploy Backend

Choose one of these options:

#### Option A: Heroku (Simple)
```bash
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:premium-0
git push heroku main
```

#### Option B: Railway (Recommended)
1. Connect GitHub to [Railway](https://railway.app)
2. Create new project from repository
3. Add PostgreSQL and Redis plugins
4. Set environment variables from `.env.example`
5. Railway auto-deploys on git push

#### Option C: Docker (Self-hosted)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Step 4: Test Deployment

1. Open your Netlify site URL
2. Try logging in or using chat
3. Check browser console for errors (F12 → Console)
4. Verify API calls are reaching your backend

## Common Issues & Solutions

### ❌ "Cannot connect to API" / "Failed to fetch"

**Cause**: VITE_API_URL not set or incorrect

**Fix**:
1. In Netlify settings, verify `VITE_API_URL` is set
2. Test the URL in browser: `https://your-api-url/api/health`
3. Should return: `{"status": "ok"}`

### ❌ "WebSocket connection failed"

**Cause**: VITE_WS_URL not set or using wrong protocol

**Fix**:
- Use `wss://` for HTTPS (production)
- Use `ws://` for HTTP (development only)
- Verify URL matches your API domain

### ❌ "CORS error" in browser console

**Cause**: Backend not configured to accept requests from Netlify domain

**Fix**: Update backend `CORS_ORIGINS` environment variable:
```
CORS_ORIGINS=https://your-netlify-app.netlify.app,https://your-api.yourdomain.com
```

### ❌ "401 Unauthorized" errors

**Cause**: Auth tokens expired or not being sent

**Fix**:
1. Clear browser localStorage: `localStorage.clear()`
2. Refresh page and log in again
3. Check that refresh token is stored in httpOnly cookies

### ❌ Build fails on Netlify

**Cause**: Missing dependencies or Node version mismatch

**Fix**:
1. Check Netlify build logs for specific error
2. Verify `Node version` is set to `18.19.0` or higher
3. Run locally: `cd frontend && npm install && npm run build`
4. Commit package-lock.json to git

## Production Checklist

- [ ] Backend deployed and responding to health check
- [ ] VITE_API_URL set in Netlify
- [ ] VITE_WS_URL set in Netlify
- [ ] CORS_ORIGINS updated in backend
- [ ] SSL/HTTPS enabled (automatic on Netlify)
- [ ] Custom domain configured (optional)
- [ ] Environment variables (.env) never committed to git
- [ ] Database backups configured
- [ ] Error tracking enabled (Sentry)
- [ ] Rate limiting enabled on API

## Quick Reference

| Component | Status Check |
|-----------|--------------|
| **Frontend** | `GET https://your-netlify-app.netlify.app` |
| **Backend API** | `GET https://your-api-url/api/health` |
| **WebSocket** | Browser DevTools → Network → WS filter |
| **Database** | Connect via psql CLI |
| **Cache** | redis-cli ping |


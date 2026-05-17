# Netlify Deployment Setup Guide

This guide walks you through setting up Craftgent on Netlify with proper environment variables and configuration.

## 📋 Prerequisites

- Netlify account (free tier available at https://netlify.com)
- Your Craftgent GitHub repository connected to Netlify
- Production API URL and WebSocket URL (see Backend Deployment section)

---

## 🚀 Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify
4. Choose the **VijayKumaro7/Craftgent** repository
5. Configure build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: 18
6. Click **"Deploy site"**

---

## 🔐 Step 2: Configure Environment Variables

Environment variables tell Netlify where your API backend is located.

### Option A: Via Netlify UI (Recommended for Manual Setup)

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Click **"Edit variables"**
4. Add the following variables:

| Variable | Value | Example | Required |
|----------|-------|---------|----------|
| `VITE_API_URL` | Your production API URL | `https://api.yourdomain.com` | ✅ Yes |
| `VITE_WS_URL` | Your production WebSocket URL | `wss://api.yourdomain.com` | ✅ Yes |
| `NODE_VERSION` | Node version (18) | `18` | Optional (default: 18) |

**Important:**
- `VITE_API_URL`: Use `https://` (not `http://`)
- `VITE_WS_URL`: Use `wss://` (not `ws://`) for secure WebSocket over HTTPS

5. Click **"Save"**
6. Netlify will automatically trigger a new build with these variables

### Option B: Via netlify.toml (For Version Control)

If you want to commit default values to the repository, add to `netlify.toml`:

```toml
[build.environment]
NODE_VERSION = "18"
# Note: Sensitive values should NOT be in netlify.toml
# Use the Netlify UI or CLI for VITE_API_URL and VITE_WS_URL
```

---

## 🔗 Step 3: Configure API Backend

The frontend needs to know where your API is running.

### If Backend is on Same Domain

If your API is hosted at `https://yourdomain.com/api`:

```
VITE_API_URL = https://yourdomain.com
VITE_WS_URL = wss://yourdomain.com
```

Configure CORS in your backend to allow requests from Netlify domain.

### If Backend is on Different Domain

If your API is on a subdomain or different domain:

```
VITE_API_URL = https://api.yourdomain.com
VITE_WS_URL = wss://api.yourdomain.com
```

Your backend must have CORS configured:

```python
# Backend (FastAPI example)
CORS_ORIGINS = [
    "https://netlify-domain.netlify.app",  # Netlify site
    "https://yourdomain.com",               # Custom domain
    "https://www.yourdomain.com",           # WWW variant
]
```

---

## 📱 Step 4: Verify Frontend Build

After setting environment variables, Netlify should automatically rebuild.

### Check Build Status

1. Go to **Deploys** tab in Netlify dashboard
2. Look for your latest build
3. Wait for **"Published"** status (green checkmark)

### Build Logs

If the build fails:

1. Click on the failed deploy
2. Scroll to **"Build log"**
3. Look for error messages (TypeScript, ESLint, etc.)
4. Common issues:
   - Missing `VITE_API_URL` or `VITE_WS_URL` (build will still pass, but frontend won't connect to API)
   - TypeScript errors (should have been fixed by PR #30)
   - ESLint warnings (strict mode)

---

## 🔍 Step 5: Test Deployment

Once deployed:

1. Visit your Netlify site: `https://your-site.netlify.app`
2. Check **Browser Console** (F12) for errors
3. Open **Network tab** and verify API calls:
   - WebSocket connects to your `VITE_WS_URL`
   - API requests go to your `VITE_API_URL`
4. Try logging in to verify backend connection

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank page/404 | SPA routing not configured | Netlify auto-configures via `_redirects` |
| "Cannot connect to API" | Wrong `VITE_API_URL` | Check environment variables |
| CORS errors in console | Backend CORS not configured | Update backend `CORS_ORIGINS` |
| WebSocket connects to localhost | `VITE_WS_URL` not set | Set in Netlify environment |
| Build fails with TypeScript errors | Old build cached | Trigger rebuild: Site settings → "Trigger deploy" |

---

## 🔄 Step 6: Custom Domain (Optional)

To use your own domain instead of `*.netlify.app`:

1. Go to **Site settings** → **Domain management**
2. Click **"Add domain"**
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration steps
5. Update `VITE_API_URL` and `VITE_WS_URL` if needed
6. Netlify provides free SSL certificate automatically

---

## 📊 Environment Variables Reference

### Frontend Variables (Set in Netlify UI)

These are used during the build process and embedded in the frontend:

```
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

The `VITE_` prefix means these are exposed to the browser at build time.

### Backend Variables (Set on Backend Server)

Not needed on Netlify (but needed on your API server):

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

See `.env.example` for complete backend configuration.

---

## 🚀 Automatic Deployments

After setup, deployments happen automatically:

1. **On Push to `main` branch**: Netlify detects changes and rebuilds
2. **Build takes ~2-3 minutes**
3. **Automatic SSL renewal**: Netlify manages certificates
4. **Rollback**: Click previous deploy to revert

### Disable Auto-Deploy (if needed)

Site settings → **Build & deploy** → **Deploy contexts** → Uncheck "main"

---

## 🔧 Troubleshooting

### Rebuild Not Triggering

1. Check branch is set to `main`: Site settings → **Build & deploy** → **Deploy contexts**
2. Manual rebuild: Site settings → **Trigger deploy** → **Deploy site**
3. Clear cache: Site settings → **Danger zone** → **Clear cache and retry**

### Environment Variables Not Applied

1. Confirm variables are set: Site settings → **Build & deploy** → **Environment**
2. Trigger new build after changing variables
3. Check build log to see if variables are loaded: Search for "VITE_" in logs

### Bundle Size Too Large

If build warning shows bundle >500KB:

```bash
# Analyze locally
npm run build
npm install -g vite-plugin-visualizer
```

Current bundle: ~720KB (can be optimized with code splitting)

### Still Having Issues?

1. Check Netlify build logs for exact error
2. Verify environment variables are set correctly
3. Ensure backend API is running and accessible
4. Check backend CORS configuration
5. Open browser console for runtime errors

---

## ✅ Deployment Checklist

- [ ] Repository connected to Netlify
- [ ] Build command: `cd frontend && npm run build`
- [ ] Publish directory: `frontend/dist`
- [ ] Environment variables set:
  - [ ] `VITE_API_URL` = production API URL
  - [ ] `VITE_WS_URL` = production WebSocket URL (wss://)
- [ ] Site deployed and build succeeds
- [ ] Custom domain configured (if applicable)
- [ ] Frontend loads without errors
- [ ] API connection working (check Network tab)
- [ ] WebSocket connection working (check Console)
- [ ] Able to log in and use chat

---

## 📞 Support

- **Netlify Docs**: https://docs.netlify.com
- **Craftgent GitHub**: https://github.com/VijayKumaro7/Craftgent
- **Build Log Docs**: https://docs.netlify.com/monitor-sites/logs/

---

## 🔄 Next Steps

1. **Deploy Backend**: Set up API server with production database
2. **Update CORS**: Configure backend to accept requests from Netlify domain
3. **Monitor**: Set up Netlify analytics and error tracking
4. **Performance**: Optimize bundle size if needed
5. **Security**: Configure rate limiting and API authentication


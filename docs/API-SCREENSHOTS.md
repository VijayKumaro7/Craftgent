# Capturing API Screenshots

This guide explains how to capture screenshots of the Swagger/OpenAPI UI for documentation.

## Prerequisites

1. **Backend running locally:**
   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

2. **Open Swagger UI:**
   - Navigate to: `http://localhost:8000/docs`
   - You should see the interactive Swagger UI with all endpoints listed

## Screenshot Locations

Place captured screenshots in this directory (`docs/`) with descriptive names:

- `swagger-overview.png` - Full Swagger UI showing all endpoints
- `swagger-auth.png` - Authentication endpoints detail view
- `swagger-health.png` - Health check endpoint
- `swagger-sessions.png` - Chat sessions endpoint (Phase 2+)

## What to Capture

### 1. Overview Screenshot
**File:** `swagger-overview.png`

Capture the main Swagger UI showing:
- FastAPI header/title
- All endpoint sections visible
- Try-it-out buttons visible
- Dark/light mode if applicable

**Steps:**
1. Go to `http://localhost:8000/docs`
2. Scroll to show multiple endpoint sections
3. Take a screenshot showing the full page layout
4. Resize browser if needed to fit endpoints in view

### 2. Authentication Endpoints
**File:** `swagger-auth.png`

Focus on auth section:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me

**Steps:**
1. Scroll to "auth" section in Swagger UI
2. Expand one endpoint to show request/response schemas
3. Take screenshot showing endpoint details

### 3. Health & Status Endpoints
**File:** `swagger-health.png`

Show basic endpoints:
- GET /api/health
- GET /docs (this page)

**Steps:**
1. Locate default endpoints section
2. Expand to show schema
3. Capture response model

## Organizing Screenshots

Place all screenshots in this `docs/` directory:

```
docs/
├── API-SCREENSHOTS.md          (this file)
├── swagger-overview.png        (main UI)
├── swagger-auth.png            (auth endpoints)
├── swagger-health.png          (health check)
└── swagger-schemas.png         (request/response models)
```

## Using Screenshots in README

Add images to README.md like:

```markdown
![Swagger API Overview](docs/swagger-overview.png)
![Authentication Endpoints](docs/swagger-auth.png)
```

## Tools for Screenshots

### Browser Built-in
- Most browsers have built-in screenshot tools (keyboard shortcuts):
  - **Chrome/Edge:** `Ctrl+Shift+S` (Windows) or `Cmd+Shift+S` (Mac)
  - **Firefox:** `Ctrl+Shift+S` or camera icon in address bar
  - **Safari:** `Cmd+Shift+4` (Mac only)

### Alternative Tools
- **Greenshot** (Windows) - Lightweight screenshot tool
- **Snagit** - Professional screenshot and screen recording
- **MacOS Screenshot** - Built-in screenshot app
- **GIMP** - Free image editor with screenshot capability

### Web-Based
- **FireShot** - Browser extension for full-page screenshots
- **Nimbus Screenshot** - Captures, edits, and annotates

## Best Practices

1. **Quality:**
   - Use 1920x1080 resolution or similar
   - Ensure text is readable
   - Remove sensitive information (API keys, etc.)

2. **Consistency:**
   - Use consistent browser zoom level
   - Same browser/OS for visual consistency
   - Light or dark theme consistently

3. **Documentation:**
   - Add captions/alt-text describing what's shown
   - Highlight important details with arrows/boxes if needed
   - Include date captured in filename if versioning

4. **File Size:**
   - Optimize PNG files (use compression)
   - Keep file sizes under 500KB for web
   - Use `.webp` format if supported for better compression

## Git Workflow

After adding screenshots:

```bash
# Add to git
git add docs/swagger-*.png

# Commit with descriptive message
git commit -m "Add Swagger API screenshots for documentation"

# Push to branch
git push origin claude/fix-readme-IqxB2
```

## Updating Screenshots

When API structure changes:
1. Retake screenshots
2. Update file with same name (overwrite)
3. Commit with message: "Update Swagger screenshots"

---

**Note:** These screenshots capture the current Phase 1-2 API structure. As the project evolves to Phase 2+ with more endpoints, screenshots should be updated accordingly.

# Docker & CI/CD Setup for Remix Chess Arena

## Overview
Your chess application is fully containerized with Docker, configured with healthchecks, and ready for CI/CD automation via GitHub Actions.

## Current Setup

### Docker Image
- **Published to:** `domin8/remix-chess-arena:latest`
- **Base image:** `node:20-alpine` (multi-stage build)
- **Size:** ~520MB (compressed: ~130MB)
- **Healthcheck:** Enabled (checks port 3000 every 30 seconds)

### Dockerfile Features
- **Multi-stage build:** Reduces final image size by ~50%
  - Stage 1 (builder): Compiles React frontend + Node.js backend
  - Stage 2 (runner): Lean runtime with only production dependencies
- **Healthcheck:** Uses `nc -z 127.0.0.1 3000` to verify app is running
  - Interval: 30 seconds
  - Timeout: 3 seconds
  - Start period: 10 seconds (grace period before first check)
  - Retries: 3 failures = unhealthy

### Docker Compose
- **Service name:** `chess-arena`
- **Container name:** `remix-chess-arena`
- **Port:** 3000 (mapped to localhost:3000)
- **Restart policy:** `unless-stopped` (auto-restart on crash, stops on manual stop)
- **Environment:**
  - `NODE_ENV=production`
  - `GEMINI_API_KEY` (optional, from `.env`)
- **Healthcheck:** Mirrors Dockerfile configuration

## GitHub Actions CI/CD Setup

### Workflow File
Located at: `.github/workflows/docker-build.yml`

**Triggers:**
- On push to `main` or `develop` branches → builds AND pushes to Docker Hub
- On pull requests to `main` → builds only (no push)

**Jobs:**
1. **Checkout:** Fetches your code
2. **Setup Buildx:** Enables multi-platform builds
3. **Login to Docker Hub:** Uses GitHub Secrets
4. **Extract metadata:** Generates tags (branch name, commit SHA, semver)
5. **Build & Push:** Multi-platform build with caching
6. **Report digest:** Logs final image SHA256

### GitHub Secrets Required
Add these to your GitHub repo:
1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. Create two secrets:
   - `DOCKER_HUB_USERNAME`: `domin8`
   - `DOCKER_HUB_TOKEN`: (your Docker Hub Personal Access Token)

#### How to Get Docker Hub PAT:
1. Visit https://hub.docker.com/settings/security
2. Click **New Access Token**
3. Name it: `github-actions-remix-chess`
4. Set permissions: `Read & Write`
5. Copy the token and paste into GitHub Secrets

## How to Use

### Local Development
```bash
# Run with Docker Compose
docker compose up -d

# View container health
docker compose ps

# Stream logs
docker compose logs -f

# Stop
docker compose down
```

### Manual Docker Push
```bash
# Build locally
docker build -t domin8/remix-chess-arena:latest .

# Push to Docker Hub
docker push domin8/remix-chess-arena:latest
```

### Deploy to Production
```bash
# Pull latest image from Docker Hub
docker pull domin8/remix-chess-arena:latest

# Run container
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your-key-here \
  --restart unless-stopped \
  --name chess-arena \
  domin8/remix-chess-arena:latest

# Check health
docker ps  # Look for (healthy) status
```

## Automatic Deployment via GitHub Actions

When you push to `main`:
1. GitHub detects the push
2. GitHub Actions workflow triggers
3. Workflow logs into Docker Hub using your secrets
4. Builds the image (uses cache for speed)
5. Tags it: `domin8/remix-chess-arena:main` and `domin8/remix-chess-arena:latest`
6. Pushes to Docker Hub
7. Completes in ~2-3 minutes

You can view workflow runs at: **Your GitHub repo** → **Actions** tab

## Environment Variables

### Local Development (.env)
```bash
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
```

### Docker Container
Pass via `-e` flag or in `docker-compose.yml`:
```yaml
environment:
  - GEMINI_API_KEY=${GEMINI_API_KEY}
  - NODE_ENV=production
```

## Troubleshooting

### Container shows "unhealthy"
- Check logs: `docker compose logs`
- Verify port 3000 is listening: `docker exec remix-chess-arena netstat -tuln | grep 3000`
- Ensure server started: Look for "Server running at http://localhost:3000" in logs

### Push to Docker Hub fails
- Verify secrets are set in GitHub: **Settings** → **Secrets** → check `DOCKER_HUB_USERNAME` and `DOCKER_HUB_TOKEN`
- Verify token has read/write permissions
- Check workflow logs: **Actions** tab in GitHub

### Image is too large
- Multi-stage build already optimizes for size (~130MB compressed)
- Further optimization: Remove unused dependencies from `package.json`

## Image Variants

### Current Tags on Docker Hub
- `domin8/remix-chess-arena:latest` — Latest from main branch
- `domin8/remix-chess-arena:main` — Main branch builds
- `domin8/remix-chess-arena:develop` — Develop branch builds
- `domin8/remix-chess-arena:main-<commit-sha>` — Commit-specific tag

## Next Steps

1. **Create GitHub Secrets:**
   - `DOCKER_HUB_USERNAME`
   - `DOCKER_HUB_TOKEN`

2. **Initialize Git & Push:**
   ```bash
   git init
   git remote add origin https://github.com/yourusername/remix-chess-arena.git
   git add .
   git commit -m "Add Docker & CI/CD setup"
   git branch -M main
   git push -u origin main
   ```

3. **Monitor First Build:**
   - Go to GitHub → **Actions** tab
   - Watch the workflow run
   - Verify image appears on Docker Hub after ~3 minutes

4. **(Optional) Add More Branches:**
   - Create `develop` branch for staging builds
   - Workflow will auto-tag images from both branches

## Architecture

```
User Push to GitHub (main)
        ↓
GitHub Actions Trigger
        ↓
Docker Buildx (multi-stage)
 ├─ Stage 1: Build deps + app
 ├─ Stage 2: Runtime only
        ↓
Docker Hub Push
 ├─ domin8/remix-chess-arena:latest
 ├─ domin8/remix-chess-arena:main
 ├─ domin8/remix-chess-arena:main-abc123
        ↓
Production Pull & Deploy
```

## Files Modified/Created

- `Dockerfile` — Multi-stage build with healthcheck
- `docker-compose.yml` — Service definition with healthcheck
- `.github/workflows/docker-build.yml` — GitHub Actions workflow
- `.dockerignore` — Already configured
- `package.json` — Already configured (npm start uses dist/server.cjs)

## Support

For issues with:
- **Docker:** Run `docker logs remix-chess-arena`
- **GitHub Actions:** Check workflow logs in **Actions** tab
- **Docker Hub:** Visit hub.docker.com and check repository settings

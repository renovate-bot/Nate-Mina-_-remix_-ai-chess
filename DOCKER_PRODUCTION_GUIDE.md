# Remix Chess Arena - Docker & CI/CD Ready

## 🚀 Quick Start

### Run Locally with Docker Compose
```bash
docker compose up -d
curl http://localhost:3000
docker compose ps  # Should show (healthy)
```

### Run from Docker Hub
```bash
docker pull domin8/remix-chess-arena:latest
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY=your-key \
  --restart unless-stopped \
  domin8/remix-chess-arena:latest
```

---

## 📦 What's Included

### Docker Setup
- **Dockerfile:** Multi-stage build (Node.js 20 Alpine)
  - Stage 1: Compiles React + Node.js backend
  - Stage 2: Lean runtime (only prod dependencies)
  - Image size: ~520MB (130MB compressed)
  - Healthcheck: TCP port check every 30 seconds

- **docker-compose.yml:** Production-ready service
  - Port: 3000
  - Restart: unless-stopped
  - Healthcheck: Enabled
  - Environment: NODE_ENV, GEMINI_API_KEY support

- **.dockerignore:** Optimizes build context (excludes node_modules, dist, .git, etc.)

### CI/CD Pipeline
- **GitHub Actions Workflow:** `.github/workflows/docker-build.yml`
  - Triggers: Push to `main`/`develop`, PRs to `main`
  - Actions: Build → Tag → Push to Docker Hub
  - Image tags: `latest`, `main`, `main-<commit>`, semver
  - Build cache: GitHub Actions Cache for faster builds

---

## 📋 Setup Instructions

### 1. Initial Setup (Completed)
```bash
✓ Dockerfile created with healthcheck
✓ docker-compose.yml configured
✓ .github/workflows/docker-build.yml created
✓ Image pushed to domin8/remix-chess-arena:latest
✓ Healthcheck verified (status: healthy)
```

### 2. GitHub Setup (Required for CI/CD)

**Create GitHub Secrets:**
1. Go to: `https://github.com/<YOU>/remix-chess-arena/settings/secrets/actions`
2. Add secret: `DOCKER_HUB_USERNAME` = `domin8`
3. Add secret: `DOCKER_HUB_TOKEN` = (your PAT from https://hub.docker.com/settings/security)

**Get Docker Hub Token:**
1. Visit: https://hub.docker.com/settings/security
2. Click: "New Access Token"
3. Name: `github-actions-remix-chess`
4. Permissions: Read & Write
5. Copy and paste into GitHub Secrets

### 3. Deploy Code
```bash
git init
git add .
git commit -m "Add Docker & CI/CD"
git branch -M main
git remote add origin https://github.com/<YOU>/remix-chess-arena.git
git push -u origin main
```

### 4. Verify CI/CD
- Go to: GitHub **Actions** tab
- Wait for workflow to complete (~3 min)
- Verify new tags on: https://hub.docker.com/r/domin8/remix-chess-arena/tags

---

## 🏥 Healthcheck Details

**Configuration:**
- **Command:** `nc -z 127.0.0.1 3000`
- **Interval:** 30 seconds
- **Timeout:** 3 seconds
- **Start period:** 10 seconds (grace before first check)
- **Retries:** 3 consecutive failures = unhealthy

**View health status:**
```bash
docker compose ps
# Look for: (healthy), (starting), or (unhealthy)

# Detailed info:
docker inspect remix-chess-arena --format='{{json .State.Health}}'
```

**Troubleshoot unhealthy container:**
```bash
# Check logs
docker compose logs --tail 50

# Verify port is listening
docker exec remix-chess-arena netstat -tuln | grep 3000

# Manual healthcheck
docker exec remix-chess-arena nc -zv 127.0.0.1 3000
```

---

## 📊 Image Information

**Docker Hub Repository:**
- URL: https://hub.docker.com/r/domin8/remix-chess-arena
- Latest tag: `domin8/remix-chess-arena:latest`

**Image Tags:**
- `latest` — Latest from main branch
- `main` — Main branch builds
- `develop` — Develop branch builds (if branch exists)
- `main-<sha>` — Commit-specific tag
- `<version>` — Semantic version tags (if you create releases)

**Image Details:**
```bash
docker inspect domin8/remix-chess-arena:latest

# Key fields:
# .Config.Healthcheck — Healthcheck config
# .Config.Env — Environment variables (empty at build time)
# .ContainerConfig.Cmd — Startup command
```

---

## 🔄 GitHub Actions Workflow

**Triggers:**
- Push to `main` branch → Build + Tag + Push
- Push to `develop` branch → Build + Tag + Push (if workflow updated)
- Pull request to `main` → Build only (no push)

**Steps:**
1. Checkout code
2. Setup Docker Buildx (multi-platform build support)
3. Login to Docker Hub (using secrets)
4. Extract metadata (generate tags)
5. Build image (with layer caching)
6. Push to Docker Hub
7. Report digest SHA256

**View workflow logs:**
1. GitHub repo → **Actions** tab
2. Click workflow run
3. Click "build-and-push" job
4. View step output

---

## 🚢 Production Deployment

### Option 1: Docker Run (Simple)
```bash
docker pull domin8/remix-chess-arena:latest
docker run -d \
  --name chess-arena \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your-key \
  -e NODE_ENV=production \
  --restart unless-stopped \
  domin8/remix-chess-arena:latest
```

### Option 2: Docker Compose (Recommended)
```bash
docker compose up -d
```

### Option 3: Kubernetes (Advanced)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chess-arena
spec:
  replicas: 2
  selector:
    matchLabels:
      app: chess-arena
  template:
    metadata:
      labels:
        app: chess-arena
    spec:
      containers:
      - name: chess-arena
        image: domin8/remix-chess-arena:latest
        ports:
        - containerPort: 3000
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: chess-secrets
              key: gemini-api-key
        livenessProbe:
          tcpSocket:
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          tcpSocket:
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

---

## 📝 Environment Variables

**Development (.env):**
```bash
GEMINI_API_KEY=your-key
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

**Production (Docker):**
```bash
NODE_ENV=production
GEMINI_API_KEY=your-key
ALLOWED_ORIGINS=https://yourdomain.com
```

**Passing to Container:**
```bash
# Via -e flag
docker run -e GEMINI_API_KEY=key ...

# Via docker-compose.yml
environment:
  - GEMINI_API_KEY=${GEMINI_API_KEY}

# Via .env file
docker run --env-file .env ...
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
docker compose logs --tail 100
# Look for: "Server running at http://localhost:3000"
```

### Healthcheck failing
```bash
# Verify server is running
curl http://localhost:3000

# Check netcat connectivity
docker exec remix-chess-arena nc -zv 127.0.0.1 3000

# Verify port is listening
docker exec remix-chess-arena netstat -tuln | grep 3000
```

### GitHub Actions build fails
1. Check workflow logs: **Actions** → **Build and Push** → Step output
2. Verify secrets are set: **Settings** → **Secrets** → Check both secrets exist
3. Verify Docker Hub token has Read & Write permissions
4. Try manual Docker build locally:
   ```bash
   docker build -t domin8/remix-chess-arena:test .
   ```

### Image won't push to Docker Hub
```bash
# Verify Docker Hub login
docker login -u domin8

# Check secrets in GitHub
# Settings → Secrets → verify DOCKER_HUB_TOKEN and DOCKER_HUB_USERNAME

# Test credentials locally
docker pull domin8/remix-chess-arena:latest
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build with healthcheck |
| `docker-compose.yml` | Local development & deployment |
| `.dockerignore` | Build context optimization |
| `.github/workflows/docker-build.yml` | GitHub Actions CI/CD |
| `DOCKER_CI_CD_SETUP.md` | Detailed setup documentation |
| `SETUP_GITHUB_ACTIONS.sh` | Setup checklist script |

---

## ✅ Verification Checklist

- [ ] Docker image builds locally: `docker build -t test .`
- [ ] docker-compose starts: `docker compose up -d`
- [ ] Healthcheck shows healthy: `docker compose ps`
- [ ] App responds: `curl http://localhost:3000`
- [ ] GitHub repo created
- [ ] GitHub Secrets added (DOCKER_HUB_USERNAME, DOCKER_HUB_TOKEN)
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow runs successfully
- [ ] New image appears on Docker Hub
- [ ] Pull from Docker Hub works: `docker pull domin8/remix-chess-arena:latest`

---

## 🔗 Quick Links

- **Docker Hub:** https://hub.docker.com/r/domin8/remix-chess-arena
- **GitHub Actions:** `https://github.com/<YOU>/remix-chess-arena/actions`
- **Docker Hub Tokens:** https://hub.docker.com/settings/security
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **GitHub Actions Docs:** https://docs.github.com/actions

---

## 📄 License
Apache 2.0 (as marked in source files)

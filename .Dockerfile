# ==========================================
# STAGE 1: BUILD ENVIRONMENT
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency structures
COPY package*.json ./

# Install development & standard dependencies
RUN npm ci

# Copy application source code
COPY . .

# Compile application assets (generates static client files and express bundle in /dist)
RUN npm run build

# ==========================================
# STAGE 2: LEAN RUNTIME ENVIRONMENT
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency structures
COPY package*.json ./

# Install only production-needed dependencies to keep image footprint low
RUN npm ci --omit=dev

# Copy compiled files from local builder destination
COPY --from=builder /app/dist ./dist

# Standard documentation port exposing
EXPOSE 3000

# Executable launch process
CMD ["npm", "run", "start"]

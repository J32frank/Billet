# Multi-stage build for production deployment

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/billet-frontend

# Copy frontend package files
COPY billet-frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY billet-frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS backend-setup

WORKDIR /app/billet-backend

# Copy backend package files
COPY billet-backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY billet-backend/ ./

# Copy built frontend to backend public directory
COPY --from=frontend-build /app/billet-frontend/dist ./public

# Stage 3: Production image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S billet -u 1001

# Copy backend from setup stage
COPY --from=backend-setup --chown=billet:nodejs /app/billet-backend ./

# Switch to non-root user
USER billet

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

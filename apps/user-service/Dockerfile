# Multi-stage build for User Service
FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared dependencies first
COPY apps/shared ./apps/shared

# Copy User Service specific files
COPY apps/user-service/package.json ./
COPY apps/user-service/src ./src
COPY apps/user-service/tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.json nest-cli.json ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build the User Service
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and install production dependencies
COPY apps/user-service/package.json ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
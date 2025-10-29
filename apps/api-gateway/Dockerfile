# Multi-stage build for API Gateway
FROM node:18-alpine AS builder

WORKDIR /app

# Copy shared dependencies first
COPY apps/shared ./apps/shared

# Copy API Gateway specific files
COPY apps/api-gateway/package.json ./
COPY apps/api-gateway/src ./src
COPY apps/api-gateway/proto ./proto
COPY apps/api-gateway/tsconfig.app.json ./tsconfig.app.json
COPY tsconfig.json nest-cli.json ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build the API Gateway
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and install production dependencies
COPY apps/api-gateway/package.json ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy built application and proto files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proto ./proto

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Expose ports (HTTP and gRPC)
EXPOSE 3000 50051

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
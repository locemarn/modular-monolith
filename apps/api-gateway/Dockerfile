FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copiar arquivos raiz
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nest-cli.json ./
COPY tsconfig.json ./

# Copiar package.json de cada app
COPY apps/api-gateway/package.json ./apps/api-gateway/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY apps/api-gateway ./apps/api-gateway
COPY apps/shared ./apps/shared

# Build
RUN pnpm run build:api-gateway

# Production
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copiar build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/shared ./apps/shared

COPY --from=builder /app/apps/api-gateway/proto ./apps/api-gateway/proto

EXPOSE 3000 50051

CMD ["node", "dist/apps/api-gateway/main.js"]
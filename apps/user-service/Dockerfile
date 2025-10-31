FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nest-cli.json ./
COPY tsconfig.json ./

COPY apps/user-service/package.json ./apps/user-service/

RUN pnpm install --frozen-lockfile

COPY apps/user-service ./apps/user-service
COPY apps/shared ./apps/shared

RUN pnpm run build:user-service

FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/user-service/package.json ./apps/user-service/

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/shared ./apps/shared

EXPOSE 3001

CMD ["node", "dist/user-service/src/main.js"]
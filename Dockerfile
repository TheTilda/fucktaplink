# syntax=docker/dockerfile:1

FROM node:20-slim AS builder
WORKDIR /app

# deps for sharp
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "dist/server/entry.mjs"]





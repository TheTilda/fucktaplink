# syntax=docker/dockerfile:1

# ---------- build stage ----------
FROM node:20-slim AS builder
WORKDIR /app

# Install deps (sharp needs build-essential)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-slim AS runner
WORKDIR /app

# Create dirs for runtime data
RUN mkdir -p /app/data /app/public/uploads

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Install production deps only
RUN npm ci --omit=dev

ENV HOST=0.0.0.0
ENV PORT=3000
# Set your real token at runtime: -e ADMIN_TOKEN=...
ENV ADMIN_TOKEN=changeme

EXPOSE 3000

CMD ["node", "dist/server/entry.mjs"]


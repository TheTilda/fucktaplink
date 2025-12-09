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

# КРИТИЧЕСКИ ВАЖНО: HOST должен быть 0.0.0.0 для доступа извне контейнера
# Если не установлен, приложение будет недоступно из интернета
ENV HOST=0.0.0.0

# PORT может быть переопределен через переменные окружения платформы (например, TimewebCloud)
# По умолчанию используем 80, но платформа может предоставить свой PORT
ENV PORT=80

# Экспортируем порт 80 (TimewebCloud Apps будет использовать этот порт)
# Если платформа предоставляет другой PORT, он будет использован через переменную окружения
EXPOSE 80

# Запуск сервера
# Astro Node adapter в standalone режиме читает HOST и PORT из process.env
# Убедитесь, что эти переменные установлены в настройках приложения на платформе
CMD ["node", "dist/server/entry.mjs"]





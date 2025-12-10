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

# Копируем скрипты запуска
COPY start.sh /app/start.sh
COPY start.js /app/start.js
RUN chmod +x /app/start.sh /app/start.js

# КРИТИЧЕСКИ ВАЖНО: HOST должен быть 0.0.0.0 для доступа извне контейнера
# Если не установлен, приложение будет недоступно из интернета
ENV HOST=0.0.0.0

# Для TimewebCloud Apps используем внутренний порт контейнера (3000)
# Платформа сама проксирует трафик с портов 80/443 на этот внутренний порт
# Если EXPOSE не указан, платформа использует порт 8080 по умолчанию
ENV PORT=3000

# EXPOSE обязателен для TimewebCloud Apps
# Платформа использует этот порт для проксирования через свой Nginx
EXPOSE 3000

# Запуск сервера через Node.js wrapper для гарантированной установки переменных
# Используем Node.js скрипт вместо shell скрипта для лучшего контроля
CMD ["node", "/app/start.js"]






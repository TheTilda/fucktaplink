# Инструкция по деплою в Docker

## Быстрый старт

### 1. Подготовка переменных окружения

Создайте файл `.env` с необходимыми переменными:
```bash
cp env.example .env
# Отредактируйте .env и заполните все значения
```

### 2. Сборка Docker образа

```bash
docker build -t fucktaplink .
```

### 3. Запуск контейнера

```bash
docker run -d \
  --name fucktaplink \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  fucktaplink
```

## Деплой с docker-compose (рекомендуется)

В проекте уже есть готовый `docker-compose.yml` файл.

**Важно:** Если используете встроенную БД из docker-compose, обновите `DATABASE_URL` в `.env`:
```env
DATABASE_URL=mysql://fucktaplink:password@db:3306/fucktaplink
```

Запуск:
```bash
docker-compose up -d
```

Остановка:
```bash
docker-compose down
```

## Применение миграций БД

После первого запуска контейнера примените миграции:

```bash
# Войдите в контейнер
docker exec -it fucktaplink sh

# Или выполните команды напрямую
docker exec -it fucktaplink npm run db:generate
docker exec -it fucktaplink npm run db:push
```

## Проверка работы

Откройте в браузере: `http://localhost:3000`

## Полезные команды

```bash
# Просмотр логов
docker logs -f fucktaplink

# Остановка контейнера
docker stop fucktaplink

# Удаление контейнера
docker rm fucktaplink

# Пересборка образа
docker build -t fucktaplink . --no-cache

# Обновление контейнера
docker-compose up -d --build
```

## Production рекомендации

1. **Используйте docker-compose** для управления несколькими сервисами
2. **Настройте reverse proxy** (nginx/traefik) для HTTPS
3. **Используйте volumes** для персистентных данных БД
4. **Настройте логирование** через docker logs или внешние системы
5. **Используйте secrets** для чувствительных данных вместо .env файлов

## Переменные окружения

Убедитесь, что в `.env` указаны:
- `DATABASE_URL` - строка подключения к MySQL
- `SESSION_SECRET` - секретный ключ для сессий (минимум 16 символов)
- `S3_*` - настройки S3 хранилища
- `NODE_ENV=production`
- `PORT=3000` (или другой порт)

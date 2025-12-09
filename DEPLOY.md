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

**Для доступа с внешнего домена используйте порт 80:**
```bash
docker run -d \
  --name fucktaplink \
  -p 80:3000 \
  --env-file .env \
  --restart unless-stopped \
  fucktaplink
```

Или для локального тестирования на порту 3000:
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

### Настройка порта для внешнего доступа

Для доступа с внешнего домена нужно использовать порт 80. Есть два варианта:

#### Вариант 1: Прямое использование порта 80

В `.env` установите:
```env
PORT=80
```

И запустите:
```bash
docker-compose up -d
```

**Важно:** Для использования порта 80 нужны root права. Если запускаете без sudo, используйте вариант 2.

#### Вариант 2: Nginx Reverse Proxy (рекомендуется для production)

Создайте файл `nginx.conf`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Или используйте готовый docker-compose с nginx (см. раздел ниже).

### Запуск

```bash
docker-compose up -d
```

### Остановка

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

## Production деплой с Nginx

Для production используйте `docker-compose.prod.yml` с встроенным nginx:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Nginx будет слушать на порту 80 и проксировать запросы на приложение (порт 3000).

**Настройка домена:** В файле `nginx.conf` замените `server_name _;` на ваш домен:
```nginx
server_name your-domain.com www.your-domain.com;
```

## Production рекомендации

1. **Используйте docker-compose.prod.yml** с nginx для production
2. **Настройте HTTPS** через Let's Encrypt (certbot) или другой SSL сертификат
3. **Используйте volumes** для персистентных данных БД
4. **Настройте логирование** через docker logs или внешние системы
5. **Используйте secrets** для чувствительных данных вместо .env файлов
6. **Настройте firewall** - откройте только порты 80 и 443

## Переменные окружения

Убедитесь, что в `.env` указаны:
- `DATABASE_URL` - строка подключения к MySQL
- `SESSION_SECRET` - секретный ключ для сессий (минимум 16 символов)
- `S3_*` - настройки S3 хранилища
- `NODE_ENV=production`
- `PORT=3000` (или другой порт)

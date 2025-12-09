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
- **HOST=0.0.0.0** (КРИТИЧЕСКИ ВАЖНО для доступа из интернета!)
- `DATABASE_URL` - строка подключения к MySQL
- `SESSION_SECRET` - секретный ключ для сессий (минимум 16 символов)
- `S3_*` - настройки S3 хранилища
- `NODE_ENV=production`
- `PORT=3000` (внутренний порт контейнера)

## Деплой на TimewebCloud Apps

### Важные особенности TimewebCloud Apps

Согласно [официальной документации](https://timeweb.cloud/docs/apps/deploying-with-dockerfile):

1. **EXPOSE обязателен** - если не указан, платформа использует порт 8080 по умолчанию
2. **Платформа сама проксирует трафик** - TimewebCloud Apps использует свой Nginx для проксирования с портов 80/443 на внутренний порт контейнера
3. **Приложение должно слушать на внутреннем порту** - используйте порт 3000 внутри контейнера, платформа сама проксирует трафик

### Пошаговая инструкция

#### 1. Подготовка Dockerfile

Текущий `Dockerfile` уже настроен правильно:
- `HOST=0.0.0.0` - слушает на всех интерфейсах
- `PORT=3000` - внутренний порт контейнера
- `EXPOSE 3000` - обязателен для TimewebCloud Apps

#### 2. Настройка переменных окружения в панели TimewebCloud Apps

В настройках приложения на платформе **ОБЯЗАТЕЛЬНО** установите:

1. **HOST=0.0.0.0** (КРИТИЧЕСКИ ВАЖНО!)
   - Без этой переменной приложение будет недоступно из интернета
   - В Dockerfile уже установлено по умолчанию, но лучше указать явно в настройках

2. **PORT=3000** (опционально, но рекомендуется)
   - Должен соответствовать порту в EXPOSE
   - Если не указан, будет использовано значение из Dockerfile

3. **Остальные переменные окружения:**
   ```
   NODE_ENV=production
   DATABASE_URL=mysql://user:password@host:3306/database
   SESSION_SECRET=your-secret-key-min-16-chars
   S3_ENDPOINT=https://s3.example.com
   S3_REGION=ru-1
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   MAX_UPLOAD_MB=15
   ```

#### 3. Привязка домена

1. В панели TimewebCloud Apps перейдите в настройки приложения
2. Найдите раздел "Домены" или "Domain"
3. Добавьте домен `link.tglob.ru`
4. Настройте DNS записи:
   - Тип: A
   - Имя: @ (или link)
   - Значение: IP адрес сервера (89.23.98.62)
   - TTL: 3600

#### 4. Проверка работы

После деплоя проверьте:

1. **Логи приложения** - должны видеть что-то вроде:
   ```
   Server running on 0.0.0.0:3000
   ```
   Если видите `localhost` или `127.0.0.1` - переменная `HOST` не установлена правильно.

2. **Доступность по IP** - проверьте доступность по IP адресу:
   ```bash
   curl http://89.23.98.62
   ```

3. **Доступность по домену** - проверьте доступность по домену:
   ```bash
   curl http://link.tglob.ru
   ```

### Устранение проблем

#### Проблема: Приложение недоступно из интернета

**Решение:**
1. ✅ Убедитесь, что `HOST=0.0.0.0` установлен в настройках приложения
2. ✅ Проверьте логи - сервер должен слушать на `0.0.0.0:3000`
3. ✅ Убедитесь, что `EXPOSE 3000` указан в Dockerfile
4. ✅ Проверьте настройки firewall/security groups на платформе

#### Проблема: Домен не работает, но IP работает

**Решение:**
1. Проверьте DNS записи - должны указывать на IP сервера (89.23.98.62)
2. Проверьте привязку домена в панели TimewebCloud Apps
3. Подождите распространения DNS (может занять до 24 часов)
4. Проверьте настройки домена в панели - должен быть привязан к приложению

#### Проблема: Ошибка подключения к базе данных

**Решение:**
1. Убедитесь, что `DATABASE_URL` указан правильно
2. Проверьте доступность базы данных с сервера приложения
3. Если база данных на другом сервере, убедитесь что firewall разрешает подключения

### Альтернативный вариант: Dockerfile с nginx

Если нужен полный контроль над nginx, используйте `Dockerfile.nginx`:

```bash
# Переименуйте файл перед деплоем
mv Dockerfile Dockerfile.backup
mv Dockerfile.nginx Dockerfile
```

Этот вариант включает nginx внутри контейнера, но для TimewebCloud Apps рекомендуется использовать стандартный Dockerfile, так как платформа сама управляет nginx.

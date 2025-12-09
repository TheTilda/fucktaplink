# Сервис коротких ссылок с лендингами (Astro + MySQL + S3)

Веб-приложение для создания коротких ссылок с превью-лендингами. Включает аутентификацию, управление ссылками через дашборд и интеграцию с S3 для хранения изображений.

## Что внутри
- **Astro 5** (Server Mode с Node.js адаптером)
- **MySQL** база данных (Drizzle ORM)
- **Lucia Auth** для аутентификации
- **S3-совместимое хранилище** для загрузки изображений
- **TailwindCSS** для стилизации
- API endpoints для управления ссылками
- Дашборд для управления ссылками

## Требования
- Node.js 18+ 
- MySQL 8.0+
- S3-совместимое хранилище (или AWS S3)
- npm или yarn

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте файл с примерами и заполните значения:
```bash
cp env.example .env
```

> **Примечание:** Astro автоматически загружает переменные из `.env` файла. Для работы миграций базы данных также требуется `dotenv` (уже включён в зависимости).

Откройте `.env` и настройте следующие переменные:

```env
# Окружение
NODE_ENV=development
HOST=0.0.0.0
PORT=3000

# База данных MySQL
# Формат: mysql://user:password@host:port/database
DATABASE_URL=mysql://user:password@localhost:3306/fucktaplink

# Секретный ключ для сессий (минимум 16 символов)
# Сгенерируйте случайную строку: openssl rand -base64 32
SESSION_SECRET=your-secret-key-here-min-16-chars

# Опционально: токен администратора
ADMIN_TOKEN=optional-admin-token

# S3 хранилище
S3_ENDPOINT=https://s3.example.com
S3_REGION=ru-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Лимит загрузки файлов (в мегабайтах)
MAX_UPLOAD_MB=15
```

### 3. Создание базы данных

Создайте базу данных в MySQL:
```sql
CREATE DATABASE fucktaplink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Применение миграций

Сгенерируйте и примените миграции базы данных:
```bash
# Генерация миграций на основе schema.ts
npm run db:generate

# Применение миграций (выполнит SQL из папки drizzle/)
npm run db:push
```

Или используйте интерактивный режим (GUI для просмотра и редактирования БД):
```bash
npm run db:studio
```

### 5. Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:4321`

### 6. Создание первого пользователя

Откройте `/signup` в браузере и зарегистрируйте первого пользователя.

## Команды

```bash
# Разработка
npm run dev          # Запуск dev-сервера (http://localhost:4321)

# Сборка
npm run build        # Сборка production версии

# Просмотр production сборки
npm run preview      # Запуск preview собранного приложения

# База данных
npm run db:generate  # Генерация миграций
npm run db:push      # Применение миграций
npm run db:studio    # Открыть Drizzle Studio (GUI для БД)
```

## Production деплой

### Сборка
```bash
npm run build
```

### Запуск
После сборки в папке `dist/` будет создан Node.js сервер. Запустите его:
```bash
node dist/server/entry.mjs
```

Или используйте процесс-менеджер (PM2):
```bash
pm2 start dist/server/entry.mjs --name fucktaplink
```

### Docker
В проекте есть `Dockerfile` для контейнеризации:
```bash
docker build -t fucktaplink .
docker run -p 3000:3000 --env-file .env fucktaplink
```

## Структура проекта

```
src/
  assets/              # Статические изображения
  components/          # Astro компоненты (ProductPage, StatsCards, etc.)
  data/                # Данные продуктов (products.json, products.ts)
  layouts/             # Базовые layouts (BaseLayout)
  pages/
    api/               # API endpoints
      auth/            # Аутентификация (login, signup, logout, me)
      links.ts         # CRUD для ссылок
      upload-url.ts    # Генерация presigned URL для S3
    r/[id].ts          # Редирект по короткой ссылке
    dashboard.astro    # Дашборд управления ссылками
    login.astro        # Страница входа
    signup.astro       # Страница регистрации
    [slug].astro       # Лендинги продуктов
    index.astro        # Главная страница
  server/
    auth/              # Конфигурация Lucia Auth
    db/                # Drizzle ORM (schema, client)
    storage/           # S3 клиент
    utils/             # Утилиты (security, etc.)
  styles/              # Глобальные стили
```

## Использование

### Управление ссылками

1. Зарегистрируйтесь или войдите в систему (`/login`)
2. Перейдите в дашборд (`/dashboard`)
3. Создайте новую ссылку:
   - Введите название и URL
   - Выберите статус (активна/выключена)
   - Опционально загрузите обложку
4. Используйте короткую ссылку: `/r/{id}` для редиректа

### Редактирование ссылок

В дашборде нажмите "Редактировать" на любой ссылке, внесите изменения и сохраните.

### Статистика

В дашборде отображается количество кликов по каждой ссылке.

## API Endpoints

### Аутентификация
- `POST /api/auth/signup` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Получить текущего пользователя

### Ссылки
- `GET /api/links` - Список ссылок текущего пользователя
- `POST /api/links` - Создать новую ссылку
- `PUT /api/links` - Обновить ссылку
- `DELETE /api/links` - Удалить ссылку

### Загрузка файлов
- `POST /api/upload-url` - Получить presigned URL для загрузки в S3

### Редирект
- `GET /r/{id}` - Редирект по короткой ссылке (увеличивает счётчик кликов)

## Устранение проблем

### Ошибка подключения к базе данных
- Проверьте, что MySQL запущен
- Убедитесь, что `DATABASE_URL` указан правильно
- Проверьте права доступа пользователя БД

### Ошибка загрузки файлов
- Проверьте настройки S3 (endpoint, credentials, bucket)
- Убедитесь, что bucket существует и доступен
- Проверьте лимит `MAX_UPLOAD_MB`

### Ошибка аутентификации
- Убедитесь, что `SESSION_SECRET` установлен и имеет минимум 16 символов
- Проверьте, что таблицы `users` и `sessions` созданы в БД

## Дополнительная информация

### Лендинги продуктов
Проект также поддерживает статические лендинги продуктов из `src/data/products.json`. 
Добавьте товар в JSON и страница `/slug` будет автоматически сгенерирована.

### Безопасность
- Пароли хешируются с помощью Argon2
- Сессии управляются через Lucia Auth
- Все API endpoints требуют аутентификации (кроме публичных страниц)
- Загрузка файлов ограничена по размеру

## Лицензия
MIT

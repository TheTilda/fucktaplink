#!/bin/sh
# Скрипт запуска для гарантированной установки HOST и PORT

# КРИТИЧЕСКИ ВАЖНО: Явно устанавливаем HOST=0.0.0.0
# Astro Node adapter по умолчанию слушает на localhost, нужно явно указать 0.0.0.0
export HOST=0.0.0.0
export PORT=${PORT:-3000}

# Выводим для отладки
echo "========================================="
echo "Starting Astro server"
echo "HOST=$HOST (forced to 0.0.0.0)"
echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"
echo "========================================="

# Проверяем, что файл entry.mjs существует
if [ ! -f "dist/server/entry.mjs" ]; then
    echo "ERROR: dist/server/entry.mjs not found!"
    exit 1
fi

# Запускаем приложение с явной передачей переменных
# Используем env для гарантированной передачи переменных в процесс Node.js
exec env HOST=0.0.0.0 PORT=$PORT node dist/server/entry.mjs


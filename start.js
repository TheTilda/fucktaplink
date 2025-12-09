#!/usr/bin/env node
/**
 * Wrapper скрипт для запуска Astro сервера
 * 
 * ПРОБЛЕМА: Astro Node adapter в standalone режиме может игнорировать HOST
 * и всегда слушать на localhost, даже если HOST=0.0.0.0 установлен
 * 
 * РЕШЕНИЕ: Используем прямое указание переменных в команде запуска
 * через child_process с явной передачей env
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

// КРИТИЧЕСКИ ВАЖНО: Принудительно устанавливаем HOST=0.0.0.0
const env = {
  ...process.env,
  HOST: '0.0.0.0',
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

console.log('=========================================');
console.log('Starting Astro server via Node.js wrapper');
console.log(`HOST=${env.HOST} (FORCED to 0.0.0.0)`);
console.log(`PORT=${env.PORT}`);
console.log(`NODE_ENV=${env.NODE_ENV}`);
console.log('=========================================');

// Проверяем существование файла
if (!existsSync('./dist/server/entry.mjs')) {
  console.error('ERROR: dist/server/entry.mjs not found!');
  process.exit(1);
}

// Запускаем entry.mjs как дочерний процесс с явной передачей env
// Это гарантирует, что переменные будут доступны в процессе
const child = spawn('node', ['dist/server/entry.mjs'], {
  env: env,
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Перехватываем сигналы для корректного завершения
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

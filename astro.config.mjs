// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// Server output with Node adapter for API/auth
export default defineConfig({
	site: 'https://go.tglob.ru', // Production domain
	integrations: [tailwind({ applyBaseStyles: false })],
	output: 'server',
	adapter: node({ 
		mode: 'standalone',
		// В standalone режиме host и port читаются из process.env
		// Но для production явно указываем host через параметры
	}),
	// Конфигурация сервера
	// В standalone режиме переменные окружения HOST и PORT имеют приоритет
	// Но для надежности явно указываем host: '0.0.0.0' для production
	server: {
		host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : true,
		port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
	}
});

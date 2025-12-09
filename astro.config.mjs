// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// Server output with Node adapter for API/auth
export default defineConfig({
	site: 'https://link.tglob.ru', // Production domain
	integrations: [tailwind({ applyBaseStyles: false })],
	output: 'server',
	adapter: node({ 
		mode: 'standalone',
		// В standalone режиме host и port читаются из process.env
		// Но можно указать значения по умолчанию для dev режима
	}),
	// Конфигурация сервера (используется в dev режиме, в standalone читается из env)
	server: {
		host: true, // Слушать на всех интерфейсах (0.0.0.0)
		port: process.env.PORT ? parseInt(process.env.PORT) : 4321,
	}
});

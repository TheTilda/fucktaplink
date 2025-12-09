// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// Server output with Node adapter for API/auth
export default defineConfig({
	site: 'https://example.com', // replace per deployment
	integrations: [tailwind({ applyBaseStyles: false })],
	output: 'server',
	adapter: node({ mode: 'standalone' })
});

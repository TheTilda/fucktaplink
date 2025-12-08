// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Server output to allow dynamic data fetch (admin/API)
export default defineConfig({
	site: 'https://example.com', // replace per deployment
	integrations: [tailwind({ applyBaseStyles: false })],
	output: 'server'
});

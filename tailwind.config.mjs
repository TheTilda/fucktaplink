/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter var"', 'Inter', 'system-ui', 'sans-serif']
			},
			colors: {
				wb: '#A53DFF',
				ozon: '#3B6CFF',
				ym: '#F4C542'
			},
			borderRadius: {
				soft: '16px'
			}
		}
	},
	corePlugins: {
		container: false
	},
	future: {
		hoverOnlyWhenSupported: true
	}
};


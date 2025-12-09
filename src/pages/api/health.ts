import type { APIRoute } from 'astro';

/**
 * Health check endpoint для TimewebCloud Apps
 * Платформа использует этот endpoint для проверки работоспособности приложения
 */
export const GET: APIRoute = async () => {
	return new Response(
		JSON.stringify({
			status: 'ok',
			timestamp: new Date().toISOString(),
			service: 'fucktaplink'
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};

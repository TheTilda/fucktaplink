import type { APIRoute } from 'astro';

/**
 * Health check endpoint для TimewebCloud Apps
 * Платформа использует этот endpoint для проверки работоспособности приложения
 * Должен отвечать быстро (без задержек) и возвращать 200 OK
 */
export const GET: APIRoute = async () => {
	// Простой и быстрый ответ без лишних вычислений
	return new Response('OK', {
		status: 200,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};

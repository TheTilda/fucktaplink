import type { APIRoute } from 'astro';
import { getSessionFromRequest } from '../../../server/auth/lucia';

export const GET: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) {
		return new Response(JSON.stringify({ user: null }), { status: 200 });
	}
	return new Response(
		JSON.stringify({
			user: {
				id: user.id,
				email: user.email
			}
		}),
		{ status: 200 }
	);
};





import type { APIRoute } from 'astro';
import { auth } from '../../../server/auth/lucia';

export const POST: APIRoute = async ({ request }) => {
	const sessionId = auth.readSessionCookie(request.headers.get('cookie') ?? '')?.id;
	if (!sessionId) {
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}
	await auth.invalidateSession(sessionId);
	const blank = auth.createBlankSessionCookie();
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			'set-cookie': blank.serialize()
		}
	});
};





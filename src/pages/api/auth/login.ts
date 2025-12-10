import type { APIRoute } from 'astro';
import { z } from 'zod';
import { auth } from '../../../server/auth/lucia';
import { db } from '../../../server/db/client';
import { users } from '../../../server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '../../../server/utils/security';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { email, password } = schema.parse(body);

		const user = await db.query.users.findFirst({ where: eq(users.email, email) });
		if (!user) {
			return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
		}

		const ok = await verifyPassword(user.passwordHash, password);
		if (!ok) {
			return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 400 });
		}

		const session = await auth.createSession(user.id.toString(), {});
		const sessionCookie = auth.createSessionCookie(session.id);

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: {
				'set-cookie': sessionCookie.serialize()
			}
		});
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'Bad request' }), { status: 400 });
	}
};







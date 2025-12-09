import type { APIRoute } from 'astro';
import { z } from 'zod';
import { auth } from '../../../server/auth/lucia';
import { db } from '../../../server/db/client';
import { users } from '../../../server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../../server/utils/security';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { email, password } = schema.parse(body);

		// check exists
		const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
		if (existing) {
			return new Response(JSON.stringify({ message: 'User exists' }), { status: 400 });
		}

		const hash = await hashPassword(password);
		const result = await db.insert(users).values({ email, passwordHash: hash }).$returningId();
		const userId = result[0].id;

		const session = await auth.createSession(userId.toString(), {});
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





import { Lucia } from 'lucia';
import { DrizzleMySQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db/client';
import { users, sessions } from '../db/schema';
import { env } from '../env';
import { randomBytes } from 'crypto';

const adapter = new DrizzleMySQLAdapter(db, sessions, users);

export const auth = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: env.NODE_ENV === 'production'
		}
	},
	getUserAttributes: (data) => ({
		email: data.email
	})
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof auth;
		DatabaseUserAttributes: {
			email: string;
		};
	}
}

export type Auth = typeof auth;

export const generateSessionId = () => randomBytes(16).toString('hex');

// Хелпер для получения сессии из запроса (замена handleRequest)
export const getSessionFromRequest = async (request: Request) => {
	const cookieHeader = request.headers.get('cookie') ?? '';
	const sessionId = auth.readSessionCookie(cookieHeader);
	if (!sessionId) {
		return { session: null, user: null };
	}
	const { session, user } = await auth.validateSession(sessionId);
	return { session, user };
};


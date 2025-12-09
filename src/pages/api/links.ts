import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSessionFromRequest } from '../../server/auth/lucia';
import { db } from '../../server/db/client';
import { links } from '../../server/db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
	title: z.string().min(1).max(255),
	url: z.string().url(),
	status: z.enum(['active', 'inactive']).default('active'),
	image: z.string().url().optional()
});

const updateSchema = z.object({
	id: z.number(),
	title: z.string().min(1).max(255).optional(),
	url: z.string().url().optional(),
	status: z.enum(['active', 'inactive']).optional(),
	image: z.string().url().optional()
});

export const GET: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	const userId = Number(user.id);
	const data = await db.query.links.findMany({
		where: eq(links.userId, userId)
	});

	return new Response(JSON.stringify({ links: data }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	try {
		const body = await request.json();
		const parsed = createSchema.parse(body);
		const userId = Number(user.id);

		const result = await db
			.insert(links)
			.values({
				userId,
				title: parsed.title,
				url: parsed.url,
				status: parsed.status,
				imageUrl: parsed.image
			})
			.$returningId();

		return new Response(JSON.stringify({ id: result[0].id }), { status: 201 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'bad request' }), { status: 400 });
	}
};

export const PUT: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	try {
		const body = await request.json();
		const parsed = updateSchema.parse(body);
		const userId = Number(user.id);

		await db
			.update(links)
			.set({
				title: parsed.title,
				url: parsed.url,
				status: parsed.status,
				imageUrl: parsed.image
			})
			.where(and(eq(links.id, parsed.id), eq(links.userId, userId)));

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'bad request' }), { status: 400 });
	}
};

export const DELETE: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	try {
		const body = await request.json();
		const id = z.number().parse(body.id);
		const userId = Number(user.id);

		await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId)));

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'bad request' }), { status: 400 });
	}
};


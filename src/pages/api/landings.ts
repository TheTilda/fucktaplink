import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSessionFromRequest } from '../../server/auth/lucia';
import { db } from '../../server/db/client';
import { landings } from '../../server/db/schema';
import { eq, and } from 'drizzle-orm';

const createSchema = z.object({
	slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug может содержать только латинские буквы, цифры и дефисы'),
	title: z.string().min(1).max(255),
	description: z.string().min(1),
	imageUrl: z.string().url().optional(),
	rating: z.number().min(0).max(5).optional().default(0),
	reviews: z.number().int().min(0).optional().default(0),
	purchases: z.number().int().min(0).optional().default(0),
	linkWb: z.string().url().optional(),
	linkOzon: z.string().url().optional(),
	linkYm: z.string().url().optional(),
	layoutType: z.enum(['standard', 'compact']).default('standard'),
	status: z.enum(['active', 'inactive']).default('active')
});

const updateSchema = z.object({
	id: z.number(),
	slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug может содержать только латинские буквы, цифры и дефисы').optional(),
	title: z.string().min(1).max(255).optional(),
	description: z.string().min(1).optional(),
	imageUrl: z.string().url().optional(),
	rating: z.number().min(0).max(5).optional(),
	reviews: z.number().int().min(0).optional(),
	purchases: z.number().int().min(0).optional(),
	linkWb: z.string().url().optional(),
	linkOzon: z.string().url().optional(),
	linkYm: z.string().url().optional(),
	layoutType: z.enum(['standard', 'compact']).optional(),
	status: z.enum(['active', 'inactive']).optional()
});

export const GET: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	const userId = Number(user.id);
	const data = await db.query.landings.findMany({
		where: eq(landings.userId, userId),
		orderBy: (landings, { desc }) => [desc(landings.createdAt)]
	});

	return new Response(JSON.stringify({ landings: data }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	try {
		const body = await request.json();
		const parsed = createSchema.parse(body);
		const userId = Number(user.id);

		// Проверяем, что slug уникален
		const existing = await db.query.landings.findFirst({ where: eq(landings.slug, parsed.slug) });
		if (existing) {
			return new Response(JSON.stringify({ message: 'Landing with this slug already exists' }), { status: 400 });
		}

		const result = await db
			.insert(landings)
			.values({
				userId,
				slug: parsed.slug,
				title: parsed.title,
				description: parsed.description,
				imageUrl: parsed.imageUrl,
				rating: parsed.rating?.toString() || '0.0',
				reviews: parsed.reviews || 0,
				purchases: parsed.purchases || 0,
				linkWb: parsed.linkWb,
				linkOzon: parsed.linkOzon,
				linkYm: parsed.linkYm,
				layoutType: parsed.layoutType || 'standard',
				status: parsed.status
			})
			.$returningId();

		return new Response(JSON.stringify({ id: result[0].id }), { status: 201 });
	} catch (err) {
		console.error(err);
		if (err instanceof z.ZodError) {
			return new Response(JSON.stringify({ message: err.errors[0].message }), { status: 400 });
		}
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

		// Если обновляется slug, проверяем уникальность
		if (parsed.slug) {
			const existing = await db.query.landings.findFirst({
				where: eq(landings.slug, parsed.slug)
			});
			if (existing && existing.id !== parsed.id) {
				return new Response(JSON.stringify({ message: 'Landing with this slug already exists' }), { status: 400 });
			}
		}

		const updateData: any = {};
		if (parsed.slug !== undefined) updateData.slug = parsed.slug;
		if (parsed.title !== undefined) updateData.title = parsed.title;
		if (parsed.description !== undefined) updateData.description = parsed.description;
		if (parsed.imageUrl !== undefined) updateData.imageUrl = parsed.imageUrl;
		if (parsed.rating !== undefined) updateData.rating = parsed.rating.toString();
		if (parsed.reviews !== undefined) updateData.reviews = parsed.reviews;
		if (parsed.purchases !== undefined) updateData.purchases = parsed.purchases;
		if (parsed.linkWb !== undefined) updateData.linkWb = parsed.linkWb;
		if (parsed.linkOzon !== undefined) updateData.linkOzon = parsed.linkOzon;
		if (parsed.linkYm !== undefined) updateData.linkYm = parsed.linkYm;
		if (parsed.layoutType !== undefined) updateData.layoutType = parsed.layoutType;
		if (parsed.status !== undefined) updateData.status = parsed.status;

		await db
			.update(landings)
			.set(updateData)
			.where(and(eq(landings.id, parsed.id), eq(landings.userId, userId)));

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error(err);
		if (err instanceof z.ZodError) {
			return new Response(JSON.stringify({ message: err.errors[0].message }), { status: 400 });
		}
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

		await db.delete(landings).where(and(eq(landings.id, id), eq(landings.userId, userId)));

		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'bad request' }), { status: 400 });
	}
};


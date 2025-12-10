import type { APIRoute } from 'astro';
import { db } from '../../server/db/client';
import { links } from '../../server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
	const id = Number(params.id);
	if (!id) return new Response('Not found', { status: 404 });

	const link = await db.query.links.findFirst({ where: eq(links.id, id) });
	if (!link || link.status === 'inactive') return new Response('Not found', { status: 404 });

	// increment clicks (best-effort)
	void db
		.update(links)
		.set({ clicks: (link.clicks ?? 0) + 1 })
		.where(eq(links.id, id))
		.catch(() => {});

	return new Response(null, {
		status: 302,
		headers: { Location: link.url }
	});
};






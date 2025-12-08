import type { APIRoute } from 'astro';
import { deleteProduct, getProducts, upsertProduct } from '../../lib/productStore';

const requireAuth = (request: Request) => {
	const token = request.headers.get('x-admin-token');
	const expected = import.meta.env.ADMIN_TOKEN || 'changeme';
	return token && token === expected;
};

export const GET: APIRoute = async () => {
	const products = await getProducts();
	return new Response(JSON.stringify(products), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
};

export const PUT: APIRoute = async ({ request }) => {
	if (!requireAuth(request)) {
		return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });
	}
	const body = await request.json();
	if (!body?.slug || !body?.title) {
		return new Response(JSON.stringify({ message: 'slug and title required' }), { status: 400 });
	}
	const saved = await upsertProduct(body);
	return new Response(JSON.stringify(saved), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
};

export const DELETE: APIRoute = async ({ request }) => {
	if (!requireAuth(request)) {
		return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });
	}
	const body = await request.json();
	const slug = body?.slug;
	if (!slug) {
		return new Response(JSON.stringify({ message: 'slug required' }), { status: 400 });
	}
	await deleteProduct(slug);
	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};


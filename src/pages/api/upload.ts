import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const requireAuth = (request: Request) => {
	const token = request.headers.get('x-admin-token');
	const expected = import.meta.env.ADMIN_TOKEN || 'changeme';
	return token && token === expected;
};

export const POST: APIRoute = async ({ request }) => {
	if (!requireAuth(request)) {
		return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const dataUrl: string | undefined = body?.dataUrl;
	const fileName: string | undefined = body?.fileName;

	if (!dataUrl || !fileName) {
		return new Response(JSON.stringify({ message: 'fileName and dataUrl required' }), { status: 400 });
	}

	const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
	if (!match) {
		return new Response(JSON.stringify({ message: 'invalid dataUrl' }), { status: 400 });
	}

	const mime = match[1];
	const safeBase = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '');
	const buffer = Buffer.from(match[2], 'base64');

	const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
	await fs.mkdir(uploadsDir, { recursive: true });

	// Try to convert to optimized WebP (max 1200px)
	try {
		const webpName = `${safeBase}.webp`;
		const filePath = path.join(uploadsDir, webpName);
		const processed = await sharp(buffer)
			.resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 82 })
			.toBuffer();
		await fs.writeFile(filePath, processed);
		const url = `/uploads/${webpName}`;
		return new Response(JSON.stringify({ url }), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		});
	} catch (err) {
		console.error('WebP convert failed, saving original', err);
		const ext = mime.split('/')[1] || 'bin';
		const fallbackName = `${safeBase}.${ext}`;
		const filePath = path.join(uploadsDir, fallbackName);
		await fs.writeFile(filePath, buffer);
		const url = `/uploads/${fallbackName}`;
		return new Response(JSON.stringify({ url }), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		});
	}
};


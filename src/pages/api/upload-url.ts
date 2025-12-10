import type { APIRoute } from 'astro';
import { z } from 'zod';
import { getSessionFromRequest } from '../../server/auth/lucia';
import { env } from '../../server/env';
import { createPresignedUpload, generateObjectKey, publicUrl } from '../../server/storage/s3';
import { db } from '../../server/db/client';
import { images } from '../../server/db/schema';

const schema = z.object({
	filename: z.string().min(1),
	mime: z.string().min(1),
	size: z.number().max(env.MAX_UPLOAD_MB * 1024 * 1024)
});

export const POST: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	try {
		const body = await request.json();
		const parsed = schema.parse(body);
		const userId = Number(user.id);

		const key = generateObjectKey(userId, parsed.filename);
		const signedUrl = await createPresignedUpload(key, parsed.mime, parsed.size);
		const url = publicUrl(key);

		await db.insert(images).values({
			userId,
			key,
			url,
			mime: parsed.mime,
			size: parsed.size
		});

		return new Response(JSON.stringify({ uploadUrl: signedUrl, key, url }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'bad request' }), { status: 400 });
	}
};







import type { APIRoute } from 'astro';
import { getSessionFromRequest } from '../../server/auth/lucia';
import { env } from '../../server/env';
import { generateObjectKey, publicUrl, uploadToS3 } from '../../server/storage/s3';
import { db } from '../../server/db/client';
import { images } from '../../server/db/schema';

export const POST: APIRoute = async ({ request }) => {
	const { session, user } = await getSessionFromRequest(request);
	if (!session || !user) return new Response(JSON.stringify({ message: 'unauthorized' }), { status: 401 });

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		
		if (!file) {
			return new Response(JSON.stringify({ message: 'No file provided' }), { status: 400 });
		}

		// Проверка размера файла
		const maxSize = env.MAX_UPLOAD_MB * 1024 * 1024;
		if (file.size > maxSize) {
			return new Response(JSON.stringify({ message: `File too large. Max size: ${env.MAX_UPLOAD_MB}MB` }), { status: 400 });
		}

		const userId = Number(user.id);
		const key = generateObjectKey(userId, file.name);
		const url = publicUrl(key);

		// Загружаем файл в S3 через сервер
		const buffer = await file.arrayBuffer();
		await uploadToS3(key, Buffer.from(buffer), file.type, file.size);

		// Сохраняем информацию о файле в БД
		await db.insert(images).values({
			userId,
			key,
			url,
			mime: file.type || 'application/octet-stream',
			size: file.size
		});

		return new Response(JSON.stringify({ url, key }), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ message: 'bad request' }), { status: 400 });
	}
};

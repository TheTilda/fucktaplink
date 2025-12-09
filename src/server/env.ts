import { z } from 'zod';

// В standalone режиме Astro переменные окружения доступны только через process.env
// import.meta.env работает только в dev режиме и при сборке
// Для production используем process.env напрямую
const envVars = process.env;

const envSchema = z.object({
	NODE_ENV: z.string().default('development'),
	HOST: z.string().default('0.0.0.0'),
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	SESSION_SECRET: z.string().min(16, 'SESSION_SECRET is required'),
	ADMIN_TOKEN: z.string().optional(),
	S3_ENDPOINT: z.string().url(),
	S3_REGION: z.string().default('ru-1'),
	S3_BUCKET: z.string().min(1),
	S3_ACCESS_KEY: z.string().min(1),
	S3_SECRET_KEY: z.string().min(1),
	MAX_UPLOAD_MB: z.coerce.number().default(15)
});

export const env = envSchema.parse(envVars);





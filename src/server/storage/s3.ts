import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../env';
import crypto from 'crypto';

const s3 = new S3Client({
	region: env.S3_REGION,
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_KEY
	}
});

export const generateObjectKey = (userId: number, filename: string) => {
	const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
	const id = crypto.randomUUID();
	return `${userId}/${id}.${ext}`;
};

export const createPresignedUpload = async (key: string, contentType: string, size: number) => {
	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET,
		Key: key,
		ContentType: contentType,
		ContentLength: size
	});
	const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
	return url;
};

export const publicUrl = (key: string) => `${env.S3_ENDPOINT.replace(/\/$/, '')}/${env.S3_BUCKET}/${key}`;

export const uploadToS3 = async (key: string, buffer: Buffer, contentType: string, size: number) => {
	const command = new PutObjectCommand({
		Bucket: env.S3_BUCKET,
		Key: key,
		Body: buffer,
		ContentType: contentType,
		ContentLength: size
	});
	await s3.send(command);
};






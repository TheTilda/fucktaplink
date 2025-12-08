import fs from 'fs/promises';
import path from 'path';

export type Product = {
	slug: string;
	title: string;
	description: string;
	image: string; // публичный URL (например, /uploads/..., CDN или dataURL)
	rating: number;
	reviews: number;
	purchases: number;
	links: {
		wb?: string;
		ozon?: string;
		ym?: string;
	};
};

const storeDir = path.join(process.cwd(), 'data');
const storePath = path.join(storeDir, 'products.store.json');
const seedPath = path.join(process.cwd(), 'src', 'data', 'products.json');

async function ensureStore() {
	const exists = await fs
		.access(storePath)
		.then(() => true)
		.catch(() => false);
	if (!exists) {
		await fs.mkdir(storeDir, { recursive: true });
		const seed = await fs
			.readFile(seedPath, 'utf-8')
			.then((txt) => JSON.parse(txt))
			.catch(() => []);
		await fs.writeFile(storePath, JSON.stringify(seed, null, 2));
	}
}

async function readStore(): Promise<Product[]> {
	await ensureStore();
	const raw = await fs.readFile(storePath, 'utf-8');
	return JSON.parse(raw) as Product[];
}

async function writeStore(products: Product[]) {
	await fs.mkdir(storeDir, { recursive: true });
	await fs.writeFile(storePath, JSON.stringify(products, null, 2));
}

export async function getProducts(): Promise<Product[]> {
	return readStore();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
	const products = await readStore();
	return products.find((p) => p.slug === slug);
}

export async function upsertProduct(product: Product) {
	const products = await readStore();
	const next = products.some((p) => p.slug === product.slug)
		? products.map((p) => (p.slug === product.slug ? product : p))
		: [...products, product];
	await writeStore(next);
	return product;
}

export async function deleteProduct(slug: string) {
	const products = await readStore();
	const next = products.filter((p) => p.slug !== slug);
	await writeStore(next);
	return true;
}


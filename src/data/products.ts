import rawProducts from './products.json';

const assetMap = import.meta.glob('../assets/*', {
	eager: true,
	import: 'default'
});

type RawProduct = (typeof rawProducts)[number];

export type Product = RawProduct & {
	imageSrc: ImageMetadata;
};

const mapWithAssets = (): Product[] =>
	rawProducts.map((product) => {
		const imageSrc = assetMap[`../assets/${product.image}`] as ImageMetadata | undefined;

		if (!imageSrc) {
			throw new Error(`Image not found for product: ${product.slug}`);
		}

		return { ...product, imageSrc };
	});

export const products: Product[] = mapWithAssets();

export const getProductBySlug = (slug: string): Product | undefined =>
	products.find((item) => item.slug === slug);







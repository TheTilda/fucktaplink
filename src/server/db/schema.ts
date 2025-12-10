import { mysqlTable, serial, varchar, int, datetime, text, decimal, index, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable(
	'users',
	{
		id: serial('id').primaryKey(),
		email: varchar('email', { length: 255 }).notNull(),
		passwordHash: varchar('password_hash', { length: 255 }).notNull(),
		createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`)
	},
	(table) => ({
		emailIdx: uniqueIndex('users_email_idx').on(table.email)
	})
);

export const sessions = mysqlTable(
	'sessions',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		userId: int('user_id').notNull(),
		expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
		createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`)
	},
	(table) => ({
		userIdx: index('sessions_user_idx').on(table.userId)
	})
);

export const links = mysqlTable(
	'links',
	{
		id: serial('id').primaryKey(),
		userId: int('user_id').notNull(),
		title: varchar('title', { length: 255 }).notNull(),
		url: text('url').notNull(),
		imageUrl: varchar('image_url', { length: 1024 }),
		status: varchar('status', { length: 20 }).default('active'),
		clicks: int('clicks').notNull().default(0),
		createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
		updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
	},
	(table) => ({
		userIdx: index('links_user_idx').on(table.userId)
	})
);

export const images = mysqlTable(
	'images',
	{
		id: serial('id').primaryKey(),
		userId: int('user_id').notNull(),
		key: varchar('key', { length: 512 }).notNull(),
		url: varchar('url', { length: 1024 }).notNull(),
		mime: varchar('mime', { length: 128 }).notNull(),
		size: int('size').notNull(),
		width: int('width'),
		height: int('height'),
		createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`)
	},
	(table) => ({
		userIdx: index('images_user_idx').on(table.userId)
	})
);

export const landings = mysqlTable(
	'landings',
	{
		id: serial('id').primaryKey(),
		userId: int('user_id').notNull(),
		slug: varchar('slug', { length: 255 }).notNull(),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description').notNull(),
		imageUrl: varchar('image_url', { length: 1024 }),
		rating: decimal('rating', { precision: 3, scale: 1 }).default('0.0'),
		reviews: int('reviews').default(0),
		purchases: int('purchases').default(0),
		linkWb: text('link_wb'),
		linkOzon: text('link_ozon'),
		linkYm: text('link_ym'),
		layoutType: varchar('layout_type', { length: 20 }).default('standard'), // 'standard' или 'compact'
		status: varchar('status', { length: 20 }).default('active'),
		views: int('views').notNull().default(0),
		createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
		updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`)
	},
	(table) => ({
		userIdx: index('landings_user_idx').on(table.userId),
		slugIdx: uniqueIndex('landings_slug_idx').on(table.slug)
	})
);


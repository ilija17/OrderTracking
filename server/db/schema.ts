import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const vendors = sqliteTable('vendors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  item: text('item').notNull(),
  vendorId: integer('vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  unitPriceCents: integer('unit_price_cents'),
  orderNumber: text('order_number'),
  trackingNumber: text('tracking_number'),
  attachmentPath: text('attachment_path'),
  orderDate: text('order_date').notNull(),
  expectedDate: text('expected_date'),
  receivedDate: text('received_date'),
  status: text('status', { enum: ['pending', 'ordered', 'shipped', 'received', 'cancelled'] }).notNull().default('pending'),
  notes: text('notes'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

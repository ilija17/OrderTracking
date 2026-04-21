import { db } from '../../db'
import { orders, orderItems, vendors, users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const row = db
    .select({ order: orders, vendorName: vendors.name, creatorName: users.displayName })
    .from(orders)
    .leftJoin(vendors, eq(orders.vendorId, vendors.id))
    .leftJoin(users, eq(orders.createdBy, users.id))
    .where(eq(orders.id, id))
    .get()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const items = db.select().from(orderItems).where(eq(orderItems.orderId, id)).all()

  return {
    ...row.order,
    vendorName: row.vendorName ?? null,
    creatorName: row.creatorName ?? null,
    items,
  }
})

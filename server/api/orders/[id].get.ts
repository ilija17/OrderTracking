import { db } from '../../db'
import { orders, vendors, users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const row = db
    .select({ order: orders, vendor: vendors, creator: { displayName: users.displayName } })
    .from(orders)
    .leftJoin(vendors, eq(orders.vendorId, vendors.id))
    .leftJoin(users, eq(orders.createdBy, users.id))
    .where(eq(orders.id, id))
    .get()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return { ...row.order, vendorName: row.vendor?.name ?? null, creatorName: row.creator?.displayName ?? null }
})

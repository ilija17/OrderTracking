import { db } from '../../db'
import { orders, vendors, users } from '../../db/schema'
import { desc, eq, and, gte, lte, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions = []
  if (query.status && query.status !== 'all') {
    const statuses = (query.status as string).split(',')
    conditions.push(inArray(orders.status, statuses as any))
  }
  if (query.vendorId) {
    conditions.push(eq(orders.vendorId, parseInt(query.vendorId as string)))
  }
  if (query.dateFrom) {
    conditions.push(gte(orders.orderDate, query.dateFrom as string))
  }
  if (query.dateTo) {
    conditions.push(lte(orders.orderDate, query.dateTo as string))
  }

  const rows = db
    .select({
      order: orders,
      vendor: vendors,
      creator: { displayName: users.displayName },
    })
    .from(orders)
    .leftJoin(vendors, eq(orders.vendorId, vendors.id))
    .leftJoin(users, eq(orders.createdBy, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .all()

  return rows.map(({ order, vendor, creator }) => ({
    ...order,
    vendorName: vendor?.name ?? null,
    creatorName: creator?.displayName ?? null,
  }))
})

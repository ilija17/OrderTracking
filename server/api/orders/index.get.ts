import { db } from '../../db'
import { orders, orderItems, vendors, users } from '../../db/schema'
import { desc, eq, and, gte, lte, inArray, sql } from 'drizzle-orm'

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
      vendorName: vendors.name,
      creatorName: users.displayName,
      itemCount: sql<number>`(SELECT COUNT(*) FROM order_items WHERE order_items.order_id = ${orders.id})`,
      totalCents: sql<number>`(SELECT COALESCE(SUM(order_items.quantity * order_items.unit_price_cents), 0) FROM order_items WHERE order_items.order_id = ${orders.id} AND order_items.unit_price_cents IS NOT NULL)`,
    })
    .from(orders)
    .leftJoin(vendors, eq(orders.vendorId, vendors.id))
    .leftJoin(users, eq(orders.createdBy, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .all()

  return rows.map(({ order, vendorName, creatorName, itemCount, totalCents }) => ({
    ...order,
    vendorName: vendorName ?? null,
    creatorName: creatorName ?? null,
    itemCount,
    totalCents,
  }))
})

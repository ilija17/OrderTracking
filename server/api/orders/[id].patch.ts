import { z } from 'zod'
import { db } from '../../db'
import { orders, orderItems } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  unitPriceCents: z.number().int().nullable().optional(),
})

const schema = z.object({
  title: z.string().min(1).optional(),
  vendorId: z.number().int().nullable().optional(),
  items: z.array(itemSchema).min(1).optional(),
  orderNumber: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  orderDate: z.string().optional(),
  expectedDate: z.string().nullable().optional(),
  receivedDate: z.string().nullable().optional(),
  status: z.enum(['pending', 'ordered', 'shipped', 'received', 'cancelled']).optional(),
  notes: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const { items, ...orderData } = parsed.data

  const result = db.transaction((tx) => {
    const updated = tx.update(orders)
      .set({ ...orderData, updatedAt: sql`(datetime('now'))` })
      .where(eq(orders.id, id))
      .returning()
      .get()

    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    // Only replace items when items key is present
    if (items) {
      tx.delete(orderItems).where(eq(orderItems.orderId, id)).run()
      for (const item of items) {
        tx.insert(orderItems).values({
          orderId: id,
          name: item.name,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents ?? null,
        }).run()
      }
    }

    const updatedItems = tx.select().from(orderItems).where(eq(orderItems.orderId, id)).all()
    return { ...updated, items: updatedItems }
  })

  return result
})

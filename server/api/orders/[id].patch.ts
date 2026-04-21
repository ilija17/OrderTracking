import { z } from 'zod'
import { db } from '../../db'
import { orders } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'

const schema = z.object({
  item: z.string().min(1).optional(),
  vendorId: z.number().int().nullable().optional(),
  quantity: z.number().int().min(1).optional(),
  unitPriceCents: z.number().int().nullable().optional(),
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

  const result = db.update(orders)
    .set({ ...parsed.data, updatedAt: sql`(datetime('now'))` })
    .where(eq(orders.id, id))
    .returning()
    .get()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return result
})

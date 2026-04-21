import { z } from 'zod'
import { db } from '../../db'
import { orders, orderItems } from '../../db/schema'

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  unitPriceCents: z.number().int().nullable().optional(),
})

const schema = z.object({
  title: z.string().min(1),
  vendorId: z.number().int().nullable().optional(),
  items: z.array(itemSchema).min(1),
  orderNumber: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  orderDate: z.string().min(1),
  expectedDate: z.string().nullable().optional(),
  receivedDate: z.string().nullable().optional(),
  status: z.enum(['pending', 'ordered', 'shipped', 'received', 'cancelled']).default('pending'),
  notes: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const data = parsed.data

  const result = db.transaction((tx) => {
    const order = tx.insert(orders).values({
      title: data.title,
      vendorId: data.vendorId ?? null,
      orderNumber: data.orderNumber || null,
      trackingNumber: data.trackingNumber || null,
      orderDate: data.orderDate,
      expectedDate: data.expectedDate ?? null,
      receivedDate: data.receivedDate ?? null,
      status: data.status,
      notes: data.notes || null,
      createdBy: (session.user as any).id,
    }).returning().get()

    const items = data.items.map((item) =>
      tx.insert(orderItems).values({
        orderId: order.id,
        name: item.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents ?? null,
      }).returning().get()
    )

    return { ...order, items }
  })

  return result
})

import { db } from '../../../db'
import { orders } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { createReadStream, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const order = db.select().from(orders).where(eq(orders.id, id)).get()
  if (!order?.attachmentPath) throw createError({ statusCode: 404, statusMessage: 'No attachment' })

  const filePath = resolve('./data/uploads', order.attachmentPath)
  if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: 'File not found' })

  setHeader(event, 'Content-Disposition', `attachment; filename="${basename(order.attachmentPath)}"`)
  return sendStream(event, createReadStream(filePath))
})

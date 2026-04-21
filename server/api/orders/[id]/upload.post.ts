import { db } from '../../../db'
import { orders } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, extname } from 'node:path'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const order = db.select().from(orders).where(eq(orders.id, id)).get()
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const formData = await readMultipartFormData(event)
  if (!formData?.length) throw createError({ statusCode: 400, statusMessage: 'No file' })

  const file = formData[0]
  if (!file.filename || !file.data) throw createError({ statusCode: 400, statusMessage: 'No file' })

  const ext = extname(file.filename)
  const filename = `order-${id}-${Date.now()}${ext}`
  const uploadsDir = resolve('./data/uploads')
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })

  writeFileSync(resolve(uploadsDir, filename), file.data)

  db.update(orders)
    .set({ attachmentPath: filename, updatedAt: sql`(datetime('now'))` })
    .where(eq(orders.id, id))
    .run()

  return { filename }
})

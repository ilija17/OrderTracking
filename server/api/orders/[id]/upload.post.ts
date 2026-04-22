import { db } from '../../../db'
import { orders } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const order = db.select().from(orders).where(eq(orders.id, id)).get()
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const formData = await readMultipartFormData(event)
  if (!formData?.length) throw createError({ statusCode: 400, statusMessage: 'No file' })

  const file = formData[0]
  if (!file.filename || !file.data) throw createError({ statusCode: 400, statusMessage: 'No file' })

  const ext = extname(file.filename).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw createError({ statusCode: 400, statusMessage: 'Only PDF, JPEG, PNG, WebP, and GIF files are allowed' })
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Only PDF, JPEG, PNG, WebP, and GIF files are allowed' })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'File too large (max 10MB)' })
  }

  const filename = `order-${id}-${Date.now()}${ext}`
  const uploadsDir = resolve('./data/uploads')
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })

  // Delete old attachment if exists
  if (order.attachmentPath) {
    const oldPath = resolve(uploadsDir, order.attachmentPath)
    if (existsSync(oldPath)) unlinkSync(oldPath)
  }

  writeFileSync(resolve(uploadsDir, filename), file.data)

  db.update(orders)
    .set({ attachmentPath: filename, updatedAt: sql`(datetime('now'))` })
    .where(eq(orders.id, id))
    .run()

  return { filename }
})

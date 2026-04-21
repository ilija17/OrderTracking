import { db } from '../../../db'
import { vendors } from '../../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const vendor = db.select().from(vendors).where(eq(vendors.id, id)).get()
  if (!vendor) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const formData = await readMultipartFormData(event)
  if (!formData?.length) throw createError({ statusCode: 400, statusMessage: 'No file' })

  const file = formData[0]
  if (!file.filename || !file.data) throw createError({ statusCode: 400, statusMessage: 'No file' })

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Only JPEG, PNG, WebP, and GIF images are allowed' })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'File too large (max 5MB)' })
  }

  const ext = extname(file.filename).toLowerCase() || '.jpg'
  const filename = `vendor-${id}-${Date.now()}${ext}`
  const uploadsDir = resolve('./data/uploads')
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })

  // Delete old image if exists
  if (vendor.imagePath) {
    const oldPath = resolve(uploadsDir, vendor.imagePath)
    if (existsSync(oldPath)) unlinkSync(oldPath)
  }

  writeFileSync(resolve(uploadsDir, filename), file.data)

  db.update(vendors)
    .set({ imagePath: filename })
    .where(eq(vendors.id, id))
    .run()

  return { filename }
})

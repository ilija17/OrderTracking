import { db } from '../../../db'
import { vendors } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, extname } from 'node:path'

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const vendor = db.select().from(vendors).where(eq(vendors.id, id)).get()
  if (!vendor?.imagePath) throw createError({ statusCode: 404, statusMessage: 'No image' })

  const filePath = resolve('./data/uploads', vendor.imagePath)
  if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: 'File not found' })

  const ext = extname(vendor.imagePath).toLowerCase()
  const contentType = MIME_MAP[ext] || 'application/octet-stream'

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return readFileSync(filePath)
})

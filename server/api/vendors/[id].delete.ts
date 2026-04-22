import { db } from '../../db'
import { vendors } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { existsSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const deleted = db.delete(vendors).where(eq(vendors.id, id)).returning().get()
  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (deleted.imagePath) {
    const filePath = resolve('./data/uploads', deleted.imagePath)
    if (existsSync(filePath)) unlinkSync(filePath)
  }

  return { ok: true }
})

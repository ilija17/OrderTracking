import { db } from '../../db'
import { vendors } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  db.delete(vendors).where(eq(vendors.id, id)).run()
  return { ok: true }
})

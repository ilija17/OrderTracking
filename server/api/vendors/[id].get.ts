import { db } from '../../db'
import { vendors } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const vendor = db.select().from(vendors).where(eq(vendors.id, id)).get()
  if (!vendor) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return vendor
})

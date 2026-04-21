import { z } from 'zod'
import { db } from '../../db'
import { vendors } from '../../db/schema'
import { eq } from 'drizzle-orm'

const schema = z.object({
  name: z.string().min(1).optional(),
  contactPerson: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().optional().or(z.literal('')).nullable().optional(),
  website: z.string().nullable().optional(),
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

  const result = db.update(vendors).set(parsed.data).where(eq(vendors.id, id)).returning().get()
  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return result
})

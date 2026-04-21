import { z } from 'zod'
import { db } from '../../db'
import { vendors } from '../../db/schema'

const schema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().optional().or(z.literal('')).nullable().optional(),
  website: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const { name, contactPerson, phone, email, website, notes } = parsed.data
  const result = db.insert(vendors).values({
    name,
    contactPerson: contactPerson || null,
    phone: phone || null,
    email: email || null,
    website: website || null,
    notes: notes || null,
  }).returning().get()

  return result
})

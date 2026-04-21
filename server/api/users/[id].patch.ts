import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword } from '#imports'

const schema = z.object({
  displayName: z.string().min(1).optional(),
  role: z.enum(['admin', 'user']).optional(),
  password: z.string().min(4).optional(),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if ((session?.user as any)?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const updates: Record<string, any> = {}
  if (parsed.data.displayName) updates.displayName = parsed.data.displayName
  if (parsed.data.role) updates.role = parsed.data.role
  if (parsed.data.password) updates.passwordHash = await hashPassword(parsed.data.password)

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const result = db.update(users).set(updates).where(eq(users.id, id)).returning({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    role: users.role,
    createdAt: users.createdAt,
  }).get()

  if (!result) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return result
})

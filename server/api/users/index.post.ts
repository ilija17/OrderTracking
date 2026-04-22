import { z } from 'zod'
import { db } from '../../db'
import { users } from '../../db/schema'
import { hashPassword } from '#imports'

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  displayName: z.string().min(1),
  role: z.enum(['admin', 'user']).default('user'),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if ((session?.user as any)?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const hash = await hashPassword(parsed.data.password)

  try {
    const result = db.insert(users).values({
      username: parsed.data.username,
      passwordHash: hash,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
    }).returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      createdAt: users.createdAt,
    }).get()

    return result
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint')) {
      throw createError({ statusCode: 409, statusMessage: 'Username already exists' })
    }
    throw e
  }
})

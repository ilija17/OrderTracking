import { db } from '../../db'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if ((session?.user as any)?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const rows = db.select({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users).all()

  return rows
})

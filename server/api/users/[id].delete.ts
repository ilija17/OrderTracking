import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if ((session?.user as any)?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  // Prevent self-deletion
  if ((session.user as any).id === id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
  }

  const deleted = db.delete(users).where(eq(users.id, id)).returning().get()
  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  return { ok: true }
})

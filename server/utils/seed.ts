import { db } from '../db'
import { users } from '../db/schema'
import { hashPassword } from '#imports'

export async function seedAdminIfEmpty() {
  const existing = db.select().from(users).limit(1).all()
  if (existing.length > 0) return

  const password = 'admin'
  const hash = await hashPassword(password)
  db.insert(users).values({
    username: 'admin',
    passwordHash: hash,
    displayName: 'Administrator',
  }).run()

  console.log('[seed] Created default admin user: admin / admin — change the password after first login!')
}

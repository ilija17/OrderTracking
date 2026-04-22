import { db } from '../db'
import { users } from '../db/schema'
import { hashPassword } from '#imports'
import { randomBytes } from 'node:crypto'

export async function seedAdminIfEmpty() {
  const existing = db.select().from(users).limit(1).all()
  if (existing.length > 0) return

  const password = process.env.NUXT_INITIAL_ADMIN_PASSWORD || randomBytes(12).toString('hex')
  const hash = await hashPassword(password)
  db.insert(users).values({
    username: 'admin',
    passwordHash: hash,
    displayName: 'Administrator',
    role: 'admin',
  }).run()

  console.log(`[seed] Created default admin user — username: admin  password: ${password}`)
  console.log('[seed] Change the password after first login!')
}

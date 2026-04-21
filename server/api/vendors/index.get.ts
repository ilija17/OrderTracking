import { db } from '../../db'
import { vendors } from '../../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return db.select().from(vendors).orderBy(asc(vendors.name)).all()
})

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import * as schema from './schema'

const dataDir = resolve('./data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

const uploadsDir = resolve('./data/uploads')
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })

const sqlite = new Database(resolve('./data/data.db'))
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

const migrationsFolder = resolve('./server/db/migrations')
if (existsSync(migrationsFolder)) {
  migrate(db, { migrationsFolder })
}

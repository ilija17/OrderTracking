import { db } from '../../../db'
import { vendors } from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const id = parseInt(getRouterParam(event, 'id') ?? '')
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const vendor = db.select().from(vendors).where(eq(vendors.id, id)).get()
  if (!vendor) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (!vendor.website) throw createError({ statusCode: 400, statusMessage: 'Vendor has no website URL' })

  let domain: string
  try {
    domain = new URL(vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`).hostname
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid website URL' })
  }

  // Try Google favicon service first (returns high-quality PNGs)
  const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  let imageData: Buffer | null = null

  try {
    const res = await fetch(googleUrl)
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      // Google returns a default globe icon (~726 bytes) when no favicon found
      if (buf.length > 1000) {
        imageData = buf
      }
    }
  } catch {}

  // Fallback: try /favicon.ico directly
  if (!imageData) {
    const origin = `https://${domain}`
    try {
      const res = await fetch(`${origin}/favicon.ico`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      })
      if (res.ok && res.headers.get('content-type')?.includes('image')) {
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length > 100) imageData = buf
      }
    } catch {}
  }

  if (!imageData) {
    throw createError({ statusCode: 404, statusMessage: 'Could not find a favicon for this website' })
  }

  const uploadsDir = resolve('./data/uploads')
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true })

  // Delete old image
  if (vendor.imagePath) {
    const oldPath = resolve(uploadsDir, vendor.imagePath)
    if (existsSync(oldPath)) unlinkSync(oldPath)
  }

  const filename = `vendor-${id}-${Date.now()}.png`
  writeFileSync(resolve(uploadsDir, filename), imageData)

  db.update(vendors)
    .set({ imagePath: filename })
    .where(eq(vendors.id, id))
    .run()

  return { filename }
})

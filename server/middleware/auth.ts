export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Always allow auth endpoints and static/internal nuxt paths
  if (url.pathname.startsWith('/api/auth/')) return
  if (url.pathname === '/login') return
  if (url.pathname.startsWith('/_nuxt') || url.pathname.startsWith('/__nuxt')) return
  if (url.pathname.startsWith('/_nitro')) return

  const session = await getUserSession(event)
  if (!session?.user) {
    if (url.pathname.startsWith('/api/')) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    // Page routes: let the client handle redirect (useUserSession watcher in pages)
  }
})

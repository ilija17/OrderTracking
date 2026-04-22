import { seedAdminIfEmpty } from '../utils/seed'

const KNOWN_DEFAULT_SECRET = 'change-this-secret-at-least-32-chars-long'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const sessionPassword: string = (config.session as any)?.password ?? ''

  if (!sessionPassword || sessionPassword === KNOWN_DEFAULT_SECRET || sessionPassword.length < 32) {
    const msg = '[security] NUXT_SESSION_PASSWORD is not set or is using the default value. Set a strong random secret of at least 32 characters.'
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg)
    } else {
      console.warn(msg)
    }
  }

  await seedAdminIfEmpty()
})

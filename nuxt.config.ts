export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'change-this-secret-at-least-32-chars-long',
      cookie: {
        secure: false,
      },
    },
  },
})

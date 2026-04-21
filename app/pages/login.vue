<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { fetch: refreshSession } = useUserSession()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await refreshSession()
    router.push('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 eva:bg-eva-dark flex items-center justify-center transition-colors duration-200">
    <div class="bg-white eva:bg-eva-surface eva:border eva:border-eva-border rounded-lg shadow p-8 w-full max-w-sm">
      <h1 class="text-xl font-semibold mb-6 text-gray-900 eva:text-white">Order Tracker — Login</h1>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 eva:text-eva-muted mb-1">Username</label>
          <input v-model="username" type="text" required autocomplete="username"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                   eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 eva:text-eva-muted mb-1">Password</label>
          <input v-model="password" type="password" required autocomplete="current-password"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                   eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime" />
        </div>
        <p v-if="error" class="text-sm text-red-600 eva:text-red-400">{{ error }}</p>
        <button type="submit" :disabled="loading"
          class="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50
                 eva:bg-eva-lime eva:text-eva-dark eva:hover:brightness-110">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const { isEva, toggle } = useTheme()
const router = useRouter()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 eva:bg-eva-dark transition-colors duration-200">
    <nav class="bg-white border-b border-gray-200 eva:bg-[#151222] eva:border-eva-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14 items-center">
          <div class="flex items-center gap-6">
            <NuxtLink to="/"
              class="font-semibold text-gray-900 hover:text-blue-600 eva:text-eva-lime eva:hover:text-white">
              Order Tracker
            </NuxtLink>
            <NuxtLink to="/"
              class="text-sm text-gray-600 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white"
              active-class="text-blue-600 font-medium eva:text-eva-lime">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/vendors"
              class="text-sm text-gray-600 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white"
              active-class="text-blue-600 font-medium eva:text-eva-lime">
              Vendors
            </NuxtLink>
          </div>
          <div class="flex items-center gap-4">
            <button @click="toggle"
              :title="isEva ? 'Switch to default theme' : 'Switch to dark theme'"
              class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors
                     border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700
                     eva:border-eva-border eva:text-eva-muted eva:hover:border-eva-lime eva:hover:text-eva-lime">
              <span :class="isEva ? 'bg-eva-lime' : 'bg-gray-300'" class="w-2 h-2 rounded-full inline-block transition-colors" />
              {{ isEva ? 'Dark' : 'Default' }}
            </button>
            <template v-if="user">
              <span class="text-sm text-gray-600 eva:text-eva-muted">{{ user.displayName }}</span>
              <button @click="logout"
                class="text-sm text-gray-500 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white">
                Logout
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

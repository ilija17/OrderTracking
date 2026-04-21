<script setup lang="ts">
const { user, clear } = useUserSession()
const router = useRouter()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14 items-center">
          <div class="flex items-center gap-6">
            <NuxtLink to="/" class="font-semibold text-gray-900 hover:text-blue-600">Order Tracker</NuxtLink>
            <NuxtLink to="/" class="text-sm text-gray-600 hover:text-gray-900" active-class="text-blue-600 font-medium">Dashboard</NuxtLink>
            <NuxtLink to="/vendors" class="text-sm text-gray-600 hover:text-gray-900" active-class="text-blue-600 font-medium">Vendors</NuxtLink>
          </div>
          <div v-if="user" class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user.displayName }}</span>
            <button @click="logout" class="text-sm text-gray-500 hover:text-gray-900">Logout</button>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

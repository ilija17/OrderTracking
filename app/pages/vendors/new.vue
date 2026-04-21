<script setup lang="ts">
const router = useRouter()
const loading = ref(false)
const error = ref('')

async function handleSubmit(data: Record<string, any>) {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/vendors', { method: 'POST', body: data })
    router.push('/vendors')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to create vendor'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/vendors" class="text-sm text-gray-500 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white">← Back</NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900 eva:text-white">New Vendor</h1>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-6 eva:bg-eva-surface eva:border-eva-border">
      <VendorForm :loading="loading" :error="error" @submit="handleSubmit" />
    </div>
  </div>
</template>

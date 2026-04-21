<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const id = route.params.id

const { data: vendor, refresh } = await useFetch(`/api/vendors/${id}`)

const loading = ref(false)
const error = ref('')

async function handleSubmit(data: Record<string, any>) {
  loading.value = true
  error.value = ''
  try {
    await $fetch(`/api/vendors/${id}`, { method: 'PATCH', body: data })
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to save'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this vendor? Orders linked to it will lose the vendor reference.')) return
  await $fetch(`/api/vendors/${id}`, { method: 'DELETE' })
  router.push('/vendors')
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/vendors" class="text-sm text-gray-500 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white">← Back</NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900 eva:text-white">{{ vendor?.name ?? 'Vendor' }}</h1>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 p-6 eva:bg-eva-surface eva:border-eva-border">
      <VendorForm v-if="vendor" :initial="vendor" :loading="loading" :error="error" @submit="handleSubmit">
        <template #actions>
          <button type="button" @click="handleDelete"
            class="text-red-600 hover:text-red-800 eva:text-red-400 eva:hover:text-red-300 text-sm font-medium px-4 py-2">
            Delete
          </button>
        </template>
      </VendorForm>
    </div>
  </div>
</template>

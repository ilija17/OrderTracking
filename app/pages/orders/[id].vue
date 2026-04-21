<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const id = route.params.id

const { data: order, refresh } = await useFetch(`/api/orders/${id}`)

const loading = ref(false)
const error = ref('')
const uploadLoading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function handleSubmit(data: Record<string, any>) {
  loading.value = true
  error.value = ''
  try {
    await $fetch(`/api/orders/${id}`, { method: 'PATCH', body: data })
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to save'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this order?')) return
  await $fetch(`/api/orders/${id}`, { method: 'DELETE' })
  router.push('/')
}

async function uploadFile() {
  const file = fileInput.value?.files?.[0]
  if (!file) return
  uploadLoading.value = true
  uploadError.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    await $fetch(`/api/orders/${id}/upload`, { method: 'POST', body: formData })
    await refresh()
  } catch (e: any) {
    uploadError.value = e?.data?.statusMessage || 'Upload failed'
  } finally {
    uploadLoading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString()
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-900">← Back</NuxtLink>
      <h1 class="text-2xl font-semibold text-gray-900">Order #{{ id }}</h1>
      <StatusBadge v-if="order" :status="order.status" :expected-date="order.expectedDate" />
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <OrderForm v-if="order" :initial="order" :loading="loading" :error="error" @submit="handleSubmit">
        <template #actions>
          <button type="button" @click="handleDelete"
            class="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2">
            Delete
          </button>
        </template>
      </OrderForm>
    </div>

    <!-- Attachment -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Attachment</h2>
      <div v-if="order?.attachmentPath" class="mb-3">
        <a :href="`/api/orders/${id}/attachment`"
          class="text-blue-600 hover:underline text-sm">
          Download {{ order.attachmentPath }}
        </a>
      </div>
      <div v-else class="text-sm text-gray-400 mb-3">No attachment</div>
      <div class="flex items-center gap-3">
        <input ref="fileInput" type="file" class="text-sm" />
        <button @click="uploadFile" :disabled="uploadLoading"
          class="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1.5 text-sm disabled:opacity-50">
          {{ uploadLoading ? 'Uploading…' : 'Upload' }}
        </button>
      </div>
      <p v-if="uploadError" class="text-sm text-red-600 mt-2">{{ uploadError }}</p>
    </div>
  </div>
</template>

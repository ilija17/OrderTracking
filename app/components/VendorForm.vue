<script setup lang="ts">
const props = defineProps<{
  initial?: Record<string, any>
  loading?: boolean
  error?: string
}>()
const emit = defineEmits<{ submit: [data: Record<string, any>] }>()

const form = reactive({
  name: props.initial?.name ?? '',
  contactPerson: props.initial?.contactPerson ?? '',
  phone: props.initial?.phone ?? '',
  email: props.initial?.email ?? '',
  website: props.initial?.website ?? '',
  notes: props.initial?.notes ?? '',
})

const imageUploading = ref(false)
const imageError = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const imagePath = ref(props.initial?.imagePath ?? null)

async function uploadImage() {
  const file = imageInput.value?.files?.[0]
  if (!file || !props.initial?.id) return
  imageUploading.value = true
  imageError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ filename: string }>(`/api/vendors/${props.initial.id}/upload`, { method: 'POST', body: fd })
    imagePath.value = res.filename
  } catch (e: any) {
    imageError.value = e?.data?.statusMessage || 'Upload failed'
  } finally {
    imageUploading.value = false
    if (imageInput.value) imageInput.value.value = ''
  }
}

function submit() {
  emit('submit', { ...form })
}

const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime'
const label = 'block text-sm font-medium text-gray-700 eva:text-eva-muted mb-1'
</script>

<template>
  <form @submit.prevent="submit" class="space-y-5">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <!-- Image (only shown when editing) -->
      <div v-if="initial?.id" class="sm:col-span-2">
        <label :class="label">Image</label>
        <div class="flex items-center gap-4">
          <img v-if="imagePath" :src="`/api/vendors/${initial.id}/image?t=${Date.now()}`"
            class="w-16 h-16 rounded-lg object-cover border border-gray-200 eva:border-eva-border" alt="Vendor" />
          <div v-else class="w-16 h-16 rounded-lg bg-gray-100 eva:bg-eva-raised border border-gray-200 eva:border-eva-border flex items-center justify-center text-gray-400 eva:text-eva-muted text-xs">
            No image
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <input ref="imageInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                class="text-sm text-gray-600 eva:text-eva-muted" />
              <button type="button" @click="uploadImage" :disabled="imageUploading"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1.5 text-sm disabled:opacity-50
                       eva:bg-eva-raised eva:hover:bg-eva-border eva:text-eva-muted">
                {{ imageUploading ? 'Uploading…' : 'Upload' }}
              </button>
            </div>
            <p v-if="imageError" class="text-sm text-red-600 eva:text-red-400 mt-1">{{ imageError }}</p>
            <p class="text-xs text-gray-400 eva:text-eva-muted mt-1">JPEG, PNG, WebP, or GIF. Max 5MB.</p>
          </div>
        </div>
      </div>

      <div class="sm:col-span-2">
        <label :class="label">Name <span class="text-red-500">*</span></label>
        <input v-model="form.name" required type="text" :class="input" />
      </div>
      <div>
        <label :class="label">Contact Person</label>
        <input v-model="form.contactPerson" type="text" :class="input" />
      </div>
      <div>
        <label :class="label">Phone</label>
        <input v-model="form.phone" type="tel" :class="input" />
      </div>
      <div>
        <label :class="label">Email</label>
        <input v-model="form.email" type="email" :class="input" />
      </div>
      <div>
        <label :class="label">Website</label>
        <input v-model="form.website" type="url" :class="input" />
      </div>
      <div class="sm:col-span-2">
        <label :class="label">Notes</label>
        <textarea v-model="form.notes" rows="3" :class="input" />
      </div>
    </div>
    <p v-if="error" class="text-sm text-red-600 eva:text-red-400">{{ error }}</p>
    <div class="flex gap-3">
      <button type="submit" :disabled="loading"
        class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50
               eva:bg-eva-lime eva:text-eva-dark eva:hover:brightness-110">
        {{ loading ? 'Saving…' : 'Save' }}
      </button>
      <slot name="actions" />
    </div>
  </form>
</template>

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

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-5">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
        <input v-model="form.name" required type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
        <input v-model="form.contactPerson" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input v-model="form.phone" type="tel" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <input v-model="form.website" type="url" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea v-model="form.notes" rows="3" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <div class="flex gap-3">
      <button type="submit" :disabled="loading"
        class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {{ loading ? 'Saving…' : 'Save' }}
      </button>
      <slot name="actions" />
    </div>
  </form>
</template>

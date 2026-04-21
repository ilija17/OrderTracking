<script setup lang="ts">
const props = defineProps<{ modelValue: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const { data: vendors } = await useFetch('/api/vendors')

function onChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:modelValue', val ? parseInt(val) : null)
}
</script>

<template>
  <select :value="modelValue ?? ''" @change="onChange"
    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">— No vendor —</option>
    <option v-for="v in vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
  </select>
</template>

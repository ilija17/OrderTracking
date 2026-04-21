<script setup lang="ts">
const props = defineProps<{
  status: string
  expectedDate?: string | null
}>()

const today = new Date().toISOString().slice(0, 10)
const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)

const urgency = computed(() => {
  if (['received', 'cancelled'].includes(props.status)) return 'none'
  if (!props.expectedDate) return 'none'
  if (props.expectedDate < today) return 'overdue'
  if (props.expectedDate <= in3Days) return 'soon'
  return 'none'
})

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  ordered: 'Ordered',
  shipped: 'Shipped',
  received: 'Received',
  cancelled: 'Cancelled',
}

const statusClasses: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  ordered: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span :class="['inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', statusClasses[status] ?? 'bg-gray-100 text-gray-700']">
      {{ statusLabels[status] ?? status }}
    </span>
    <span v-if="urgency === 'overdue'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
      Overdue
    </span>
    <span v-else-if="urgency === 'soon'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
      Due soon
    </span>
  </span>
</template>

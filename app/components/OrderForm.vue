<script setup lang="ts">
const props = defineProps<{
  initial?: Record<string, any>
  loading?: boolean
  error?: string
}>()
const emit = defineEmits<{ submit: [data: Record<string, any>] }>()

const form = reactive({
  item: props.initial?.item ?? '',
  vendorId: props.initial?.vendorId ?? null,
  quantity: props.initial?.quantity ?? 1,
  unitPriceCents: props.initial?.unitPriceCents != null ? props.initial.unitPriceCents / 100 : '',
  orderNumber: props.initial?.orderNumber ?? '',
  trackingNumber: props.initial?.trackingNumber ?? '',
  orderDate: props.initial?.orderDate ?? new Date().toISOString().slice(0, 10),
  expectedDate: props.initial?.expectedDate ?? '',
  receivedDate: props.initial?.receivedDate ?? '',
  status: props.initial?.status ?? 'pending',
  notes: props.initial?.notes ?? '',
})

function submit() {
  emit('submit', {
    ...form,
    unitPriceCents: form.unitPriceCents !== '' ? Math.round(Number(form.unitPriceCents) * 100) : null,
    expectedDate: form.expectedDate || null,
    receivedDate: form.receivedDate || null,
    orderNumber: form.orderNumber || null,
    trackingNumber: form.trackingNumber || null,
    notes: form.notes || null,
  })
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-5">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Item <span class="text-red-500">*</span></label>
        <input v-model="form.item" required type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
        <VendorSelect v-model="form.vendorId" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select v-model="form.status" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="pending">Pending</option>
          <option value="ordered">Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input v-model.number="form.quantity" type="number" min="1" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price (€)</label>
        <input v-model="form.unitPriceCents" type="number" step="0.01" min="0" placeholder="0.00" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
        <input v-model="form.orderNumber" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
        <input v-model="form.trackingNumber" type="text" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Order Date <span class="text-red-500">*</span></label>
        <input v-model="form.orderDate" required type="date" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
        <input v-model="form.expectedDate" type="date" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
        <input v-model="form.receivedDate" type="date" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

<script setup lang="ts">
const props = defineProps<{
  initial?: Record<string, any>
  loading?: boolean
  error?: string
}>()
const emit = defineEmits<{ submit: [data: Record<string, any>] }>()

interface LineItem {
  name: string
  quantity: number
  unitPriceCents: string | number
}

const form = reactive({
  title: props.initial?.title ?? '',
  vendorId: props.initial?.vendorId ?? null,
  items: (props.initial?.items?.length
    ? props.initial.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents != null ? i.unitPriceCents / 100 : '',
      }))
    : [{ name: '', quantity: 1, unitPriceCents: '' }]) as LineItem[],
  orderNumber: props.initial?.orderNumber ?? '',
  trackingNumber: props.initial?.trackingNumber ?? '',
  orderDate: props.initial?.orderDate ?? new Date().toISOString().slice(0, 10),
  expectedDate: props.initial?.expectedDate ?? '',
  receivedDate: props.initial?.receivedDate ?? '',
  status: props.initial?.status ?? 'pending',
  notes: props.initial?.notes ?? '',
})

function addItem() {
  form.items.push({ name: '', quantity: 1, unitPriceCents: '' })
}

function removeItem(index: number) {
  if (form.items.length > 1) form.items.splice(index, 1)
}

function submit() {
  emit('submit', {
    title: form.title,
    vendorId: form.vendorId,
    items: form.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents !== '' ? Math.round(Number(i.unitPriceCents) * 100) : null,
    })),
    orderNumber: form.orderNumber || null,
    trackingNumber: form.trackingNumber || null,
    orderDate: form.orderDate,
    expectedDate: form.expectedDate || null,
    receivedDate: form.receivedDate || null,
    status: form.status,
    notes: form.notes || null,
  })
}

const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime'
const label = 'block text-sm font-medium text-gray-700 eva:text-eva-muted mb-1'
</script>

<template>
  <form @submit.prevent="submit" class="space-y-5">
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label :class="label">Title <span class="text-red-500">*</span></label>
        <input v-model="form.title" required type="text" placeholder="e.g. Office Equipment Q2" :class="input" />
      </div>
      <div>
        <label :class="label">Vendor</label>
        <VendorSelect v-model="form.vendorId" />
      </div>
      <div>
        <label :class="label">Status</label>
        <select v-model="form.status" :class="input">
          <option value="pending">Pending</option>
          <option value="ordered">Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Line Items -->
      <div class="sm:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <label :class="label" class="!mb-0">Items <span class="text-red-500">*</span></label>
          <button type="button" @click="addItem"
            class="text-sm text-blue-600 hover:text-blue-800 eva:text-eva-lime eva:hover:brightness-110 font-medium">
            + Add Item
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="(item, idx) in form.items" :key="idx"
            class="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200 eva:bg-eva-raised eva:border-eva-border">
            <div class="flex-1">
              <label class="block text-xs text-gray-500 eva:text-eva-muted mb-1">Name</label>
              <input v-model="item.name" required type="text" placeholder="e.g. Laptop" :class="input" />
            </div>
            <div class="w-24">
              <label class="block text-xs text-gray-500 eva:text-eva-muted mb-1">Qty</label>
              <input v-model.number="item.quantity" type="number" min="1" :class="input" />
            </div>
            <div class="w-32">
              <label class="block text-xs text-gray-500 eva:text-eva-muted mb-1">Unit Price (€)</label>
              <input v-model="item.unitPriceCents" type="number" step="0.01" min="0" placeholder="0.00" :class="input" />
            </div>
            <button v-if="form.items.length > 1" type="button" @click="removeItem(idx)"
              class="mt-5 text-red-500 hover:text-red-700 eva:text-red-400 eva:hover:text-red-300 text-lg font-bold leading-none">
              ×
            </button>
          </div>
        </div>
      </div>

      <div>
        <label :class="label">Order Number</label>
        <input v-model="form.orderNumber" type="text" :class="input" />
      </div>
      <div>
        <label :class="label">Tracking Number</label>
        <input v-model="form.trackingNumber" type="text" :class="input" />
      </div>
      <div>
        <label :class="label">Order Date <span class="text-red-500">*</span></label>
        <input v-model="form.orderDate" required type="date" :class="input" />
      </div>
      <div>
        <label :class="label">Expected Date</label>
        <input v-model="form.expectedDate" type="date" :class="input" />
      </div>
      <div>
        <label :class="label">Received Date</label>
        <input v-model="form.receivedDate" type="date" :class="input" />
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

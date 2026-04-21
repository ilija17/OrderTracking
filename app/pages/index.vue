<script setup lang="ts">
const { user } = useUserSession()
const router = useRouter()

watch(user, (u) => { if (!u) router.push('/login') }, { immediate: true })

const statusFilter = ref('active')
const vendorFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const { data: vendors } = await useFetch('/api/vendors')

const queryParams = computed(() => {
  const p: Record<string, string> = {}
  if (statusFilter.value === 'active') p.status = 'pending,ordered,shipped'
  else if (statusFilter.value !== 'all') p.status = statusFilter.value
  if (vendorFilter.value) p.vendorId = vendorFilter.value
  if (dateFrom.value) p.dateFrom = dateFrom.value
  if (dateTo.value) p.dateTo = dateTo.value
  return p
})

const { data: orders, refresh } = await useFetch('/api/orders', { query: queryParams })

const sortKey = ref<string>('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const sorted = computed(() => {
  if (!orders.value) return []
  return [...orders.value].sort((a: any, b: any) => {
    const av = a[sortKey.value] ?? ''
    const bv = b[sortKey.value] ?? ''
    return sortDir.value === 'asc' ? av < bv ? -1 : 1 : av > bv ? -1 : 1
  })
})

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString()
}

function formatPrice(cents: number | null) {
  if (cents == null) return '—'
  return (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 eva:text-white">Orders</h1>
      <NuxtLink to="/orders/new"
        class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700
               eva:bg-eva-lime eva:text-eva-dark eva:hover:brightness-110">
        + New Order
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end
                eva:bg-eva-surface eva:border-eva-border">
      <div>
        <label class="block text-xs font-medium text-gray-500 eva:text-eva-muted mb-1">Status</label>
        <select v-model="statusFilter"
          class="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime">
          <option value="all">All</option>
          <option value="active">Active (excl. received/cancelled)</option>
          <option value="pending">Pending</option>
          <option value="ordered">Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 eva:text-eva-muted mb-1">Vendor</label>
        <select v-model="vendorFilter"
          class="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime">
          <option value="">All vendors</option>
          <option v-for="v in vendors" :key="v.id" :value="String(v.id)">{{ v.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 eva:text-eva-muted mb-1">Order date from</label>
        <input v-model="dateFrom" type="date"
          class="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime" />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 eva:text-eva-muted mb-1">Order date to</label>
        <input v-model="dateTo" type="date"
          class="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime" />
      </div>
      <button @click="statusFilter='active'; vendorFilter=''; dateFrom=''; dateTo=''"
        class="text-sm text-gray-500 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white self-end pb-0.5">
        Reset
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden eva:bg-eva-surface eva:border-eva-border">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 eva:divide-eva-border text-sm">
          <thead class="bg-gray-50 eva:bg-eva-raised">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted cursor-pointer hover:text-gray-900 eva:hover:text-white whitespace-nowrap" @click="toggleSort('title')">
                Title {{ sortKey === 'title' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted cursor-pointer hover:text-gray-900 eva:hover:text-white whitespace-nowrap" @click="toggleSort('status')">
                Status {{ sortKey === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted whitespace-nowrap">Vendor</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted cursor-pointer hover:text-gray-900 eva:hover:text-white whitespace-nowrap" @click="toggleSort('orderDate')">
                Order Date {{ sortKey === 'orderDate' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted cursor-pointer hover:text-gray-900 eva:hover:text-white whitespace-nowrap" @click="toggleSort('expectedDate')">
                Expected {{ sortKey === 'expectedDate' ? (sortDir === 'asc' ? '↑' : '↓') : '' }}
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted whitespace-nowrap">Items</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted whitespace-nowrap">Total</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted whitespace-nowrap">By</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 eva:divide-eva-border">
            <tr v-if="!sorted.length">
              <td colspan="9" class="px-4 py-8 text-center text-gray-400 eva:text-eva-muted">No orders found</td>
            </tr>
            <tr v-for="order in sorted" :key="order.id"
              class="hover:bg-gray-50 eva:hover:bg-eva-raised">
              <td class="px-4 py-3 font-medium text-gray-900 eva:text-white">
                <NuxtLink :to="`/orders/${order.id}`"
                  class="hover:text-blue-600 eva:hover:text-eva-lime">
                  {{ order.title }}
                </NuxtLink>
                <span v-if="order.orderNumber" class="ml-2 text-xs text-gray-400 eva:text-eva-muted">#{{ order.orderNumber }}</span>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :status="order.status" :expected-date="order.expectedDate" />
              </td>
              <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">{{ order.vendorName ?? '—' }}</td>
              <td class="px-4 py-3 text-gray-600 eva:text-eva-muted whitespace-nowrap">{{ formatDate(order.orderDate) }}</td>
              <td class="px-4 py-3 text-gray-600 eva:text-eva-muted whitespace-nowrap">{{ formatDate(order.expectedDate) }}</td>
              <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">{{ order.itemCount }}</td>
              <td class="px-4 py-3 text-gray-600 eva:text-eva-muted whitespace-nowrap">{{ formatPrice(order.totalCents) }}</td>
              <td class="px-4 py-3 text-gray-500 eva:text-eva-muted text-xs">{{ order.creatorName }}</td>
              <td class="px-4 py-3">
                <NuxtLink :to="`/orders/${order.id}`"
                  class="text-blue-600 hover:underline eva:text-eva-lime text-xs">Edit</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

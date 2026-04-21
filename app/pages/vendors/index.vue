<script setup lang="ts">
const { data: vendors, refresh } = await useFetch('/api/vendors')

async function handleDelete(id: number) {
  if (!confirm('Delete this vendor?')) return
  await $fetch(`/api/vendors/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Vendors</h1>
      <NuxtLink to="/vendors/new" class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700">
        + New Vendor
      </NuxtLink>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Name</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Email</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Website</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="!vendors?.length">
            <td colspan="6" class="px-4 py-8 text-center text-gray-400">No vendors yet</td>
          </tr>
          <tr v-for="v in vendors" :key="v.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-900">
              <NuxtLink :to="`/vendors/${v.id}`" class="hover:text-blue-600">{{ v.name }}</NuxtLink>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ v.contactPerson ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ v.phone ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-600">
              <a v-if="v.email" :href="`mailto:${v.email}`" class="text-blue-600 hover:underline">{{ v.email }}</a>
              <span v-else>—</span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              <a v-if="v.website" :href="v.website" target="_blank" class="text-blue-600 hover:underline truncate max-w-xs block">{{ v.website }}</a>
              <span v-else>—</span>
            </td>
            <td class="px-4 py-3 flex gap-3 justify-end">
              <NuxtLink :to="`/vendors/${v.id}`" class="text-blue-600 hover:underline text-xs">Edit</NuxtLink>
              <button @click="handleDelete(v.id)" class="text-red-600 hover:underline text-xs">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

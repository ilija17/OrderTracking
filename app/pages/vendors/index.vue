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
      <h1 class="text-2xl font-semibold text-gray-900 eva:text-white">Vendors</h1>
      <NuxtLink to="/vendors/new"
        class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700
               eva:bg-eva-lime eva:text-eva-dark eva:hover:brightness-110">
        + New Vendor
      </NuxtLink>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden eva:bg-eva-surface eva:border-eva-border">
      <table class="min-w-full divide-y divide-gray-200 eva:divide-eva-border text-sm">
        <thead class="bg-gray-50 eva:bg-eva-raised">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted"></th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Name</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Contact</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Phone</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Email</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Website</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 eva:divide-eva-border">
          <tr v-if="!vendors?.length">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400 eva:text-eva-muted">No vendors yet</td>
          </tr>
          <tr v-for="v in vendors" :key="v.id" class="hover:bg-gray-50 eva:hover:bg-eva-raised">
            <td class="px-4 py-3 w-12">
              <img v-if="v.imagePath" :src="`/api/vendors/${v.id}/image`"
                class="w-8 h-8 min-w-[2rem] min-h-[2rem] aspect-square rounded-full object-cover border border-gray-200 eva:border-eva-border" alt="" />
              <div v-else class="w-8 h-8 min-w-[2rem] min-h-[2rem] aspect-square rounded-full bg-gray-100 eva:bg-eva-raised border border-gray-200 eva:border-eva-border" />
            </td>
            <td class="px-4 py-3 font-medium text-gray-900 eva:text-white">
              <NuxtLink :to="`/vendors/${v.id}`" class="hover:text-blue-600 eva:hover:text-eva-lime">{{ v.name }}</NuxtLink>
            </td>
            <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">{{ v.contactPerson ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">{{ v.phone ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">
              <a v-if="v.email" :href="`mailto:${v.email}`" class="text-blue-600 hover:underline eva:text-eva-lime">{{ v.email }}</a>
              <span v-else>—</span>
            </td>
            <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">
              <a v-if="v.website" :href="v.website" target="_blank" class="text-blue-600 hover:underline eva:text-eva-lime truncate max-w-xs block">{{ v.website }}</a>
              <span v-else>—</span>
            </td>
            <td class="px-4 py-3 flex gap-3 justify-end">
              <NuxtLink :to="`/vendors/${v.id}`" class="text-blue-600 hover:underline eva:text-eva-lime text-xs">Edit</NuxtLink>
              <button @click="handleDelete(v.id)" class="text-red-600 hover:underline eva:text-red-400 text-xs">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

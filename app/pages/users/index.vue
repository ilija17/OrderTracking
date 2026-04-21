<script setup lang="ts">
const { user: currentUser } = useUserSession()
const router = useRouter()

if ((currentUser.value as any)?.role !== 'admin') {
  router.push('/')
}

const { data: users, refresh } = await useFetch('/api/users')

const showForm = ref(false)
const editingUser = ref<any>(null)
const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  displayName: '',
  password: '',
  role: 'user' as 'admin' | 'user',
})

function resetForm() {
  form.username = ''
  form.displayName = ''
  form.password = ''
  form.role = 'user'
  editingUser.value = null
  error.value = ''
}

function startCreate() {
  resetForm()
  showForm.value = true
}

function startEdit(u: any) {
  editingUser.value = u
  form.username = u.username
  form.displayName = u.displayName
  form.password = ''
  form.role = u.role
  showForm.value = true
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    if (editingUser.value) {
      const body: Record<string, any> = {
        displayName: form.displayName,
        role: form.role,
      }
      if (form.password) body.password = form.password
      await $fetch(`/api/users/${editingUser.value.id}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/users', { method: 'POST', body: { ...form } })
    }
    showForm.value = false
    resetForm()
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Failed to save'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  if (!confirm('Delete this user?')) return
  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to delete')
  }
}

const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 eva:bg-eva-raised eva:border-eva-border eva:text-white eva:focus:ring-eva-lime'
const label = 'block text-sm font-medium text-gray-700 eva:text-eva-muted mb-1'
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 eva:text-white">Users</h1>
      <button @click="startCreate"
        class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700
               eva:bg-eva-lime eva:text-eva-dark eva:hover:brightness-110">
        + New User
      </button>
    </div>

    <!-- User Form Modal -->
    <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6 mb-6 eva:bg-eva-surface eva:border-eva-border">
      <h2 class="text-lg font-semibold text-gray-900 eva:text-white mb-4">
        {{ editingUser ? `Edit ${editingUser.username}` : 'New User' }}
      </h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="!editingUser">
            <label :class="label">Username <span class="text-red-500">*</span></label>
            <input v-model="form.username" required type="text" :class="input" />
          </div>
          <div>
            <label :class="label">Display Name <span class="text-red-500">*</span></label>
            <input v-model="form.displayName" required type="text" :class="input" />
          </div>
          <div>
            <label :class="label">{{ editingUser ? 'New Password (leave blank to keep)' : 'Password *' }}</label>
            <input v-model="form.password" :required="!editingUser" type="password" minlength="4" :class="input" />
          </div>
          <div>
            <label :class="label">Role</label>
            <select v-model="form.role" :class="input">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <p v-if="error" class="text-sm text-red-600 eva:text-red-400">{{ error }}</p>
        <div class="flex gap-3">
          <button type="submit" :disabled="loading"
            class="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50
                   eva:bg-eva-lime eva:text-eva-dark eva:hover:brightness-110">
            {{ loading ? 'Saving…' : 'Save' }}
          </button>
          <button type="button" @click="showForm = false; resetForm()"
            class="text-gray-500 hover:text-gray-900 eva:text-eva-muted eva:hover:text-white text-sm px-4 py-2">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden eva:bg-eva-surface eva:border-eva-border">
      <table class="min-w-full divide-y divide-gray-200 eva:divide-eva-border text-sm">
        <thead class="bg-gray-50 eva:bg-eva-raised">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Username</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Display Name</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Role</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 eva:text-eva-muted">Created</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 eva:divide-eva-border">
          <tr v-if="!users?.length">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400 eva:text-eva-muted">No users</td>
          </tr>
          <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50 eva:hover:bg-eva-raised">
            <td class="px-4 py-3 font-medium text-gray-900 eva:text-white">{{ u.username }}</td>
            <td class="px-4 py-3 text-gray-600 eva:text-eva-muted">{{ u.displayName }}</td>
            <td class="px-4 py-3">
              <span :class="u.role === 'admin'
                ? 'bg-purple-100 text-purple-800 eva:bg-purple-900/30 eva:text-purple-300'
                : 'bg-gray-100 text-gray-800 eva:bg-eva-raised eva:text-eva-muted'"
                class="inline-block px-2 py-0.5 rounded-full text-xs font-medium">
                {{ u.role }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 eva:text-eva-muted text-xs whitespace-nowrap">
              {{ new Date(u.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-4 py-3 flex gap-3 justify-end">
              <button @click="startEdit(u)" class="text-blue-600 hover:underline eva:text-eva-lime text-xs">Edit</button>
              <button v-if="u.id !== (currentUser as any)?.id" @click="handleDelete(u.id)"
                class="text-red-600 hover:underline eva:text-red-400 text-xs">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

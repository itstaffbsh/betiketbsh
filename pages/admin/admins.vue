<template>
  <div class="space-y-6">
    <!-- Page Title Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
        Admin Management
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        {{
          t(
            'Kelola akun administrator dan personel IT Support yang memiliki akses ke panel pengelolaan tiket.',
            'Manage administrator accounts and IT Support personnel who have access to the ticket management panel.'
          )
        }}
      </p>
    </div>

    <!-- MAIN CARD -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <!-- TOP BAR: Add Admin on Left, Search on Right -->
      <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition self-start sm:self-auto"
          @click="openModal()"
        >
          <Plus class="w-4 h-4" />
          <span>{{ t('Tambah Admin', 'Add Admin') }}</span>
        </button>

        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('Cari nama, jabatan, email, atau no HP...', 'Search name, position, email, or phone...')"
            class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
            @input="handleSearchInput"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            @click="clearSearch"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- TABLE (Desktop / Tablet > 480px) -->
      <div class="hidden min-[481px]:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-6">{{ t('Nama & Jabatan', 'Name & Position') }}</th>
              <th class="py-3.5 px-4">Email</th>
              <th class="py-3.5 px-4">{{ t('Nomor HP', 'Phone Number') }}</th>
              <th class="py-3.5 px-6 text-right">{{ t('Aksi', 'Action') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="loading">
              <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                {{ t('Memuat data admin...', 'Loading admins...') }}
              </td>
            </tr>
            <tr v-else-if="admins.length === 0">
              <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                {{ t('Tidak ada data admin yang ditemukan.', 'No admins found.') }}
              </td>
            </tr>
            <tr
              v-for="adm in admins"
              :key="adm.id"
              class="hover:bg-slate-50/70 transition"
            >
              <!-- 1. Nama & Jabatan -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {{ getInitials(adm.name) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ adm.name }}</div>
                    <div class="text-xs font-semibold text-brand-600 mt-0.5">
                      {{ adm.position }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 2. Email -->
              <td class="py-4 px-4">
                <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {{ adm.email }}
                </span>
              </td>

              <!-- 3. Nomor HP -->
              <td class="py-4 px-4">
                <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {{ adm.phone }}
                </span>
              </td>

              <!-- 4. Aksi: Edit, Delete (Protected for self) -->
              <td class="py-4 px-6 text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition"
                    @click="openModal(adm)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    :disabled="adm.id === currentUser?.id"
                    :title="
                      adm.id === currentUser?.id
                        ? t('Admin yang sedang login tidak dapat menghapus akunnya sendiri', 'Logged-in admin cannot delete their own account')
                        : t('Hapus Admin', 'Delete Admin')
                    "
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition',
                      adm.id === currentUser?.id
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                    ]"
                    @click="handleDelete(adm)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    <span>{{ t('Hapus', 'Delete') }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Expandable Table (< 480px, Matches Image 1) -->
      <div class="min-[481px]:hidden">
        <div class="bg-slate-50/70 border-b border-slate-100 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {{ t('Nama & Jabatan', 'Name & Position') }} &darr;
        </div>

        <div v-if="loading" class="py-12 px-5 text-center text-slate-400 text-sm">
          {{ t('Memuat data admin...', 'Loading admins...') }}
        </div>
        <div v-else-if="admins.length === 0" class="py-12 px-5 text-center text-slate-400 text-sm">
          {{ t('Tidak ada data admin yang ditemukan.', 'No admins found.') }}
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="adm in admins" :key="`mob-adm-${adm.id}`">
            <!-- Collapsed Row Bar -->
            <div
              class="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition select-none"
              @click="toggleExpand(adm.id)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  {{ getInitials(adm.name) }}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-slate-900 text-sm truncate">{{ adm.name }}</div>
                  <div class="text-xs font-semibold text-brand-600 mt-0.5 truncate">
                    {{ adm.position }}
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 transition"
                :aria-label="isExpanded(adm.id) ? 'Tutup detail baris' : 'Buka detail baris'"
                @click.stop="toggleExpand(adm.id)"
              >
                <Minus v-if="isExpanded(adm.id)" class="w-4 h-4" />
                <Plus v-else class="w-4 h-4" />
              </button>
            </div>

            <!-- Expanded Detail Stack -->
            <div
              v-if="isExpanded(adm.id)"
              class="px-5 py-4 bg-white border-t border-slate-100 space-y-3.5 text-sm"
            >
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Email
                </span>
                <div class="mt-1 font-bold text-slate-900 text-sm break-all">
                  {{ adm.email || '-' }}
                </div>
              </div>

              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {{ t('Nomor HP', 'Phone Number') }}
                </span>
                <div class="mt-1 font-bold text-slate-900 text-sm">
                  {{ adm.phone || '-' }}
                </div>
              </div>

              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {{ t('Aksi', 'Action') }}
                </span>
                <div class="mt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition"
                    @click.stop="openModal(adm)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    :disabled="adm.id === currentUser?.id"
                    :title="
                      adm.id === currentUser?.id
                        ? t('Admin yang sedang login tidak dapat menghapus akunnya sendiri', 'Logged-in admin cannot delete their own account')
                        : t('Hapus Admin', 'Delete Admin')
                    "
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition',
                      adm.id === currentUser?.id
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                    ]"
                    @click.stop="handleDelete(adm)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    <span>{{ t('Hapus', 'Delete') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <PaginationBar :meta="meta" @change="changePage" @update:per-page="changePerPage" />
    </div>

    <!-- MODAL ADD / EDIT ADMIN -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="modalOpen = false"
      >
        <div class="bg-white rounded-3xl shadow-modal border border-slate-100 w-full max-w-lg overflow-hidden my-8">
          <div class="flex items-center justify-between px-6 py-5 bg-slate-50/70 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Users class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">
                  {{ editingId ? t('Edit Admin', 'Edit Admin') : t('Tambah Admin', 'Add Admin') }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{
                    t(
                      'Lengkapi informasi nama, jabatan, email, nomor HP, dan password admin.',
                      'Fill in the admin name, position, email, phone number, and password.'
                    )
                  }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              @click="modalOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="submitAdmin">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                {{ t('Nama Lengkap *', 'Full Name *') }}
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                :placeholder="t('Masukkan nama lengkap admin', 'Enter admin full name')"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                {{ t('Jabatan / Posisi *', 'Position / Title *') }}
              </label>
              <input
                v-model="form.position"
                type="text"
                required
                :placeholder="t('Contoh: Senior IT Support Engineer', 'e.g. Senior IT Support Engineer')"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Email *</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="nama@bshsupport.io"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('Nomor HP (Hanya Angka) *', 'Phone Number (Digits Only) *') }}
                </label>
                <input
                  v-model="form.phone"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="081234567890"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                  @input="onPhoneInput"
                  @keypress="onlyDigitsKeypress"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold text-slate-700">
                  Password {{ editingId ? t('(Opsional)', '(Optional)') : '*' }}
                </label>
                <span v-if="editingId" class="text-[11px] text-slate-400">
                  {{ t('Kosongkan jika tidak ingin mengubah password', 'Leave blank to keep current password') }}
                </span>
              </div>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  :required="!editingId"
                  minlength="6"
                  :placeholder="t('Minimal 6 karakter', 'Minimum 6 characters')"
                  class="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                @click="modalOpen = false"
              >
                {{ t('Batal', 'Cancel') }}
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
              >
                <Check class="w-4 h-4" />
                <span>{{ saving ? t('Menyimpan...', 'Saving...') : t('Simpan Admin', 'Save Admin') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { Plus, Minus, Search, X, Users, Mail, Phone, Pencil, Trash2, Check, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { user: currentUser, apiFetch, fetchMe } = useAuth()
const { t } = useLang()

const admins = ref<any[]>([])
const meta = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
})

const searchQuery = ref('')
const perPage = ref(10)
const loading = ref(false)
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const showPassword = ref(false)
const expandedRows = ref<number[]>([])

const isExpanded = (id: number) => expandedRows.value.includes(id)
const toggleExpand = (id: number) => {
  if (isExpanded(id)) {
    expandedRows.value = expandedRows.value.filter((rowId) => rowId !== id)
  } else {
    expandedRows.value.push(id)
  }
}

const form = reactive({
  name: '',
  position: '',
  email: '',
  phone: '',
  password: '',
})

const onPhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const digitsOnly = target.value.replace(/\D/g, '')
  target.value = digitsOnly
  form.phone = digitsOnly
}

const onlyDigitsKeypress = (e: KeyboardEvent) => {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

const fetchAdmins = async (page = 1) => {
  loading.value = true
  try {
    const res = await apiFetch('/admin/admins', {
      params: {
        page,
        per_page: perPage.value,
        search: searchQuery.value,
      },
    })
    admins.value = res.data
    meta.value = res.meta
  } catch (err) {
    console.error('Failed to load admins:', err)
  } finally {
    loading.value = false
  }
}

const changePerPage = (newPerPage: number) => {
  perPage.value = newPerPage
  fetchAdmins(1)
}

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchAdmins(1)
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchAdmins(1)
}

const changePage = (page: number) => {
  fetchAdmins(page)
}

const openModal = (adm?: any) => {
  showPassword.value = false
  if (adm) {
    editingId.value = adm.id
    form.name = adm.name
    form.position = adm.position
    form.email = adm.email
    const rawPhone = adm.phone === '-' ? '' : adm.phone || ''
    form.phone = rawPhone.replace(/\D/g, '')
    form.password = ''
  } else {
    editingId.value = null
    form.name = ''
    form.position = ''
    form.email = ''
    form.phone = ''
    form.password = ''
  }
  modalOpen.value = true
}

const submitAdmin = async () => {
  form.phone = form.phone.replace(/\D/g, '')
  saving.value = true
  try {
    const url = editingId.value ? `/admin/admins/${editingId.value}` : '/admin/admins'
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await apiFetch<{ message: string }>(url, {
      method,
      body: { ...form },
    })

    modalOpen.value = false
    await fetchAdmins(meta.value.current_page)
    if (editingId.value && editingId.value === currentUser.value?.id) {
      await fetchMe()
    }

    await Swal.fire({
      icon: 'success',
      title: t('Berhasil', 'Success'),
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Menyimpan Admin', 'Failed to Save Admin'),
      text: err?.data?.message || t('Periksa kembali data yang dimasukkan.', 'Please check your input.'),
      confirmButtonColor: '#042B4F',
    })
  } finally {
    saving.value = false
  }
}

const handleDelete = async (adm: any) => {
  if (adm.id === currentUser.value?.id) {
    await Swal.fire({
      icon: 'warning',
      title: t('Tidak Diizinkan', 'Not Allowed'),
      text: t('Admin yang sedang login tidak dapat menghapus akunnya sendiri.', 'Logged-in admin cannot delete their own account.'),
      confirmButtonColor: '#042B4F',
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: t('Hapus Admin?', 'Delete Admin?'),
    text: t(
      `Apakah Anda yakin untuk menghapus data admin "${adm.name}"?`,
      `Are you sure you want to delete admin "${adm.name}"?`
    ),
    showCancelButton: true,
    confirmButtonText: t('Ya, Hapus', 'Yes, Delete'),
    cancelButtonText: t('Batal', 'Cancel'),
    confirmButtonColor: '#E11D48',
    cancelButtonColor: '#64748B',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    const res = await apiFetch<{ message: string }>(`/admin/admins/${adm.id}`, {
      method: 'DELETE',
    })
    await fetchAdmins(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: t('Terhapus', 'Deleted'),
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1600,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Menghapus', 'Failed to Delete'),
      text: err?.data?.message || t('Terjadi kesalahan saat menghapus admin.', 'An error occurred while deleting admin.'),
      confirmButtonColor: '#042B4F',
    })
  }
}

const getInitials = (name: string) => {
  if (!name) return 'A'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

onMounted(() => {
  fetchAdmins(1)
})
</script>

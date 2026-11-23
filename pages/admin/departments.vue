<template>
  <div class="space-y-6">
    <!-- Page Title Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
        {{ t('Manajemen Department & Sub-Department', 'Department & Sub-Department Mapping') }}
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        {{
          t(
            'Kelola daftar departemen utama beserta sub-department untuk pencocokan otomatis (Auto-Mapping) saat tambah Work Order.',
            'Manage main departments and sub-departments for automatic matching (Auto-Mapping) when adding Work Orders.'
          )
        }}
      </p>
    </div>

    <!-- MAIN CARD -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <!-- TOP BAR: Add Department on Left, Search on Right -->
      <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition self-start sm:self-auto"
          @click="openModal()"
        >
          <Plus class="w-4 h-4" />
          <span>{{ t('Tambah Department', 'Add Department') }}</span>
        </button>

        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('Cari nama department atau sub-department...', 'Search department or sub-department...')"
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

      <!-- TABLE -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-6">{{ t('Nama Department', 'Department Name') }}</th>
              <th class="py-3.5 px-4">{{ t('Sub Department (Kata Kunci Auto-Mapping)', 'Sub Department (Auto-Mapping Keywords)') }}</th>
              <th class="py-3.5 px-4">{{ t('Total Tiket', 'Total Tickets') }}</th>
              <th class="py-3.5 px-6 text-right">{{ t('Aksi', 'Action') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-if="loading">
              <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                {{ t('Memuat data departemen...', 'Loading departments...') }}
              </td>
            </tr>
            <tr v-else-if="departments.length === 0">
              <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
                {{ t('Tidak ada data departemen yang ditemukan.', 'No departments found.') }}
              </td>
            </tr>
            <tr
              v-for="dept in departments"
              :key="dept.id"
              class="hover:bg-slate-50/70 transition"
            >
              <!-- Nama Department -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Building2 class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ dept.name }}</div>
                    <div class="text-[11px] text-slate-400">Soft Delete Protected</div>
                  </div>
                </div>
              </td>

              <!-- Sub Department -->
              <td class="py-4 px-4">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="(sub, idx) in dept.sub_departments"
                    :key="idx"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                  >
                    {{ sub }}
                  </span>
                  <span
                    v-if="!dept.sub_departments || dept.sub_departments.length === 0"
                    class="text-xs text-slate-400 italic"
                  >
                    {{ t('Belum ada sub-department', 'No sub-departments yet') }}
                  </span>
                </div>
              </td>

              <!-- Total Tiket -->
              <td class="py-4 px-4 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {{ dept.work_orders_count || 0 }} {{ t('tiket', 'tickets') }}
                </span>
              </td>

              <!-- Aksi: Edit & Delete -->
              <td class="py-4 px-6 text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    @click="openModal(dept)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                    @click="handleDelete(dept)"
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

      <!-- Bottom Bar -->
      <PaginationBar :meta="meta" @change="changePage" @update:per-page="changePerPage" />
    </div>

    <!-- MODAL ADD / EDIT DEPARTMENT -->
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
                <Building2 class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">
                  {{ editingId ? t('Edit Department', 'Edit Department') : t('Tambah Department', 'Add Department') }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{
                    t(
                      'Sub-department dipisahkan dengan tanda koma (,) untuk pencocokan otomatis.',
                      'Sub-departments separated by commas (,) for automatic matching.'
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

          <form class="p-6 space-y-4" @submit.prevent="submitDepartment">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                {{ t('Nama Department Utama *', 'Main Department Name *') }}
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                :placeholder="t('Contoh: Accounting', 'e.g. Accounting')"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                {{ t('Sub Department (Pisahkan dengan koma) *', 'Sub Departments (Comma-separated) *') }}
              </label>
              <textarea
                v-model="form.sub_departments_text"
                rows="3"
                :placeholder="t('Contoh: finance, tax, treasury, billing, payroll', 'e.g. finance, tax, treasury, billing, payroll')"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
              />
            </div>

            <!-- Live Badge Preview -->
            <div v-if="previewBadges.length > 0" class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                Preview Sub-Department ({{ previewBadges.length }})
              </span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="(b, idx) in previewBadges"
                  :key="idx"
                  class="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                >
                  {{ b }}
                </span>
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
                <span>{{ saving ? t('Menyimpan...', 'Saving...') : t('Simpan Department', 'Save Department') }}</span>
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
import { Plus, Search, X, Building2, Pencil, Trash2, Check } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { apiFetch } = useAuth()
const { t } = useLang()

const departments = ref<any[]>([])
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

const form = reactive({
  name: '',
  sub_departments_text: '',
})

const previewBadges = computed(() =>
  form.sub_departments_text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
)

let searchTimer: ReturnType<typeof setTimeout> | null = null

const fetchDepartments = async (page = 1) => {
  loading.value = true
  try {
    const res = await apiFetch('/admin/departments', {
      params: {
        page,
        per_page: perPage.value,
        search: searchQuery.value,
      },
    })
    departments.value = res.data
    meta.value = res.meta
  } catch (err) {
    console.error('Failed to load departments:', err)
  } finally {
    loading.value = false
  }
}

const changePerPage = (newPerPage: number) => {
  perPage.value = newPerPage
  fetchDepartments(1)
}

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchDepartments(1)
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchDepartments(1)
}

const changePage = (page: number) => {
  fetchDepartments(page)
}

const openModal = (dept?: any) => {
  if (dept) {
    editingId.value = dept.id
    form.name = dept.name
    form.sub_departments_text = (dept.sub_departments || []).join(', ')
  } else {
    editingId.value = null
    form.name = ''
    form.sub_departments_text = ''
  }
  modalOpen.value = true
}

const submitDepartment = async () => {
  saving.value = true
  try {
    const url = editingId.value
      ? `/admin/departments/${editingId.value}`
      : '/admin/departments'
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await apiFetch<{ message: string }>(url, {
      method,
      body: {
        name: form.name,
        sub_departments: previewBadges.value,
      },
    })

    modalOpen.value = false
    await fetchDepartments(meta.value.current_page)
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
      title: t('Gagal Menyimpan', 'Failed to Save'),
      text: err?.data?.message || t('Periksa kembali input Anda.', 'Please check your input.'),
      confirmButtonColor: '#042B4F',
    })
  } finally {
    saving.value = false
  }
}

const handleDelete = async (dept: any) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: t('Hapus Department?', 'Delete Department?'),
    text: t(
      `Apakah Anda yakin untuk menghapus department "${dept.name}"? (Data menggunakan Soft Delete sehingga tiket lama tetap aman)`,
      `Are you sure you want to delete department "${dept.name}"? (Uses Soft Delete so existing tickets remain intact)`
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
    const res = await apiFetch<{ message: string }>(`/admin/departments/${dept.id}`, {
      method: 'DELETE',
    })
    await fetchDepartments(meta.value.current_page)
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
      text: err?.data?.message || t('Terjadi kesalahan saat menghapus department.', 'An error occurred while deleting department.'),
      confirmButtonColor: '#042B4F',
    })
  }
}

onMounted(() => {
  fetchDepartments(1)
})
</script>

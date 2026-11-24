<template>
  <div class="min-h-screen flex flex-col bg-[#F8F9FE]">
    <!-- HEADER: Logo/Judul di kiri, Language Switcher & tombol Login di pojok kanan atas -->
    <header class="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        <!-- Left: Brand Logo & Title -->
        <NuxtLink to="/" class="flex items-center gap-3.5 group">
          <div class="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20 group-hover:scale-105 transition">
            <Headset class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold text-slate-900 tracking-tight">BSHsupport</span>
            </div>
          </div>
        </NuxtLink>

        <!-- Right: Language Switcher + Login Button -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <LanguageSwitcher />

          <NuxtLink
            v-if="isAuthenticated"
            to="/admin/dashboard"
            class="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
          >
            <LayoutDashboard class="w-4 h-4" />
            Admin Dashboard
          </NuxtLink>

          <NuxtLink
            to="/login"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition"
          >
            <LogIn class="w-4 h-4" />
            <span>Login</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-7">
      <!-- Page Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ t('Papan Pemantauan Tiket & Work Order', 'Public Ticket & Work Order Board') }}
          </h1>
          <p class="text-sm text-slate-500 mt-1">
            {{
              t(
                'Pantau status pengerjaan tiket dan work order IT secara real-time tanpa perlu login.',
                'Monitor IT ticket and work order progress in real-time without logging in.'
              )
            }}
          </p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {{ t('Status Sistem Aktif', 'Live System Status') }}
          </span>
        </div>
      </div>

      <!-- 4 SUMMARY CARDS -->
      <SummaryCards :summary="summary" />

      <!-- TABEL TIKET -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <!-- Top Bar: Title on left, Search input on top right -->
        <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-extrabold text-slate-900">
              {{ t('Daftar Work Order & Tiket IT', 'IT Work Orders & Tickets List') }}
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">
              {{
                t(
                  'Menampilkan daftar permintaan tiket dari seluruh departemen dan lokasi kantor',
                  'Displaying ticket requests across all departments and office locations'
                )
              }}
            </p>
          </div>

          <!-- Search Input in Top Right -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div class="relative w-full sm:w-80">
              <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('Cari no tiket, pembuat, departemen, lokasi...', 'Search ticket no, requester, dept, location...')"
                class="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
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
        </div>

        <!-- Table Content (Desktop / Tablet > 480px) -->
        <div class="hidden min-[481px]:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th class="py-3.5 px-6">{{ t('Pembuat & Departemen', 'Requester & Department') }}</th>
                <th class="py-3.5 px-4">{{ t('Tanggal & No. Tiket', 'Date & Ticket No.') }}</th>
                <th class="py-3.5 px-4">Location Office</th>
                <th class="py-3.5 px-4">{{ t('Deskripsi', 'Description') }}</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-6 text-right">{{ t('Aksi', 'Action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="loading">
                <td colspan="6" class="py-12 text-center text-slate-400 text-sm">
                  {{ t('Memuat data tiket...', 'Loading tickets...') }}
                </td>
              </tr>
              <tr v-else-if="tickets.length === 0">
                <td colspan="6" class="py-12 text-center text-slate-400 text-sm">
                  {{ t('Tidak ada data tiket yang sesuai dengan pencarian Anda.', 'No tickets matched your search.') }}
                </td>
              </tr>
              <tr
                v-for="item in tickets"
                :key="item.id"
                class="hover:bg-slate-50/70 transition group"
              >
                <!-- 1. Pembuat & Departemen -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {{ getInitials(item.requested_by) }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900">{{ item.requested_by }}</div>
                      <div class="text-xs font-semibold text-brand-600 mt-0.5">
                        {{ item.department_name || item.department }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- 2. Tanggal & No. Tiket -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="font-medium text-slate-700 text-xs">
                    {{ item.date_requested_label || item.date_requested }}
                  </div>
                  <div class="font-extrabold text-brand-600 text-xs mt-0.5">
                    #{{ item.work_order_no }}
                  </div>
                </td>

                <!-- 3. Location Office -->
                <td class="py-4 px-4">
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                    <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {{ item.location }}
                  </span>
                </td>

                <!-- 4. Deskripsi -->
                <td class="py-4 px-4 max-w-xs">
                  <p class="text-xs text-slate-600 truncate" :title="item.description">
                    {{ item.description }}
                  </p>
                </td>

                <!-- 5. Status -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
                      item.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'wo_issued'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        item.status === 'done'
                          ? 'bg-emerald-500'
                          : item.status === 'wo_issued'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                      ]"
                    />
                    {{ item.status_label || (item.status === 'done' ? 'Done' : item.status === 'wo_issued' ? 'WO has Been Issued' : 'Open') }}
                  </span>
                </td>

                <!-- 6. Aksi: Tombol Detail -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition"
                    @click="openDetail(item)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    {{ t('Detail', 'Details') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Expandable Table (< 480px, Matches Image 1) -->
        <div class="min-[481px]:hidden">
          <div class="bg-slate-50/70 border-b border-slate-100 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('Pembuat & Departemen', 'Requester & Department') }} &darr;
          </div>

          <div v-if="loading" class="py-12 px-5 text-center text-slate-400 text-sm">
            {{ t('Memuat data tiket...', 'Loading tickets...') }}
          </div>
          <div v-else-if="tickets.length === 0" class="py-12 px-5 text-center text-slate-400 text-sm">
            {{ t('Tidak ada data tiket yang sesuai dengan pencarian Anda.', 'No tickets matched your search.') }}
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="item in tickets" :key="`mob-${item.id}`">
              <!-- Collapsed Row Bar -->
              <div
                class="px-5 py-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition select-none"
                @click="toggleExpand(item.id)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {{ getInitials(item.requested_by) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 text-sm truncate">{{ item.requested_by }}</div>
                    <div class="text-xs font-semibold text-brand-600 mt-0.5 truncate">
                      {{ item.department_name || item.department }}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 transition"
                  :aria-label="isExpanded(item.id) ? 'Tutup detail baris' : 'Buka detail baris'"
                  @click.stop="toggleExpand(item.id)"
                >
                  <Minus v-if="isExpanded(item.id)" class="w-4 h-4" />
                  <Plus v-else class="w-4 h-4" />
                </button>
              </div>

              <!-- Expanded Detail Stack -->
              <div
                v-if="isExpanded(item.id)"
                class="px-5 py-4 bg-white border-t border-slate-100 space-y-3.5 text-sm"
              >
                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {{ t('Tanggal & No. Tiket', 'Date & Ticket No.') }}
                  </span>
                  <div class="mt-1 font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                    <span>{{ item.date_requested_label || item.date_requested }}</span>
                    <span class="text-brand-600 font-extrabold">#{{ item.work_order_no }}</span>
                  </div>
                </div>

                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Location Office
                  </span>
                  <div class="mt-1 font-bold text-slate-900 text-sm">
                    {{ item.location || '-' }}
                  </div>
                </div>

                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {{ t('Deskripsi', 'Description') }}
                  </span>
                  <div class="mt-1 text-slate-800 text-sm leading-relaxed break-words">
                    {{ item.description || '-' }}
                  </div>
                </div>

                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Status
                  </span>
                  <div class="mt-1.5">
                    <span
                      :class="[
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',
                        item.status === 'done'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'wo_issued'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                      ]"
                    >
                      <span
                        :class="[
                          'w-1.5 h-1.5 rounded-full',
                          item.status === 'done'
                            ? 'bg-emerald-500'
                            : item.status === 'wo_issued'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                        ]"
                      />
                      {{ item.status_label || (item.status === 'done' ? 'Done' : item.status === 'wo_issued' ? 'WO has Been Issued' : 'Open') }}
                    </span>
                  </div>
                </div>

                <div>
                  <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    {{ t('Aksi', 'Action') }}
                  </span>
                  <div class="mt-1.5">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition"
                      @click.stop="openDetail(item)"
                    >
                      <Eye class="w-3.5 h-3.5" />
                      {{ t('Detail', 'Details') }}
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
    </main>

    <!-- MODAL DETAIL -->
    <TicketDetailModal v-model="detailOpen" :ticket="selectedTicket" />
  </div>
</template>

<script setup lang="ts">
import {
  Headset,
  LogIn,
  LayoutDashboard,
  Search,
  X,
  MapPin,
  Eye,
  Plus,
  Minus,
} from 'lucide-vue-next'

const { apiFetch, isAuthenticated } = useAuth()
const { t } = useLang()

const summary = ref({
  total: 0,
  done: 0,
  open: 0,
  today: 0,
})

const tickets = ref<any[]>([])
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
const detailOpen = ref(false)
const selectedTicket = ref<any | null>(null)
const expandedRows = ref<number[]>([])

const isExpanded = (id: number) => expandedRows.value.includes(id)
const toggleExpand = (id: number) => {
  if (isExpanded(id)) {
    expandedRows.value = expandedRows.value.filter((rowId) => rowId !== id)
  } else {
    expandedRows.value.push(id)
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

const fetchSummary = async () => {
  try {
    const res = await apiFetch('/public/summary')
    summary.value = res.summary
  } catch (err) {
    console.error('Failed to fetch summary:', err)
  }
}

const fetchTickets = async (page = 1) => {
  loading.value = true
  try {
    const res = await apiFetch('/public/work-orders', {
      params: {
        page,
        per_page: perPage.value,
        search: searchQuery.value,
      },
    })
    tickets.value = res.data
    meta.value = res.meta
  } catch (err) {
    console.error('Failed to fetch tickets:', err)
  } finally {
    loading.value = false
  }
}

const changePerPage = (newPerPage: number) => {
  perPage.value = newPerPage
  fetchTickets(1)
}

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchTickets(1)
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  fetchTickets(1)
}

const changePage = (page: number) => {
  fetchTickets(page)
}

const openDetail = (item: any) => {
  selectedTicket.value = item
  detailOpen.value = true
}

const getInitials = (name: string) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

onMounted(() => {
  fetchSummary()
  fetchTickets(1)
})
</script>

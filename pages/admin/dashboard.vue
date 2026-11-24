<template>
  <div class="space-y-7">
    <!-- Top Greeting Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ t('Halo', 'Hello') }} {{ firstName }},
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          {{
            t(
              'Berikut ringkasan aktivitas tiket, grafik 30 hari terakhir, dan daftar work order hari ini.',
              'Here is a summary of ticket activity, 30-day trends, and work orders today.'
            )
          }}
        </p>
      </div>

      <div class="flex items-center gap-3 self-start sm:self-auto">
        <NuxtLink
          to="/admin/work-orders"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition"
        >
          <Plus class="w-4 h-4" />
          <span>{{ t('Kelola Work Order', 'Manage Work Orders') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 4 SUMMARY CARDS -->
    <SummaryCards :summary="summary" />

    <!-- GRAFIK 30 HARI TERAKHIR (Line / Bar Chart) -->
    <TicketChart30Days :series="chart30Days" />

    <!-- TABEL TIKET -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <!-- Top Bar: Title on left, Search input on top right -->
      <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-extrabold text-slate-900">
            {{ t('Daftar Tiket & Work Order', 'Tickets & Work Orders List') }}
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            {{
              t(
                'Cari berdasarkan nomor tiket, nama pembuat, departemen, lokasi, atau deskripsi',
                'Search by ticket number, requester name, department, location, or description'
              )
            }}
          </p>
        </div>

        <!-- Search Input in Top Right -->
        <div class="relative w-full md:w-80">
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
                {{ t('Tidak ada data tiket yang ditemukan.', 'No tickets found.') }}
              </td>
            </tr>
            <tr
              v-for="item in tickets"
              :key="item.id"
              class="hover:bg-slate-50/70 transition"
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
          {{ t('Tidak ada data tiket yang ditemukan.', 'No tickets found.') }}
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="item in tickets" :key="`mob-dash-${item.id}`">
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

    <!-- MODAL DETAIL -->
    <TicketDetailModal
      v-model="detailOpen"
      :ticket="selectedTicket"
      :show-copy-format="true"
      @updated="onTicketUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus, Minus, Search, X, MapPin, Eye } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { user, apiFetch } = useAuth()
const { t } = useLang()

const firstName = computed(() => {
  const full = user.value?.name || 'Admin'
  return full.split(' ')[0]
})

const summary = ref({
  total: 0,
  done: 0,
  open: 0,
  today: 0,
})

const chart30Days = ref<any[]>([])
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

const fetchDashboardData = async () => {
  try {
    const res = await apiFetch('/admin/summary')
    summary.value = res.summary
    chart30Days.value = res.chart_30_days || []
  } catch (err) {
    console.error('Failed to load dashboard summary:', err)
  }
}

const fetchTickets = async (page = 1) => {
  loading.value = true
  try {
    const res = await apiFetch('/admin/work-orders', {
      params: {
        page,
        per_page: perPage.value,
        search: searchQuery.value,
      },
    })
    tickets.value = res.data
    meta.value = res.meta
  } catch (err) {
    console.error('Failed to load tickets:', err)
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

const onTicketUpdated = () => {
  fetchDashboardData()
  fetchTickets(meta.value.current_page)
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
  fetchDashboardData()
  fetchTickets(1)
})
</script>

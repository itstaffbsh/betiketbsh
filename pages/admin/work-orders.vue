<template>
  <div class="space-y-6">
    <!-- Page Title Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          {{ t('Manajemen Work Order (Tiket)', 'Work Order (Ticket) Management') }}
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          {{
            t(
              'Kelola tiket masuk dengan tampilan Kanban Card per status atau Tabel, fitur Quick Paste, dan ekspor laporan Excel.',
              'Manage incoming tickets with Kanban Card view per status or Table view, Quick Paste, and Excel export.'
            )
          }}
        </p>
      </div>

      <!-- VIEW SWITCHER: Card (Kanban) vs Table -->
      <div class="inline-flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
        <button
          type="button"
          :class="[
            'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition',
            viewMode === 'card'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          ]"
          @click="switchViewMode('card')"
        >
          <LayoutGrid class="w-4 h-4" />
          <span>Card View</span>
        </button>
        <button
          type="button"
          :class="[
            'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition',
            viewMode === 'table'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          ]"
          @click="switchViewMode('table')"
        >
          <Table2 class="w-4 h-4" />
          <span>Table View</span>
        </button>
      </div>
    </div>

    <!-- TOP ACTION & FILTER BAR -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <!-- Left Buttons: Add Work Order & Export Excel -->
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition"
          @click="openAddModal"
        >
          <Plus class="w-4 h-4" />
          <span>{{ t('Tambah Work Order', 'Add Work Order') }}</span>
        </button>

        <button
          type="button"
          :disabled="exporting"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 transition"
          @click="exportToExcel"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>{{ exporting ? t('Mengekspor...', 'Exporting...') : 'Export Excel (.xlsx)' }}</span>
        </button>
      </div>

      <!-- Right: Status Filter, Date Filter & Search Input -->
      <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        <!-- Optional Status Filter -->
        <select
          v-model="filterStatus"
          class="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:border-brand-600 outline-none transition"
          @change="fetchWorkOrders(1)"
        >
          <option value="">{{ t('Semua Status', 'All Status') }}</option>
          <option value="open">Open</option>
          <option value="wo_issued">WO has Been Issued</option>
          <option value="done">Done</option>
        </select>

        <!-- Optional Date Filter (> 480px: full input; <= 480px: calendar icon only) -->
        <input
          v-model="filterDate"
          type="date"
          class="hidden min-[481px]:block px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:border-brand-600 outline-none transition"
          :title="t('Filter Tanggal Request', 'Filter Date Requested')"
          @change="fetchWorkOrders(1)"
        />

        <div
          :class="[
            'min-[481px]:hidden relative w-10 h-10 rounded-xl border flex items-center justify-center transition shrink-0',
            filterDate
              ? 'bg-brand-50 border-brand-300 text-brand-600'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          ]"
          :title="filterDate ? `${t('Filter Tanggal', 'Date Filter')}: ${filterDate}` : t('Filter Tanggal Request', 'Filter Date Requested')"
        >
          <Calendar class="w-4 h-4 pointer-events-none" />
          <span
            v-if="filterDate"
            class="w-2 h-2 rounded-full bg-brand-600 absolute top-1.5 right-1.5 pointer-events-none"
          />
          <input
            v-model="filterDate"
            type="date"
            aria-label="Filter Tanggal Request"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            @change="fetchWorkOrders(1)"
          />
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-72">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('Cari no tiket, pembuat, dept, lokasi...', 'Search ticket no, requester, dept, location...')"
            class="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
            @input="handleSearchInput"
          />
          <button
            v-if="searchQuery || filterStatus || filterDate"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            :title="t('Reset Filter', 'Reset Filter')"
            @click="resetFilters"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- VIEW 1: KANBAN CARD VIEW PER STATUS (Matches Image 1)                   -->
    <!-- ======================================================================= -->
    <div v-if="viewMode === 'card'" class="space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-500 px-1">
        <span class="font-semibold">
          {{
            t(
              'Tips: Geser (drag & drop) kartu antar kolom untuk mengubah status tiket.',
              'Tip: Drag & drop cards between columns to change ticket status.'
            )
          }}
        </span>
        <span class="font-bold text-slate-700">
          {{ t('Total Ditampilkan', 'Total Shown') }}: {{ tickets.length }} {{ t('tiket', 'tickets') }}
        </span>
      </div>

      <!-- MOBILE <= 480px STATUS TAB BAR (Open | Issued | Done, default: Open) -->
      <div class="min-[481px]:hidden rounded-xl bg-[#fff] border border-slate-100 px-2 py-2.5 flex items-center justify-between shadow-card select-none">
        <template v-for="(col, idx) in kanbanColumns" :key="`mob-tab-${col.status}`">
          <button
            type="button"
            :data-kanban-status="col.status"
            :class="[
              'flex-1 py-1.5 px-2 rounded-lg text-xs font-extrabold tracking-tight transition text-center flex items-center justify-center gap-1.5',
              mobileActiveStatus === col.status
                ? 'bg-brand-600 text-white shadow-xs'
                : dragOverStatus === col.status
                  ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-600'
                  : 'text-slate-900 hover:bg-black/5'
            ]"
            @click="mobileActiveStatus = col.status as 'open' | 'wo_issued' | 'done'"
          >
            <span>{{ col.mobileTabLabel }}</span>
            <span
              :class="[
                'px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                mobileActiveStatus === col.status
                  ? 'bg-white/20 text-white'
                  : 'bg-black/10 text-slate-800'
              ]"
            >
              {{ col.items.length }}
            </span>
          </button>

          <!-- Vertical Divider Bar (|) between tabs -->
          <span
            v-if="idx < kanbanColumns.length - 1"
            class="w-[2.5px] h-5 bg-slate-800/80 rounded-full mx-1 shrink-0"
          />
        </template>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div
          v-for="col in kanbanColumns"
          :key="col.status"
          :data-kanban-status="col.status"
          :class="[
            'rounded-3xl p-4 border transition-all min-h-[540px] flex-col',
            col.status === mobileActiveStatus ? 'flex' : 'hidden min-[481px]:flex',
            dragOverStatus === col.status
              ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-600/25'
              : 'bg-[#F1F4FA]/90 border-slate-200/70'
          ]"
          @dragover.prevent="onDragOverColumn($event, col.status)"
          @dragenter.prevent="onDragOverColumn($event, col.status)"
          @dragleave="onDragLeaveColumn($event, col.status)"
          @drop.prevent="onDropColumn($event, col.status)"
        >
          <!-- Column Header (Clean without filter/dots icons) -->
          <div class="flex items-center justify-between px-2 py-1.5 mb-3.5">
            <div class="flex items-center gap-2.5">
              <span :class="['w-2.5 h-2.5 rounded-full shrink-0', col.dotClass]" />
              <h3 class="text-sm font-extrabold text-slate-800 tracking-tight">
                {{ col.title }}
              </h3>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-extrabold', col.countBadgeClass]">
                {{ col.items.length }}
              </span>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="loading" class="py-16 text-center text-xs font-semibold text-slate-400">
            {{ t('Memuat kartu tiket...', 'Loading ticket cards...') }}
          </div>

          <!-- Empty Column State -->
          <div
            v-else-if="col.items.length === 0"
            class="flex-1 rounded-2xl border-2 border-dashed border-slate-200/80 flex flex-col items-center justify-center p-8 text-center text-slate-400 my-1"
          >
            <p class="text-xs font-bold">{{ t('Tidak ada tiket', 'No tickets') }}</p>
            <p class="text-[11px] mt-1">
              {{ t('Geser kartu ke kolom ini untuk mengubah status', 'Drag a card here to change its status') }}
            </p>
          </div>

          <!-- Cards List -->
          <div v-else class="space-y-3.5 flex-1">
            <div
              v-for="item in col.items"
              :key="item.id"
              :class="[
                'bg-white rounded-2xl p-4 border border-slate-100 shadow-card hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none group touch-none',
                draggingTicket?.id === item.id && pointerDrag.active ? 'opacity-35 border-dashed border-brand-400' : 'opacity-100'
              ]"
              @pointerdown="onCardPointerDown($event, item)"
              @dragstart.prevent
            >
              <!-- Card Top: Ticket No & Department Badge -->
              <div class="flex items-start justify-between gap-2.5">
                <span class="text-sm font-extrabold text-slate-900 tracking-tight">
                  #{{ item.work_order_no }}
                </span>
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-50 text-brand-600 text-right leading-tight">
                  {{ item.department_name || item.department }}
                </span>
              </div>

              <!-- Card Main Title (Description) -->
              <h4 class="text-sm font-extrabold text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                {{ item.description }}
              </h4>

              <!-- Card Sub-detail (Location & Date Requested) -->
              <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {{ item.location }} &bull; {{ item.date_requested_label || item.date_requested }}
              </p>

              <!-- Status Specific Info Box (Matches Image 1) -->
              <div
                v-if="item.status === 'done'"
                class="mt-3 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/70 flex items-start gap-2 text-emerald-700 text-[11px] font-bold"
              >
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div class="min-w-0">
                  <div class="leading-snug">
                    {{ t('Selesai', 'Completed') }}: {{ item.duration || item.completed_date_label || 'Done' }}
                  </div>
                  <div v-if="item.solution" class="text-[10px] font-medium text-emerald-700/80 truncate mt-0.5">
                    {{ item.solution }}
                  </div>
                </div>
              </div>

              <div
                v-else-if="item.status === 'wo_issued'"
                class="mt-3 p-2.5 rounded-xl bg-rose-50/90 border border-rose-200/70 flex items-center gap-2 text-rose-700 text-[11px] font-bold"
              >
                <Clock class="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span class="leading-snug">
                  Deadline: {{ item.completion_deadline_label || item.completion_deadline }}
                </span>
              </div>

              <div
                v-else
                class="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2 text-slate-600 text-[11px] font-semibold"
              >
                <Clock class="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span class="leading-snug">
                  Deadline: {{ item.completion_deadline_label || item.completion_deadline }}
                </span>
              </div>

              <!-- Card Footer: Requester Initials + Name on Left, "Buka Detail ->" on Right -->
              <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {{ getInitials(item.requested_by) }}
                  </div>
                  <div class="min-w-0">
                    <span class="text-xs font-extrabold text-slate-800 block truncate">
                      {{ item.requested_by }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium block truncate">
                      {{ item.raw_department || item.department_name }}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  data-no-drag="true"
                  class="px-3 py-1.5 rounded-xl bg-brand-50/80 hover:bg-brand-600 text-brand-600 hover:text-white text-xs font-extrabold transition inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  @click.stop="openDetailModal(item)"
                >
                  <span>{{ t('Buka Detail', 'Open Detail') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Drag Ghost Card while dragging across columns -->
      <Teleport to="body">
        <div
          v-if="pointerDrag.active && draggingTicket"
          class="fixed z-[9999] pointer-events-none bg-white rounded-2xl p-4 border-2 border-brand-600 shadow-2xl rotate-2 opacity-95"
          :style="{
            left: `${pointerDrag.x - pointerDrag.offsetX}px`,
            top: `${pointerDrag.y - pointerDrag.offsetY}px`,
            width: `${pointerDrag.width}px`
          }"
        >
          <div class="flex items-start justify-between gap-2.5">
            <span class="text-sm font-extrabold text-slate-900 tracking-tight">
              #{{ draggingTicket.work_order_no }}
            </span>
            <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-50 text-brand-600">
              {{ draggingTicket.department_name || draggingTicket.department }}
            </span>
          </div>
          <h4 class="text-sm font-extrabold text-slate-900 mt-2 line-clamp-2 leading-snug">
            {{ draggingTicket.description }}
          </h4>
          <p class="text-xs text-slate-500 mt-1 truncate">
            {{ draggingTicket.requested_by }} &bull; {{ draggingTicket.location }}
          </p>
        </div>
      </Teleport>
    </div>

    <!-- ======================================================================= -->
    <!-- VIEW 2: TABLE VIEW                                                      -->
    <!-- ======================================================================= -->
    <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <div class="overflow-x-auto">
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
                {{ t('Memuat data work order...', 'Loading work orders...') }}
              </td>
            </tr>
            <tr v-else-if="tickets.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 text-sm">
                {{ t('Tidak ada data work order yang ditemukan.', 'No work orders found.') }}
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
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-xs font-semibold text-brand-600">
                        {{ item.department_name || item.department }}
                      </span>
                      <span
                        v-if="item.raw_department && item.raw_department.toLowerCase() !== (item.department_name || '').toLowerCase()"
                        class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium"
                      >
                        {{ item.raw_department }}
                      </span>
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

              <!-- 4. Deskripsi (truncated) -->
              <td class="py-4 px-4 max-w-xs">
                <p class="text-xs text-slate-600 truncate" :title="item.description">
                  {{ item.description }}
                </p>
              </td>

              <!-- 5. Status (Badge: Open / WO has Been Issued / Done) -->
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

              <!-- 6. Aksi: Buka Detail (Edit & Delete ada di dalam Detail menu titik tiga ⋮) -->
              <td class="py-4 px-6 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition"
                  :title="t('Buka Detail (Edit & Delete)', 'Open Detail (Edit & Delete)')"
                  @click="openDetailModal(item)"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>{{ t('Buka Detail', 'Open Detail') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Bar: Pagination -->
      <PaginationBar :meta="meta" @change="changePage" @update:per-page="changePerPage" />
    </div>

    <!-- ======================================================================= -->
    <!-- MODAL 1: ADD WORK ORDER (QUICK PASTE & AUTO-PARSE + COPY OUTPUT)        -->
    <!-- ======================================================================= -->
    <Teleport to="body">
      <div
        v-if="addModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="addModalOpen = false"
      >
        <div class="bg-white rounded-3xl shadow-modal border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-5 bg-slate-50/70 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <ClipboardPaste class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">
                  {{
                    createdResult
                      ? t('Work Order Berhasil Dibuat', 'Work Order Successfully Created')
                      : t('Tambah Work Order (Quick Paste & Auto-Parse)', 'Add Work Order (Quick Paste & Auto-Parse)')
                  }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{
                    createdResult
                      ? t('Salin teks konfirmasi work order di bawah ini untuk dikirimkan kembali.', 'Copy the work order confirmation text below.')
                      : t('Tempel (paste) format teks permintaan work order pada kolom textarea di bawah.', 'Paste the work order request text into the textarea below.')
                  }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              @click="addModalOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- STEP 1: QUICK PASTE FORM (1 Textarea + Live Auto-Parse & Auto-Map Warning) -->
          <form v-if="!createdResult" class="p-6 space-y-5" @submit.prevent="submitQuickPaste">
            <div class="flex items-center justify-between">
              <label class="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                {{ t('Format Textarea Work Order *', 'Work Order Textarea Format *') }}
              </label>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1 rounded-lg transition"
                @click="fillSamplePaste"
              >
                <Sparkles class="w-3.5 h-3.5" />
                {{ t('Isi Contoh Format', 'Fill Sample Format') }}
              </button>
            </div>

            <!-- 1 Textarea for Quick Paste -->
            <textarea
              v-model="rawPasteText"
              rows="6"
              required
              class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition leading-relaxed"
              :placeholder="samplePlaceholder"
              @input="handlePastePreview"
            />

            <!-- Live Parsing & Auto-Mapping Indicator -->
            <div v-if="parsePreviewData" class="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Hasil Auto-Parse &amp; Auto-Mapping Department
                </span>
                <span class="text-xs font-bold text-brand-600">
                  Next No: {{ parsePreviewData.next_work_order_no }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[11px]">Input Department &rarr; Auto-Map</span>
                  <div class="mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span class="font-bold text-slate-700">{{ parsePreviewData.parsed.raw_department || '-' }}</span>
                    <span>&rarr;</span>
                    <span
                      v-if="parsePreviewData.matched_department"
                      class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-extrabold"
                    >
                      {{ parsePreviewData.matched_department.name }} (Matched)
                    </span>
                    <span
                      v-else-if="parsePreviewData.parsed.raw_department"
                      class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 font-bold"
                    >
                      Tidak ditemukan di sub-department
                    </span>
                  </div>
                </div>

                <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[11px]">Requested By</span>
                  <span class="font-bold text-slate-800 mt-0.5 block">
                    {{ parsePreviewData.parsed.requested_by || '-' }}
                  </span>
                </div>

                <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[11px]">Date Requested &rarr; Deadline (+2 Hari)</span>
                  <span class="font-bold text-slate-800 mt-0.5 block">
                    {{ parsePreviewData.parsed.date_requested_label || parsePreviewData.parsed.date_requested_raw || '-' }}
                    <template v-if="parsePreviewData.parsed.completion_deadline_label">
                      &rarr; <span class="text-brand-600">{{ parsePreviewData.parsed.completion_deadline_label }}</span>
                    </template>
                  </span>
                </div>

                <div class="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[11px]">Location Office</span>
                  <span class="font-bold text-slate-800 mt-0.5 block">
                    {{ parsePreviewData.parsed.location || '-' }}
                  </span>
                </div>
              </div>

              <!-- WARNING & MANUAL DEPARTMENT SELECTION WHEN SUB-DEPARTMENT DOES NOT MATCH -->
              <div
                v-if="parsePreviewData.requires_manual_department"
                class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5"
              >
                <div class="flex items-start gap-2 text-amber-800 text-xs font-bold">
                  <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Peringatan: Input Department "{{ parsePreviewData.parsed.raw_department }}" tidak cocok dengan sub_department manapun. Silakan pilih Department secara manual:
                  </span>
                </div>
                <select
                  v-model="manualDepartmentId"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 focus:border-brand-600 outline-none"
                >
                  <option value="">-- Pilih Department Manual --</option>
                  <option
                    v-for="dept in parsePreviewData.available_departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }} (Sub: {{ (dept.sub_departments || []).join(', ') || '-' }})
                  </option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                @click="addModalOpen = false"
              >
                {{ t('Batal', 'Cancel') }}
              </button>
              <button
                type="submit"
                :disabled="savingAdd"
                class="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition flex items-center gap-2"
              >
                <Check class="w-4 h-4" />
                <span>{{ savingAdd ? t('Menyimpan...', 'Saving...') : t('Simpan Work Order', 'Save Work Order') }}</span>
              </button>
            </div>
          </form>

          <!-- STEP 2: OUTPUT PREVIEW & TOMBOL COPY -->
          <div v-else class="p-6 space-y-5">
            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-emerald-950">
                    Work Order #{{ createdResult.work_order_no }} Tersimpan!
                  </h4>
                  <p class="text-xs text-emerald-700">
                    Departemen dipetakan ke <strong>{{ createdResult.department_name }}</strong> &bull; Deadline: <strong>{{ createdResult.completion_deadline_label }}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Preview Output Konfirmasi Work Order
                </span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 transition"
                  @click="copyOutputToClipboard"
                >
                  <Check v-if="copiedOutput" class="w-4 h-4" />
                  <Copy v-else class="w-4 h-4" />
                  <span>{{ copiedOutput ? 'Berhasil Disalin ke Clipboard!' : 'Copy ke Clipboard' }}</span>
                </button>
              </div>
              <pre class="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">{{ createdResult.copy_text }}</pre>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                @click="resetAddModalForAnother"
              >
                + Tambah Work Order Lainnya
              </button>
              <button
                type="button"
                class="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition"
                @click="addModalOpen = false"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ======================================================================= -->
    <!-- MODAL 2: MARK AS DONE (Wajib Isi Waktu Pengerjaan & Solution Case)      -->
    <!-- ======================================================================= -->
    <Teleport to="body">
      <div
        v-if="doneModalOpen && activeTicket"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="doneModalOpen = false"
      >
        <div class="bg-white rounded-3xl shadow-modal border border-slate-100 w-full max-w-lg overflow-hidden my-8">
          <div class="flex items-center justify-between px-6 py-5 bg-slate-50/70 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">
                  {{ t('Selesaikan Tiket (Done)', 'Complete Ticket (Done)') }} #{{ activeTicket.work_order_no }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ t('Wajib mengisi waktu pengerjaan dan solution case untuk memindahkan tiket ke Done.', 'Working duration and solution case are required to move ticket to Done.') }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              @click="doneModalOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="submitMarkDone">
            <!-- Tanggal Penyelesaian (Default: Hari Diakses) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  1. {{ t('Tanggal Penyelesaian *', 'Completion Date *') }}
                </label>
                <span class="text-[11px] font-semibold text-slate-400">
                  {{ t('Default: Hari ini', 'Default: Today') }}
                </span>
              </div>
              <input
                v-model="doneForm.completed_date"
                type="date"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </div>

            <!-- Durasi / Waktu Pengerjaan (Jam : Menit - Jam : Menit) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-700">
                  2. {{ t('Waktu Pengerjaan (Jam : Menit - Jam : Menit) *', 'Working Time (Hour : Min - Hour : Min) *') }}
                </label>
                <span
                  v-if="doneDurationSummary"
                  class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full"
                >
                  {{ doneDurationSummary }}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 sm:gap-3">
                <!-- Waktu Mulai (Jam : Menit) -->
                <div class="flex-1">
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
                    Waktu Mulai
                  </span>
                  <div class="flex items-center justify-center gap-1.5">
                    <input
                      v-model="doneTime.startHour"
                      type="number"
                      min="0"
                      max="23"
                      required
                      placeholder="Jam"
                      class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                      @blur="padTimeField(doneTime, 'startHour', 23)"
                    />
                    <span class="text-base font-extrabold text-slate-500">:</span>
                    <input
                      v-model="doneTime.startMinute"
                      type="number"
                      min="0"
                      max="59"
                      required
                      placeholder="Menit"
                      class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                      @blur="padTimeField(doneTime, 'startMinute', 59)"
                    />
                  </div>
                </div>

                <!-- Pemisah (-) -->
                <div class="pt-4 text-lg font-extrabold text-slate-400 select-none">
                  &mdash;
                </div>

                <!-- Waktu Selesai (Jam : Menit) -->
                <div class="flex-1">
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
                    Waktu Selesai
                  </span>
                  <div class="flex items-center justify-center gap-1.5">
                    <input
                      v-model="doneTime.endHour"
                      type="number"
                      min="0"
                      max="23"
                      required
                      placeholder="Jam"
                      class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                      @blur="padTimeField(doneTime, 'endHour', 23)"
                    />
                    <span class="text-base font-extrabold text-slate-500">:</span>
                    <input
                      v-model="doneTime.endMinute"
                      type="number"
                      min="0"
                      max="59"
                      required
                      placeholder="Menit"
                      class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                      @blur="padTimeField(doneTime, 'endMinute', 59)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                3. {{ t('Solution Case (Solusi yang Dilakukan) *', 'Solution Case (Resolution Performed) *') }}
              </label>
              <textarea
                v-model="doneForm.solution"
                rows="4"
                required
                :placeholder="t('Tuliskan langkah perbaikan atau solution case yang telah dilakukan...', 'Describe the technical solution case performed...')"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                @click="doneModalOpen = false"
              >
                {{ t('Batal', 'Cancel') }}
              </button>
              <button
                type="submit"
                :disabled="savingDone"
                class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
              >
                <Check class="w-4 h-4" />
                <span>{{ savingDone ? t('Menyimpan...', 'Saving...') : t('Simpan & Pindahkan ke Done', 'Save & Move to Done') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ======================================================================= -->
    <!-- MODAL 3: EDIT WORK ORDER (Opened from Detail Drawer Three-Dots Menu)    -->
    <!-- ======================================================================= -->
    <Teleport to="body">
      <div
        v-if="editModalOpen && activeTicket"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="editModalOpen = false"
      >
        <div class="bg-white rounded-3xl shadow-modal border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
          <div class="flex items-center justify-between px-6 py-5 bg-slate-50/70 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Pencil class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-extrabold text-slate-900">
                  {{ t('Edit Tiket', 'Edit Ticket') }} #{{ activeTicket.work_order_no }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ t('Perbarui status, detail pembuat, departemen, lokasi, dan catatan penyelesaian tiket.', 'Update ticket status, requester details, department, location, and resolution notes.') }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              @click="editModalOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form class="p-6 space-y-4 max-h-[78vh] overflow-y-auto" @submit.prevent="submitEditTicket">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('Nomor Tiket (Work Order No) *', 'Ticket Number (Work Order No) *') }}
                </label>
                <input
                  v-model="editForm.work_order_no"
                  type="text"
                  required
                  placeholder="IT01519"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-extrabold text-brand-600 focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('Nama Pembuat (Requested By) *', 'Requested By *') }}
                </label>
                <input
                  v-model="editForm.requested_by"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('Departemen *', 'Department *') }}
                </label>
                <select
                  v-model="editForm.department_id"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                  @change="onEditDeptChange"
                >
                  <option :value="null">{{ editForm.department_name || t('-- Pilih Departemen --', '-- Select Department --') }}</option>
                  <option v-for="d in departments" :key="d.id" :value="d.id">
                    {{ d.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('Tanggal Request *', 'Date Requested *') }}
                </label>
                <input
                  v-model="editForm.date_requested"
                  type="date"
                  required
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Completion Deadline</label>
                <input
                  v-model="editForm.completion_deadline"
                  type="date"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">Location Office *</label>
                <input
                  v-model="editForm.location"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5">
                  {{ t('Status Tiket *', 'Ticket Status *') }}
                </label>
                <select
                  v-model="editForm.status"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:bg-white focus:border-brand-600 outline-none"
                >
                  <option value="open">{{ t('Open (Belum Selesai)', 'Open (In Queue)') }}</option>
                  <option value="wo_issued">WO has Been Issued</option>
                  <option value="done">{{ t('Done (Selesai)', 'Done (Completed)') }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                {{ t('Deskripsi Case *', 'Case Description *') }}
              </label>
              <textarea
                v-model="editForm.description"
                rows="3"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
              />
            </div>

            <div v-if="editForm.status === 'done'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Tanggal Penyelesaian *
                  </label>
                  <span class="text-[11px] font-semibold text-slate-400">
                    Default: Hari diakses
                  </span>
                </div>
                <input
                  v-model="editForm.completed_date"
                  type="date"
                  required
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Durasi / Waktu Pengerjaan (Jam : Menit - Jam : Menit) *
                  </label>
                  <span
                    v-if="editDurationSummary"
                    class="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full"
                  >
                    {{ editDurationSummary }}
                  </span>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 sm:gap-3">
                  <!-- Waktu Mulai -->
                  <div class="flex-1">
                    <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
                      Waktu Mulai
                    </span>
                    <div class="flex items-center justify-center gap-1.5">
                      <input
                        v-model="editTime.startHour"
                        type="number"
                        min="0"
                        max="23"
                        required
                        placeholder="Jam"
                        class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 outline-none"
                        @blur="padTimeField(editTime, 'startHour', 23)"
                      />
                      <span class="text-base font-extrabold text-slate-500">:</span>
                      <input
                        v-model="editTime.startMinute"
                        type="number"
                        min="0"
                        max="59"
                        required
                        placeholder="Menit"
                        class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 outline-none"
                        @blur="padTimeField(editTime, 'startMinute', 59)"
                      />
                    </div>
                  </div>

                  <!-- Pemisah (-) -->
                  <div class="pt-4 text-lg font-extrabold text-slate-400 select-none">
                    &mdash;
                  </div>

                  <!-- Waktu Selesai -->
                  <div class="flex-1">
                    <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-center">
                      Waktu Selesai
                    </span>
                    <div class="flex items-center justify-center gap-1.5">
                      <input
                        v-model="editTime.endHour"
                        type="number"
                        min="0"
                        max="23"
                        required
                        placeholder="Jam"
                        class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 outline-none"
                        @blur="padTimeField(editTime, 'endHour', 23)"
                      />
                      <span class="text-base font-extrabold text-slate-500">:</span>
                      <input
                        v-model="editTime.endMinute"
                        type="number"
                        min="0"
                        max="59"
                        required
                        placeholder="Menit"
                        class="w-16 sm:w-20 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-center text-sm font-bold text-slate-800 focus:border-brand-600 outline-none"
                        @blur="padTimeField(editTime, 'endMinute', 59)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-xs font-bold text-slate-700">Solution Case / Catatan Penyelesaian *</label>
                  <span class="text-[11px] text-slate-400">Resolusi &amp; Catatan Internal</span>
                </div>
                <textarea
                  v-model="editForm.solution"
                  rows="3"
                  required
                  placeholder="Masukkan solusi pengerjaan..."
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>
            </div>

            <!-- Info warning when changing from Done to non-Done inside Edit form -->
            <div
              v-else-if="activeTicket.status === 'done' && editForm.status !== 'done'"
              class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs font-bold text-amber-800"
            >
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {{
                  t(
                    'Perhatian: Mengubah status dari Done ke status lain akan menghapus data waktu pengerjaan (durasi) dan solution case.',
                    'Note: Changing status from Done to another status will delete the working duration and solution case.'
                  )
                }}
              </span>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                @click="editModalOpen = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="savingEdit"
                class="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
              >
                <Check class="w-4 h-4" />
                <span>{{ savingEdit ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ======================================================================= -->
    <!-- RIGHT-SIDE DETAIL DRAWER (Matches Image 2 + Three-Dots Edit/Delete)     -->
    <!-- ======================================================================= -->
    <TicketDetailModal
      v-model="detailModalOpen"
      :ticket="activeTicket"
      :show-copy-format="true"
      :show-admin-actions="true"
      @edit="handleEditFromDetail"
      @delete="handleDeleteFromDetail"
      @change-status="handleStatusChangeFromDetail"
    />
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import {
  Plus,
  FileSpreadsheet,
  Search,
  X,
  MapPin,
  CheckCircle2,
  Eye,
  Pencil,
  ClipboardPaste,
  Sparkles,
  AlertTriangle,
  Check,
  Copy,
  Calendar,
  LayoutGrid,
  Table2,
  ArrowRight,
  Clock,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { apiFetch } = useAuth()
const { t } = useLang()

const viewMode = ref<'card' | 'table'>('card')
const mobileActiveStatus = ref<'open' | 'wo_issued' | 'done'>('open')
const tickets = ref<any[]>([])
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
const filterStatus = ref('')
const filterDate = ref('')
const perPage = ref(10)
const loading = ref(false)
const exporting = ref(false)

// Drag & Drop state for Kanban Card View
const draggingTicket = ref<any | null>(null)
const dragOverStatus = ref<string | null>(null)
const pointerDrag = reactive({
  pending: false,
  active: false,
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  width: 300,
})

// Modals state
const addModalOpen = ref(false)
const doneModalOpen = ref(false)
const editModalOpen = ref(false)
const detailModalOpen = ref(false)
const activeTicket = ref<any | null>(null)

// Kanban Columns grouped by status
const kanbanColumns = computed(() => {
  const all = tickets.value || []
  return [
    {
      status: 'open',
      title: t('Baru / Open', 'New / Open'),
      mobileTabLabel: 'Open',
      dotClass: 'bg-brand-600',
      countBadgeClass: 'bg-brand-50 text-brand-600',
      items: all.filter((i) => i.status === 'open'),
    },
    {
      status: 'wo_issued',
      title: 'WO has Been Issued',
      mobileTabLabel: 'Issued',
      dotClass: 'bg-rose-500',
      countBadgeClass: 'bg-rose-100 text-rose-700',
      items: all.filter((i) => i.status === 'wo_issued'),
    },
    {
      status: 'done',
      title: t('Selesai (Done)', 'Resolved (Done)'),
      mobileTabLabel: 'Done',
      dotClass: 'bg-emerald-500',
      countBadgeClass: 'bg-emerald-100 text-emerald-700',
      items: all.filter((i) => i.status === 'done'),
    },
  ]
})

// Quick Paste state
const samplePlaceholder = `Department: finance
Requested By: alfin
Date Requested: 19 November 2026
Description of Work Requested: printer cant work properly
Location: Head Office`

const rawPasteText = ref('')
const parsePreviewData = ref<any | null>(null)
const manualDepartmentId = ref<number | string>('')
const savingAdd = ref(false)
const createdResult = ref<any | null>(null)
const copiedOutput = ref(false)

const getTodayLocalDate = (): string => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDateShortIndo = (ymd: string): string => {
  if (!ymd) return ''
  const parts = ymd.split('-')
  if (parts.length !== 3) return ymd
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const mIdx = parseInt(parts[1], 10) - 1
  return `${parts[2]} ${months[mIdx] || parts[1]} ${parts[0]}`
}

// Done form & structured time range (Jam : Menit - Jam : Menit)
const doneForm = reactive({
  completed_date: getTodayLocalDate(),
  duration: '',
  solution: '',
})
const doneTime = reactive({
  startHour: '09',
  startMinute: '00',
  endHour: '10',
  endMinute: '00',
})
const savingDone = ref(false)

// Edit form & structured time range (Jam : Menit - Jam : Menit)
const editForm = reactive({
  work_order_no: '',
  requested_by: '',
  department_id: null as number | null,
  department_name: '',
  raw_department: '',
  date_requested: '',
  completion_deadline: '',
  completed_date: getTodayLocalDate(),
  location: '',
  description: '',
  status: 'open',
  duration: '',
  solution: '',
})
const editTime = reactive({
  startHour: '',
  startMinute: '',
  endHour: '',
  endMinute: '',
})
const savingEdit = ref(false)

const padTwo = (val: string | number) => {
  const num = parseInt(String(val), 10)
  if (isNaN(num) || num < 0) return '00'
  return String(num).padStart(2, '0')
}

const padTimeField = (
  target: { startHour: string | number; startMinute: string | number; endHour: string | number; endMinute: string | number },
  field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute',
  max: number
) => {
  const raw = String(target[field] ?? '').trim()
  if (raw === '') return
  let num = parseInt(raw, 10)
  if (isNaN(num) || num < 0) num = 0
  if (num > max) num = max
  target[field] = String(num).padStart(2, '0')
}

const buildDurationFromTime = (
  tObj: {
    startHour: string | number
    startMinute: string | number
    endHour: string | number
    endMinute: string | number
  },
  completedDate = ''
): string => {
  const shRaw = String(tObj.startHour ?? '').trim()
  const smRaw = String(tObj.startMinute ?? '').trim()
  const ehRaw = String(tObj.endHour ?? '').trim()
  const emRaw = String(tObj.endMinute ?? '').trim()

  if (shRaw === '' && smRaw === '' && ehRaw === '' && emRaw === '') {
    return ''
  }

  const sh = Math.min(23, Math.max(0, parseInt(shRaw || '0', 10) || 0))
  const sm = Math.min(59, Math.max(0, parseInt(smRaw || '0', 10) || 0))
  const eh = Math.min(23, Math.max(0, parseInt(ehRaw || '0', 10) || 0))
  const em = Math.min(59, Math.max(0, parseInt(emRaw || '0', 10) || 0))

  const rangeStr = `${padTwo(sh)}:${padTwo(sm)} - ${padTwo(eh)}:${padTwo(em)}`

  let diffMinutes = eh * 60 + em - (sh * 60 + sm)
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60
  }

  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} Jam`)
  if (mins > 0) parts.push(`${mins} Menit`)
  const diffLabel = parts.length > 0 ? ` (${parts.join(' ')})` : ''
  const datePrefix = completedDate ? `${formatDateShortIndo(completedDate)} • ` : ''

  return `${datePrefix}${rangeStr}${diffLabel}`
}

const parseDurationToTime = (
  durationStr: string | null | undefined,
  target: { startHour: string; startMinute: string; endHour: string; endMinute: string },
  defaultValues = { sh: '', sm: '', eh: '', em: '' }
) => {
  const raw = (durationStr || '').trim()
  const match = raw.match(/(\d{1,2})\s*:\s*(\d{1,2})\s*-\s*(\d{1,2})\s*:\s*(\d{1,2})/)
  if (match) {
    target.startHour = padTwo(match[1])
    target.startMinute = padTwo(match[2])
    target.endHour = padTwo(match[3])
    target.endMinute = padTwo(match[4])
  } else {
    target.startHour = defaultValues.sh
    target.startMinute = defaultValues.sm
    target.endHour = defaultValues.eh
    target.endMinute = defaultValues.em
  }
}

const doneDurationSummary = computed(() => buildDurationFromTime(doneTime, doneForm.completed_date))
const editDurationSummary = computed(() => buildDurationFromTime(editTime, editForm.completed_date))

let searchTimer: ReturnType<typeof setTimeout> | null = null
let parseTimer: ReturnType<typeof setTimeout> | null = null

const fetchDepartments = async () => {
  try {
    const res = await apiFetch('/admin/departments', { params: { all: 1 } })
    departments.value = res.data || []
  } catch (err) {
    console.error('Failed to load departments:', err)
  }
}

const fetchWorkOrders = async (page = 1) => {
  loading.value = true
  try {
    const effectivePerPage = viewMode.value === 'card' ? 250 : perPage.value
    const res = await apiFetch('/admin/work-orders', {
      params: {
        page: viewMode.value === 'card' ? 1 : page,
        per_page: effectivePerPage,
        search: searchQuery.value,
        status: filterStatus.value,
        date_from: filterDate.value,
        date_to: filterDate.value,
      },
    })
    tickets.value = res.data
    meta.value = res.meta

    // Keep activeTicket in sync if detail drawer is open
    if (activeTicket.value) {
      const updated = (res.data || []).find((i: any) => i.id === activeTicket.value.id)
      if (updated) {
        activeTicket.value = updated
      }
    }
  } catch (err) {
    console.error('Failed to load work orders:', err)
  } finally {
    loading.value = false
  }
}

const switchViewMode = (mode: 'card' | 'table') => {
  if (viewMode.value === mode) return
  viewMode.value = mode
  fetchWorkOrders(1)
}

const changePerPage = (newPerPage: number) => {
  perPage.value = newPerPage
  fetchWorkOrders(1)
}

const handleSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchWorkOrders(1)
  }, 300)
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterDate.value = ''
  fetchWorkOrders(1)
}

const changePage = (page: number) => {
  fetchWorkOrders(page)
}

// =========================================================================
// KANBAN DRAG & DROP AND STATUS TRANSITION LOGIC (Pointer + HTML5 Support)
// =========================================================================
const findKanbanColumnAtPoint = (clientX: number, clientY: number): string | null => {
  if (!import.meta.client) return null
  const cols = document.querySelectorAll<HTMLElement>('[data-kanban-status]')
  for (const col of cols) {
    const rect = col.getBoundingClientRect()
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return col.getAttribute('data-kanban-status')
    }
  }
  return null
}

const onCardPointerDown = (event: PointerEvent, item: any) => {
  // Ignore right-clicks or clicks on buttons/interactive elements
  if (event.button !== 0 && event.pointerType === 'mouse') return
  const targetEl = event.target as HTMLElement | null
  if (targetEl?.closest('button, a, input, select, textarea, [data-no-drag]')) {
    return
  }

  const cardEl = event.currentTarget as HTMLElement
  const rect = cardEl.getBoundingClientRect()

  draggingTicket.value = item
  pointerDrag.pending = true
  pointerDrag.active = false
  pointerDrag.startX = event.clientX
  pointerDrag.startY = event.clientY
  pointerDrag.x = event.clientX
  pointerDrag.y = event.clientY
  pointerDrag.offsetX = event.clientX - rect.left
  pointerDrag.offsetY = event.clientY - rect.top
  pointerDrag.width = rect.width

  window.addEventListener('pointermove', onWindowPointerMove)
  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerUp)
}

const onWindowPointerMove = (event: PointerEvent) => {
  if (!pointerDrag.pending || !draggingTicket.value) return

  const dx = event.clientX - pointerDrag.startX
  const dy = event.clientY - pointerDrag.startY

  if (!pointerDrag.active) {
    if (Math.hypot(dx, dy) < 6) return
    pointerDrag.active = true
  }

  pointerDrag.x = event.clientX
  pointerDrag.y = event.clientY

  // Auto-scroll viewport slightly if dragging near top or bottom edge
  const edgeThreshold = 60
  if (event.clientY < edgeThreshold) {
    window.scrollBy({ top: -10, behavior: 'auto' })
  } else if (window.innerHeight - event.clientY < edgeThreshold) {
    window.scrollBy({ top: 10, behavior: 'auto' })
  }

  dragOverStatus.value = findKanbanColumnAtPoint(event.clientX, event.clientY)
}

const cleanupPointerDrag = () => {
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerUp)
  pointerDrag.pending = false
  pointerDrag.active = false
}

const onWindowPointerUp = async (event: PointerEvent) => {
  const wasActive = pointerDrag.active
  const ticket = draggingTicket.value
  const targetStatus = wasActive
    ? findKanbanColumnAtPoint(event.clientX, event.clientY) || dragOverStatus.value
    : null

  cleanupPointerDrag()
  draggingTicket.value = null
  dragOverStatus.value = null

  if (wasActive && ticket && targetStatus && ticket.status !== targetStatus) {
    await handleStatusTransition(ticket, targetStatus)
  }
}

const onDragOverColumn = (event: DragEvent, status: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverStatus.value = status
}

const onDragLeaveColumn = (event: DragEvent, status: string) => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
    return
  }
  if (dragOverStatus.value === status) {
    dragOverStatus.value = null
  }
}

const onDropColumn = async (_event: DragEvent, targetStatus: string) => {
  const ticket = draggingTicket.value
  draggingTicket.value = null
  dragOverStatus.value = null

  if (!ticket || ticket.status === targetStatus) return
  await handleStatusTransition(ticket, targetStatus)
}

const handleStatusChangeFromDetail = async (payload: { ticket: Record<string, any>; newStatus: string }) => {
  await handleStatusTransition(payload.ticket, payload.newStatus)
}

const isTicketPastDeadline = (ticket: any): boolean => {
  if (!ticket) return false
  const today = getTodayLocalDate()
  if (ticket.completion_deadline && String(ticket.completion_deadline) < today) {
    return true
  }
  if (ticket.date_requested && String(ticket.date_requested) < today) {
    return true
  }
  return false
}

const handleStatusTransition = async (ticket: any, targetStatus: string) => {
  if (!ticket || ticket.status === targetStatus) return

  // RULE 1: Moving TO 'done' requires entering Solution Case and Working Time
  if (targetStatus === 'done') {
    openDoneModal(ticket)
    return
  }

  const pastDeadline = isTicketPastDeadline(ticket)

  // RULE 2: From 'open' cannot manually move to 'wo_issued' (it is automatic when overdue)
  if (ticket.status === 'open' && targetStatus === 'wo_issued') {
    await Swal.fire({
      icon: 'info',
      title: t('Status Otomatis', 'Automatic Status'),
      text: t(
        'Tiket dari Open tidak dapat dipindahkan manual ke "WO has Been Issued". Status tersebut otomatis aktif jika tiket Open melewati deadline.',
        'Tickets in Open cannot be manually moved to "WO has Been Issued". That status triggers automatically when an Open ticket passes its deadline.'
      ),
      confirmButtonColor: '#042B4F',
    })
    return
  }

  // RULE 3: From 'wo_issued' cannot move back to 'open' when already past deadline
  if (ticket.status === 'wo_issued' && targetStatus === 'open' && pastDeadline) {
    await Swal.fire({
      icon: 'info',
      title: t('Sudah Melewati Deadline', 'Already Past Deadline'),
      text: t(
        `Tiket #${ticket.work_order_no} sudah melewati deadline sehingga tetap berada di status "WO has Been Issued".`,
        `Ticket #${ticket.work_order_no} is already past its deadline and remains in "WO has Been Issued".`
      ),
      confirmButtonColor: '#042B4F',
    })
    return
  }

  // RULE 4: From 'done', can only move to 'wo_issued' if past deadline
  if (ticket.status === 'done' && targetStatus === 'wo_issued' && !pastDeadline) {
    await Swal.fire({
      icon: 'info',
      title: t('Belum Melewati Deadline', 'Not Past Deadline'),
      text: t(
        `Tiket #${ticket.work_order_no} belum melewati deadline sehingga tidak dapat dipindahkan ke "WO has Been Issued". Silakan geser ke kolom Baru / Open.`,
        `Ticket #${ticket.work_order_no} has not passed its deadline so it cannot be moved to "WO has Been Issued". Please move it to New / Open.`
      ),
      confirmButtonColor: '#042B4F',
    })
    return
  }

  // Determine effective target status: if past deadline and dropped into 'open', automatically goes to 'wo_issued'
  const effectiveTargetStatus = pastDeadline ? 'wo_issued' : 'open'
  const effectiveLabel = effectiveTargetStatus === 'wo_issued' ? 'WO has Been Issued' : t('Baru / Open', 'New / Open')

  // RULE 5: Moving FROM 'done' to another status shows warning that time & solution will be deleted
  if (ticket.status === 'done') {
    const autoRedirectNote =
      targetStatus === 'open' && pastDeadline
        ? t(
            `Tiket #${ticket.work_order_no} sudah melewati deadline sehingga akan otomatis dipindahkan ke "WO has Been Issued". Apakah Anda yakin? Waktu pengerjaan (durasi) dan solution case akan dihapus.`,
            `Ticket #${ticket.work_order_no} is past its deadline and will automatically move to "WO has Been Issued". Are you sure? Working duration and solution case will be deleted.`
          )
        : t(
            `Apakah Anda yakin ingin memindahkan tiket #${ticket.work_order_no} ke "${effectiveLabel}"? Jika dipindahkan, maka waktu pengerjaan (durasi) dan solution case akan dihapus.`,
            `Are you sure you want to move ticket #${ticket.work_order_no} to "${effectiveLabel}"? Moving it will delete its working duration and solution case.`
          )

    const confirmMove = await Swal.fire({
      icon: 'warning',
      title: t('Pindahkan dari Status Selesai?', 'Move from Done Status?'),
      text: autoRedirectNote,
      showCancelButton: true,
      confirmButtonText: t('Ya, Pindahkan & Hapus', 'Yes, Move & Delete'),
      cancelButtonText: t('Batal', 'Cancel'),
      confirmButtonColor: '#042B4F',
      cancelButtonColor: '#64748B',
      reverseButtons: true,
    })

    if (!confirmMove.isConfirmed) return
  }

  // Optimistically move card in UI immediately to effectiveTargetStatus
  const idx = tickets.value.findIndex((i) => i.id === ticket.id)
  const previousSnapshot = idx !== -1 ? { ...tickets.value[idx] } : null
  if (idx !== -1) {
    tickets.value[idx] = {
      ...tickets.value[idx],
      status: effectiveTargetStatus,
      status_label: effectiveTargetStatus === 'wo_issued' ? 'WO has Been Issued' : 'Open',
      duration: null,
      solution: null,
      completed_at: null,
      completed_date: null,
      completed_date_label: null,
    }
  }

  // Execute status transition on backend
  try {
    const res = await apiFetch<{ message: string; data: any }>(`/admin/work-orders/${ticket.id}`, {
      method: 'PUT',
      body: {
        work_order_no: ticket.work_order_no,
        requested_by: ticket.requested_by,
        department_id: ticket.department_id || null,
        department_name: ticket.department_name || ticket.department,
        raw_department: ticket.raw_department || ticket.department_name || ticket.department,
        date_requested: ticket.date_requested,
        completion_deadline: ticket.completion_deadline,
        location: ticket.location,
        description: ticket.description,
        status: effectiveTargetStatus,
        duration: null,
        solution: null,
      },
    })

    if (idx !== -1 && res.data) {
      tickets.value[idx] = res.data
    }
    if (activeTicket.value?.id === ticket.id && res.data) {
      activeTicket.value = res.data
    }

    await fetchWorkOrders(meta.value.current_page)
  } catch (err: any) {
    if (idx !== -1 && previousSnapshot) {
      tickets.value[idx] = previousSnapshot
    }
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Memindahkan Status', 'Failed to Move Status'),
      text: err?.data?.message || t('Terjadi kesalahan saat memperbarui status tiket.', 'An error occurred while updating ticket status.'),
      confirmButtonColor: '#042B4F',
    })
  }
}

// =========================================================================
// ADD WORK ORDER (QUICK PASTE)
// =========================================================================
const openAddModal = () => {
  rawPasteText.value = ''
  parsePreviewData.value = null
  manualDepartmentId.value = ''
  createdResult.value = null
  copiedOutput.value = false
  addModalOpen.value = true
}

const resetAddModalForAnother = () => {
  rawPasteText.value = ''
  parsePreviewData.value = null
  manualDepartmentId.value = ''
  createdResult.value = null
  copiedOutput.value = false
}

const fillSamplePaste = () => {
  rawPasteText.value = samplePlaceholder
  triggerParsePreview()
}

const handlePastePreview = () => {
  if (parseTimer) clearTimeout(parseTimer)
  parseTimer = setTimeout(() => {
    triggerParsePreview()
  }, 250)
}

const triggerParsePreview = async () => {
  if (!rawPasteText.value.trim()) {
    parsePreviewData.value = null
    return
  }
  try {
    const res = await apiFetch('/admin/work-orders/parse', {
      method: 'POST',
      body: { raw_text: rawPasteText.value },
    })
    parsePreviewData.value = res
    if (res.matched_department) {
      manualDepartmentId.value = ''
    }
  } catch (err) {
    console.error('Parse preview error:', err)
  }
}

const submitQuickPaste = async () => {
  savingAdd.value = true
  try {
    const res = await apiFetch<{ message: string; data: any }>('/admin/work-orders', {
      method: 'POST',
      body: {
        raw_text: rawPasteText.value,
        manual_department_id: manualDepartmentId.value || null,
      },
    })
    createdResult.value = res.data
    await fetchWorkOrders(1)
  } catch (err: any) {
    if (err?.data?.requires_manual_department) {
      await triggerParsePreview()
      await Swal.fire({
        icon: 'warning',
        title: 'Pilih Department Manual',
        text: err.data.message,
        confirmButtonColor: '#042B4F',
      })
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Work Order',
        text: err?.data?.message || 'Pastikan format teks memiliki Department, Requested By, Date Requested, Description, dan Location.',
        confirmButtonColor: '#042B4F',
      })
    }
  } finally {
    savingAdd.value = false
  }
}

const copyOutputToClipboard = async () => {
  if (!createdResult.value?.copy_text || !import.meta.client) return
  await navigator.clipboard.writeText(createdResult.value.copy_text)
  copiedOutput.value = true
  setTimeout(() => {
    copiedOutput.value = false
  }, 2500)
}

// =========================================================================
// MARK AS DONE MODAL
// =========================================================================
const openDoneModal = (item: any) => {
  activeTicket.value = item
  doneForm.completed_date = item.completed_date || getTodayLocalDate()
  parseDurationToTime(item.duration, doneTime, { sh: '09', sm: '00', eh: '10', em: '00' })
  doneForm.duration = buildDurationFromTime(doneTime, doneForm.completed_date)
  doneForm.solution = item.solution || ''
  doneModalOpen.value = true
}

const submitMarkDone = async () => {
  if (!activeTicket.value) return
  doneForm.duration = buildDurationFromTime(doneTime, doneForm.completed_date)
  savingDone.value = true
  try {
    const res = await apiFetch<{ message: string; data: any }>(`/admin/work-orders/${activeTicket.value.id}/done`, {
      method: 'POST',
      body: { ...doneForm },
    })
    doneModalOpen.value = false
    if (res.data) {
      activeTicket.value = res.data
    }
    await fetchWorkOrders(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: 'Tiket Selesai (Done)',
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: err?.data?.message || 'Pastikan durasi dan solusi telah diisi.',
      confirmButtonColor: '#042B4F',
    })
  } finally {
    savingDone.value = false
  }
}

// =========================================================================
// DETAIL DRAWER & THREE-DOTS (⋮) EDIT / DELETE ACTIONS
// =========================================================================
const openDetailModal = (item: any) => {
  activeTicket.value = item
  detailModalOpen.value = true
}

const handleEditFromDetail = (item: any) => {
  detailModalOpen.value = false
  openEditModal(item)
}

const handleDeleteFromDetail = async (item: any) => {
  await handleDelete(item)
}

// Edit Modal
const openEditModal = (item: any) => {
  activeTicket.value = item
  editForm.work_order_no = item.work_order_no || ''
  editForm.requested_by = item.requested_by || ''
  editForm.department_id = item.department_id || null
  editForm.department_name = item.department_name || item.department || ''
  editForm.raw_department = item.raw_department || ''
  editForm.date_requested = item.date_requested || ''
  editForm.completion_deadline = item.completion_deadline || ''
  editForm.completed_date = item.completed_date || getTodayLocalDate()
  editForm.location = item.location || ''
  editForm.description = item.description || ''
  editForm.status = item.status || 'open'
  editForm.duration = item.duration || ''
  parseDurationToTime(item.duration, editTime, { sh: '09', sm: '00', eh: '10', em: '00' })
  editForm.solution = item.solution || ''
  editModalOpen.value = true
}

const onEditDeptChange = () => {
  const found = departments.value.find((d) => d.id === editForm.department_id)
  if (found) {
    editForm.department_name = found.name
  }
}

const submitEditTicket = async () => {
  if (!activeTicket.value) return

  // Confirm if moving away from Done in Edit Modal
  if (activeTicket.value.status === 'done' && editForm.status !== 'done') {
    const confirmMove = await Swal.fire({
      icon: 'warning',
      title: t('Pindahkan dari Status Done?', 'Move from Done Status?'),
      text: t(
        'Apakah Anda yakin ingin mengubah status dari Done? Jika dilanjutkan, waktu pengerjaan (durasi) dan solution case akan dihapus.',
        'Are you sure you want to change status from Done? Continuing will delete the working duration and solution case.'
      ),
      showCancelButton: true,
      confirmButtonText: t('Ya, Ubah & Hapus Solusi', 'Yes, Change & Delete Solution'),
      cancelButtonText: t('Batal', 'Cancel'),
      confirmButtonColor: '#042B4F',
      cancelButtonColor: '#64748B',
      reverseButtons: true,
    })
    if (!confirmMove.isConfirmed) return
  }

  if (editForm.status === 'done') {
    const formattedTime = buildDurationFromTime(editTime, editForm.completed_date)
    editForm.duration = formattedTime
    if (!editForm.duration || !editForm.solution.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: t('Data Belum Lengkap', 'Incomplete Data'),
        text: t('Saat status Done, waktu pengerjaan dan solution case wajib diisi.', 'Working duration and solution case are required when status is Done.'),
        confirmButtonColor: '#042B4F',
      })
      return
    }
  } else {
    editForm.duration = ''
    editForm.solution = ''
  }

  savingEdit.value = true
  try {
    const res = await apiFetch<{ message: string; data: any }>(`/admin/work-orders/${activeTicket.value.id}`, {
      method: 'PUT',
      body: { ...editForm },
    })
    editModalOpen.value = false
    if (res.data) {
      activeTicket.value = res.data
    }
    await fetchWorkOrders(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil Diperbarui',
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Memperbarui Tiket',
      text: err?.data?.message || 'Periksa kembali input Anda.',
      confirmButtonColor: '#042B4F',
    })
  } finally {
    savingEdit.value = false
  }
}

// Delete with SweetAlert
const handleDelete = async (item: any) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus Work Order?',
    text: `Apakah Anda yakin untuk menghapus tiket #${item.work_order_no}?`,
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#E11D48',
    cancelButtonColor: '#64748B',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  try {
    const res = await apiFetch<{ message: string }>(`/admin/work-orders/${item.id}`, {
      method: 'DELETE',
    })
    detailModalOpen.value = false
    activeTicket.value = null
    await fetchWorkOrders(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: 'Terhapus',
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1600,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus',
      text: err?.data?.message || 'Terjadi kesalahan saat menghapus data.',
      confirmButtonColor: '#042B4F',
    })
  }
}

// Export Excel (.xlsx)
const exportToExcel = async () => {
  exporting.value = true
  try {
    const res = await apiFetch<{ data: any[] }>('/admin/work-orders/export', {
      params: {
        search: searchQuery.value,
        status: filterStatus.value,
        date_from: filterDate.value,
        date_to: filterDate.value,
      },
    })

    const rows = (res.data || []).map((wo, idx) => ({
      'No': idx + 1,
      'Work Order No': wo.work_order_no,
      'Nama Pembuat': wo.requested_by,
      'Departemen': wo.department_name || wo.department,
      'Sub-Departemen Input': wo.raw_department || '-',
      'Tanggal Request': wo.date_requested_label || wo.date_requested,
      'Completion Deadline': wo.completion_deadline_label || wo.completion_deadline,
      'Location Office': wo.location,
      'Status': wo.status_label || (wo.status === 'done' ? 'Done' : wo.status === 'wo_issued' ? 'WO has Been Issued' : 'Open'),
      'Durasi Pengerjaan': wo.duration || '-',
      'Deskripsi Case': wo.description,
      'Solution Case': wo.solution || '-',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 },
      { wch: 10 },
      { wch: 18 },
      { wch: 45 },
      { wch: 45 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Orders')

    const dateStamp = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(workbook, `BSHsupport_Work_Orders_${dateStamp}.xlsx`)
  } catch (err) {
    console.error('Export failed:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Mengekspor Excel',
      text: 'Terjadi kesalahan saat mengekspor data ke Excel.',
      confirmButtonColor: '#042B4F',
    })
  } finally {
    exporting.value = false
  }
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
  fetchDepartments()
  fetchWorkOrders(1)
})

onBeforeUnmount(() => {
  cleanupPointerDrag()
})
</script>

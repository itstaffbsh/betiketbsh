<template>
  <div class="space-y-6">
    <!-- Page Title Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
        {{ t('Manajemen Work Order (Tiket)', 'Work Order (Ticket) Management') }}
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        {{
          t(
            'Kelola tiket masuk dengan fitur Quick Paste & Auto-Parse, update status penyelesaian, dan ekspor laporan Excel.',
            'Manage incoming tickets with Quick Paste & Auto-Parse, update resolution status, and export Excel reports.'
          )
        }}
      </p>
    </div>

    <!-- MAIN CARD -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <!-- TOP BAR: Add Work Order & Export Excel on LEFT; Search & Filter on RIGHT -->
      <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
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

          <!-- Optional Date Filter (> 480px: full input; <= 480px: calendar icon only without dd/mm/yyyy) -->
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

      <!-- WORK ORDER TABLE -->
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

              <!-- 6. Aksi: Done, Detail, Edit, Delete -->
              <td class="py-4 px-6 text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end gap-1.5">
                  <!-- Tombol Done -->
                  <button
                    type="button"
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition',
                      item.status === 'done'
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    ]"
                    title="Tandai Selesai (Done)"
                    @click="openDoneModal(item)"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>

                  <!-- Tombol Detail -->
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition"
                    title="Lihat Detail"
                    @click="openDetailModal(item)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>

                  <!-- Tombol Edit -->
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    title="Edit Tiket"
                    @click="openEditModal(item)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <!-- Tombol Delete -->
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                    title="Hapus Tiket"
                    @click="handleDelete(item)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
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
                    Departemen dipetakan ke <strong>{{ createdResult.department_name }}</strong> • Deadline: <strong>{{ createdResult.completion_deadline_label }}</strong>
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
    <!-- MODAL 2: MARK AS DONE (Durasi / Waktu Pengerjaan & Solusi)              -->
    <!-- ======================================================================= -->
    <Teleport to="body">
      <div
        v-if="doneModalOpen && activeTicket"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
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
                  {{ t('Selesaikan Tiket', 'Complete Ticket') }} #{{ activeTicket.work_order_no }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ t('Isi durasi waktu pengerjaan dan solusi teknis yang dilakukan.', 'Enter the working time duration and technical resolution performed.') }}
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
                  2. {{ t('Durasi / Waktu Pengerjaan (Jam : Menit - Jam : Menit) *', 'Working Duration (Hour : Min - Hour : Min) *') }}
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
                3. {{ t('Solusi yang Dilakukan *', 'Resolution Performed *') }}
              </label>
              <textarea
                v-model="doneForm.solution"
                rows="4"
                required
                :placeholder="t('Tuliskan langkah perbaikan atau solusi teknis yang telah dilakukan...', 'Describe the technical resolution or steps performed...')"
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
                <span>{{ savingDone ? t('Menyimpan...', 'Saving...') : t('Simpan & Tandai Done', 'Save & Mark as Done') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ======================================================================= -->
    <!-- MODAL 3: EDIT WORK ORDER (Matches Image 2 "Edit Ticket #233")           -->
    <!-- ======================================================================= -->
    <Teleport to="body">
      <div
        v-if="editModalOpen && activeTicket"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="editModalOpen = false"
      >
        <div class="bg-white rounded-3xl shadow-modal border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
          <!-- Header matching Image 2 -->
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

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Tanggal Penyelesaian
                  </label>
                  <span class="text-[11px] font-semibold text-slate-400">
                    Default: Hari diakses
                  </span>
                </div>
                <input
                  v-model="editForm.completed_date"
                  type="date"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>

              <div class="sm:col-span-2">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700">
                    Durasi / Waktu Pengerjaan (Jam : Menit - Jam : Menit)
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
                  <label class="text-xs font-bold text-slate-700">Solution Case / Catatan Penyelesaian</label>
                  <span class="text-[11px] text-slate-400">Resolusi &amp; Catatan Internal</span>
                </div>
                <textarea
                  v-model="editForm.solution"
                  rows="3"
                  placeholder="Masukkan solusi pengerjaan..."
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 outline-none"
                />
              </div>
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

    <!-- MODAL 4: DETAIL WORK ORDER -->
    <TicketDetailModal v-model="detailModalOpen" :ticket="activeTicket" :show-copy-format="true" />
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
  Trash2,
  ClipboardPaste,
  Sparkles,
  AlertTriangle,
  Check,
  Copy,
  Calendar,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { apiFetch } = useAuth()
const { t } = useLang()

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

// Modals state
const addModalOpen = ref(false)
const doneModalOpen = ref(false)
const editModalOpen = ref(false)
const detailModalOpen = ref(false)
const activeTicket = ref<any | null>(null)

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
  t: {
    startHour: string | number
    startMinute: string | number
    endHour: string | number
    endMinute: string | number
  },
  completedDate = ''
): string => {
  const shRaw = String(t.startHour ?? '').trim()
  const smRaw = String(t.startMinute ?? '').trim()
  const ehRaw = String(t.endHour ?? '').trim()
  const emRaw = String(t.endMinute ?? '').trim()

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
    const res = await apiFetch('/admin/work-orders', {
      params: {
        page,
        per_page: perPage.value,
        search: searchQuery.value,
        status: filterStatus.value,
        date_from: filterDate.value,
        date_to: filterDate.value,
      },
    })
    tickets.value = res.data
    meta.value = res.meta
  } catch (err) {
    console.error('Failed to load work orders:', err)
  } finally {
    loading.value = false
  }
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

// Add Work Order (Quick Paste)
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
        confirmButtonColor: '#4F46E5',
      })
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Work Order',
        text: err?.data?.message || 'Pastikan format teks memiliki Department, Requested By, Date Requested, Description, dan Location.',
        confirmButtonColor: '#4F46E5',
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

// Mark as Done
const openDoneModal = (item: any) => {
  activeTicket.value = item
  // Default tanggal penyelesaian ke hari diakses (hari ini)
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
    const res = await apiFetch<{ message: string }>(`/admin/work-orders/${activeTicket.value.id}/done`, {
      method: 'POST',
      body: { ...doneForm },
    })
    doneModalOpen.value = false
    await fetchWorkOrders(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: 'Tiket Selesai (Done)',
      text: res.message,
      confirmButtonColor: '#4F46E5',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: err?.data?.message || 'Pastikan durasi dan solusi telah diisi.',
      confirmButtonColor: '#4F46E5',
    })
  } finally {
    savingDone.value = false
  }
}

// Detail Modal
const openDetailModal = (item: any) => {
  activeTicket.value = item
  detailModalOpen.value = true
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
  parseDurationToTime(item.duration, editTime, { sh: '', sm: '', eh: '', em: '' })
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
  const formattedTime = buildDurationFromTime(editTime, editForm.completed_date)
  if (formattedTime) {
    editForm.duration = formattedTime
  }
  savingEdit.value = true
  try {
    const res = await apiFetch<{ message: string }>(`/admin/work-orders/${activeTicket.value.id}`, {
      method: 'PUT',
      body: { ...editForm },
    })
    editModalOpen.value = false
    await fetchWorkOrders(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil Diperbarui',
      text: res.message,
      confirmButtonColor: '#4F46E5',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Memperbarui Tiket',
      text: err?.data?.message || 'Periksa kembali input Anda.',
      confirmButtonColor: '#4F46E5',
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
    text: 'Apakah Anda yakin untuk menghapus data ini?',
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
    await fetchWorkOrders(meta.value.current_page)
    await Swal.fire({
      icon: 'success',
      title: 'Terhapus',
      text: res.message,
      confirmButtonColor: '#4F46E5',
      timer: 1600,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: 'Gagal Menghapus',
      text: err?.data?.message || 'Terjadi kesalahan saat menghapus data.',
      confirmButtonColor: '#4F46E5',
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
      confirmButtonColor: '#4F46E5',
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
</script>

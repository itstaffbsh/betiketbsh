<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && ticket"
        class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
        @click.self="closeDrawer"
      >
        <!-- RIGHT-SIDE SLIDE-OVER DETAIL DRAWER (Matches Image 2) -->
        <Transition
          appear
          enter-active-class="transform transition duration-250 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transform transition duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            v-if="modelValue && ticket"
            class="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col overflow-hidden"
          >
            <!-- TOP BAR: Status Pill on Left; Three-Dots (⋮) Dropdown & Close (X) Button on Right -->
            <div class="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <!-- Left: Status Badge / Status Dropdown Switcher (if admin actions enabled) -->
              <div class="flex items-center gap-2.5">
                <div v-if="showAdminActions" ref="statusMenuRef" class="relative">
                  <button
                    type="button"
                    :class="[
                      'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition shadow-xs',
                      ticket.status === 'done'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : ticket.status === 'wo_issued'
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-brand-600 text-white hover:bg-brand-700'
                    ]"
                    @click="statusDropdownOpen = !statusDropdownOpen"
                  >
                    <span class="w-2 h-2 rounded-full bg-white" />
                    <span>{{ statusLabel(ticket.status) }}</span>
                    <ChevronDown class="w-3.5 h-3.5 opacity-90" />
                  </button>

                  <!-- Status Switcher Dropdown -->
                  <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="statusDropdownOpen"
                      class="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30"
                    >
                      <div class="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {{ t('Ubah Status Tiket', 'Change Ticket Status') }}
                      </div>
                      <button
                        v-for="st in statusOptions"
                        :key="st.value"
                        type="button"
                        :class="[
                          'w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between transition',
                          ticket.status === st.value
                            ? 'bg-brand-50 text-brand-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        ]"
                        @click="selectStatus(st.value)"
                      >
                        <span class="flex items-center gap-2">
                          <span :class="['w-2 h-2 rounded-full', st.dotClass]" />
                          <span>{{ st.label }}</span>
                        </span>
                        <Check v-if="ticket.status === st.value" class="w-3.5 h-3.5 text-brand-600" />
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Read-Only Status Pill (for Public / Dashboard view) -->
                <span
                  v-else
                  :class="[
                    'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold',
                    ticket.status === 'done'
                      ? 'bg-emerald-600 text-white'
                      : ticket.status === 'wo_issued'
                        ? 'bg-rose-600 text-white'
                        : 'bg-brand-600 text-white'
                  ]"
                >
                  <span class="w-2 h-2 rounded-full bg-white" />
                  <span>{{ statusLabel(ticket.status) }}</span>
                </span>
              </div>

              <!-- Right: Three-Dots (⋮) Dropdown for Edit/Delete NEXT TO Close (X) Button -->
              <div class="flex items-center gap-2">
                <!-- Three-Dots (⋮) Button (Only when showAdminActions is enabled) -->
                <div v-if="showAdminActions" ref="actionMenuRef" class="relative">
                  <button
                    type="button"
                    :title="t('Menu Aksi (Edit / Delete)', 'Action Menu (Edit / Delete)')"
                    class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 border border-slate-200/70 flex items-center justify-center transition"
                    @click="actionDropdownOpen = !actionDropdownOpen"
                  >
                    <MoreVertical class="w-4 h-4" />
                  </button>

                  <!-- Dropdown Edit / Delete -->
                  <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="actionDropdownOpen"
                      class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30"
                    >
                      <button
                        type="button"
                        class="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition"
                        @click="handleEditClick"
                      >
                        <Pencil class="w-4 h-4 text-amber-500" />
                        <span>{{ t('Edit Work Order', 'Edit Work Order') }}</span>
                      </button>

                      <div class="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        class="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
                        @click="handleDeleteClick"
                      >
                        <Trash2 class="w-4 h-4 text-rose-600" />
                        <span>{{ t('Delete Work Order', 'Delete Work Order') }}</span>
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Close (X) Button -->
                <button
                  type="button"
                  :title="t('Tutup Detail', 'Close Details')"
                  class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200/70 flex items-center justify-center transition"
                  @click="closeDrawer"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- SCROLLABLE DRAWER BODY (Matches Image 2 Layout) -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- 1. Top Ticket ID, Location & Priority/Deadline Badges + Main Case Title -->
              <div>
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 text-xs font-extrabold tracking-tight">
                      #{{ ticket.work_order_no }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <Globe class="w-3.5 h-3.5 text-slate-400" />
                      {{ ticket.location }}
                    </span>
                  </div>

                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold',
                      ticket.status === 'done'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : ticket.status === 'wo_issued'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    ]"
                  >
                    <CheckCircle2 v-if="ticket.status === 'done'" class="w-3.5 h-3.5" />
                    <AlertTriangle v-else class="w-3.5 h-3.5" />
                    <span>
                      {{
                        ticket.status === 'done'
                          ? t('Selesai Dikerjakan', 'Resolved & Completed')
                          : `Deadline • ${ticket.completion_deadline_label || ticket.completion_deadline || '-'}`
                      }}
                    </span>
                  </span>
                </div>

                <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug mt-3">
                  {{ ticket.description }}
                </h2>
              </div>

              <!-- 2. Batas Waktu Resolusi SLA / Durasi Pengerjaan Card -->
              <div class="rounded-2xl bg-brand-50/40 border border-brand-100 p-4 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div
                    :class="[
                      'w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs',
                      ticket.status === 'done' ? 'bg-emerald-600' : 'bg-brand-600'
                    ]"
                  >
                    <Hourglass class="w-5 h-5" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-[11px] font-semibold text-slate-500 block">
                      {{
                        ticket.status === 'done'
                          ? t('Durasi & Waktu Penyelesaian Tiket', 'Ticket Resolution Duration')
                          : t('Batas Waktu Resolusi (Completion Deadline)', 'Resolution Completion Deadline')
                      }}
                    </span>
                    <span class="text-sm font-extrabold text-slate-900 block truncate mt-0.5">
                      {{
                        ticket.status === 'done'
                          ? ticket.duration || ticket.completed_date_label || t('Selesai tepat waktu', 'Completed on time')
                          : ticket.completion_deadline_label || ticket.completion_deadline || '-'
                      }}
                    </span>
                  </div>
                </div>

                <!-- Visual Progress Indicator -->
                <div class="w-20 h-2 rounded-full bg-slate-200/80 overflow-hidden shrink-0 hidden sm:block">
                  <div
                    :class="[
                      'h-full rounded-full transition-all',
                      ticket.status === 'done'
                        ? 'w-full bg-emerald-500'
                        : ticket.status === 'wo_issued'
                          ? 'w-2/3 bg-rose-500'
                          : 'w-1/3 bg-brand-600'
                    ]"
                  />
                </div>
              </div>

              <!-- 3. INFORMASI PELAPOR (Matches Image 2) -->
              <div class="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  {{ t('INFORMASI PELAPOR', 'REQUESTER INFORMATION') }}
                </span>

                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {{ getInitials(ticket.requested_by) }}
                    </div>
                    <div>
                      <h4 class="text-sm font-extrabold text-slate-900">
                        {{ ticket.requested_by }}
                      </h4>
                      <p class="text-xs text-slate-500 font-medium mt-0.5">
                        {{ ticket.department_name || ticket.department }}
                        <span
                          v-if="ticket.raw_department && ticket.raw_department.toLowerCase() !== (ticket.department_name || '').toLowerCase()"
                          class="text-brand-600 font-semibold"
                        >
                          ({{ ticket.raw_department }})
                        </span>
                      </p>
                      <p class="text-xs text-brand-600 font-semibold flex items-center gap-1 mt-1">
                        <MapPin class="w-3.5 h-3.5 shrink-0" />
                        <span>{{ ticket.location }}</span>
                      </p>
                    </div>
                  </div>

                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-extrabold shrink-0">
                    ID: {{ ticket.work_order_no }}
                  </span>
                </div>

                <!-- 2 Sub-boxes: Departemen & Waktu Pelaporan -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <span class="text-[11px] font-semibold text-slate-400 block">
                      {{ t('Departemen', 'Department') }}
                    </span>
                    <div class="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                      <Building2 class="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{{ ticket.department_name || ticket.department }}</span>
                    </div>
                    <span
                      v-if="ticket.raw_department"
                      class="text-[11px] text-slate-500 font-medium block mt-0.5"
                    >
                      Sub-dept: {{ ticket.raw_department }}
                    </span>
                  </div>

                  <div class="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <span class="text-[11px] font-semibold text-slate-400 block">
                      {{ t('Waktu Pelaporan', 'Date Requested') }}
                    </span>
                    <div class="mt-1 text-xs font-extrabold text-slate-800">
                      {{ ticket.date_requested_label || ticket.date_requested }}
                    </div>
                    <span class="text-[11px] font-bold text-brand-600 block mt-0.5">
                      Deadline: {{ ticket.completion_deadline_label || ticket.completion_deadline || '-' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 4. RINCIAN MASALAH (Deskripsi Case) -->
              <div class="space-y-2.5">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  {{ t('RINCIAN MASALAH', 'ISSUE DESCRIPTION') }}
                </span>

                <div class="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
                  <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {{ ticket.description }}
                  </p>

                  <div class="rounded-xl bg-brand-50/60 border border-brand-100 px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-brand-700">
                    <Info class="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Location Office: <strong>{{ ticket.location }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- 5. SOLUTION CASE & DURASI PENGERJAAN (Clickable to Add Solution & Move to Done - Image 3) -->
              <div ref="solutionSectionRef" class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {{ t('SOLUTION CASE & PENYELESAIAN IT', 'SOLUTION CASE & IT RESOLUTION') }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span
                      v-if="ticket.duration"
                      class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    >
                      {{ ticket.duration }}
                    </span>
                    <button
                      v-if="canEditSolution && !editingSolution"
                      type="button"
                      class="text-[11px] font-extrabold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                      @click="openSolutionEditor"
                    >
                      <Pencil class="w-3 h-3" />
                      <span>{{ ticket.solution ? t('Ubah Solution', 'Edit Solution') : t('Tambah Solution', 'Add Solution') }}</span>
                    </button>
                  </div>
                </div>

                <!-- INLINE SOLUTION EDITOR (Opened when clicking Solution Case box) -->
                <div
                  v-if="canEditSolution && editingSolution"
                  class="rounded-2xl border-2 border-brand-500/80 bg-white p-4 space-y-3.5 shadow-sm"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">
                        {{ t('Tanggal Penyelesaian', 'Completion Date') }}
                      </label>
                      <input
                        v-model="solutionForm.completed_date"
                        type="date"
                        class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                      />
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-slate-600 mb-1">
                        {{ t('Waktu Pengerjaan (Jam:Menit)', 'Working Time (HH:MM)') }}
                      </label>
                      <div class="flex items-center gap-1">
                        <input
                          v-model="solutionTime.startHour"
                          type="number"
                          min="0"
                          max="23"
                          placeholder="09"
                          class="w-11 px-1.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                          @blur="padTimeField('startHour', 23)"
                        />
                        <span class="text-xs font-extrabold text-slate-400">:</span>
                        <input
                          v-model="solutionTime.startMinute"
                          type="number"
                          min="0"
                          max="59"
                          placeholder="00"
                          class="w-11 px-1.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                          @blur="padTimeField('startMinute', 59)"
                        />
                        <span class="text-xs font-bold text-slate-400 mx-0.5">&mdash;</span>
                        <input
                          v-model="solutionTime.endHour"
                          type="number"
                          min="0"
                          max="23"
                          placeholder="10"
                          class="w-11 px-1.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                          @blur="padTimeField('endHour', 23)"
                        />
                        <span class="text-xs font-extrabold text-slate-400">:</span>
                        <input
                          v-model="solutionTime.endMinute"
                          type="number"
                          min="0"
                          max="59"
                          placeholder="00"
                          class="w-11 px-1.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-600 outline-none"
                          @blur="padTimeField('endMinute', 59)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-bold text-slate-600 mb-1">
                      {{ t('Catatan Solution Case *', 'Solution Case Notes *') }}
                    </label>
                    <textarea
                      ref="solutionInputRef"
                      v-model="solutionForm.solution"
                      rows="3"
                      :placeholder="t('Tuliskan langkah perbaikan atau solution case yang dilakukan...', 'Describe the technical solution case performed...')"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                    />
                  </div>

                  <div class="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                      @click.stop="editingSolution = false"
                    >
                      {{ t('Batal', 'Cancel') }}
                    </button>

                    <button
                      type="button"
                      :disabled="savingSolution"
                      class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition inline-flex items-center gap-1.5 shadow-xs"
                      @click.stop="submitInlineSolution(true)"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5" />
                      <span>
                        {{
                          savingSolution
                            ? t('Menyimpan...', 'Saving...')
                            : ticket.status === 'done'
                              ? t('Simpan Solution', 'Save Solution')
                              : t('Simpan & Pindah ke Done', 'Save & Move to Done')
                        }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- DISPLAY SOLUTION CASE BOX (Clickable for Admin to Add/Edit Solution) -->
                <div
                  v-else
                  :class="[
                    'rounded-2xl border p-4 transition',
                    ticket.solution
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200/80 bg-slate-50/60',
                    canEditSolution
                      ? 'cursor-pointer hover:border-brand-400 hover:bg-brand-50/20'
                      : ''
                  ]"
                  :title="canEditSolution ? t('Klik untuk mengisi atau mengubah Solution Case', 'Click to add or edit Solution Case') : undefined"
                  @click="canEditSolution && openSolutionEditor()"
                >
                  <p
                    :class="[
                      'text-sm leading-relaxed whitespace-pre-line',
                      ticket.solution ? 'text-emerald-950 font-semibold' : 'text-slate-400 italic'
                    ]"
                  >
                    {{
                      ticket.solution ||
                      t(
                        'Belum ada catatan solution case (Tiket belum berstatus Done).',
                        'No solution case notes yet (Ticket is not Done yet).'
                      )
                    }}
                  </p>
                </div>
              </div>

              <!-- 6. Format Konfirmasi Work Order (Admin only) -->
              <div v-if="showCopyFormat && ticket.copy_text" class="rounded-2xl border border-brand-100 bg-brand-50/30 p-4 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-extrabold text-brand-700 uppercase tracking-wider">
                    {{ t('Format Konfirmasi Work Order', 'Work Order Confirmation Format') }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs"
                    @click="copyConfirmation(ticket.copy_text)"
                  >
                    <Check v-if="copied" class="w-3.5 h-3.5" />
                    <Copy v-else class="w-3.5 h-3.5" />
                    {{ copied ? t('Tersalin!', 'Copied!') : t('Copy Format', 'Copy Format') }}
                  </button>
                </div>
                <pre class="text-xs font-mono text-slate-700 bg-white rounded-xl p-3 border border-brand-100/80 overflow-x-auto whitespace-pre-wrap">{{ ticket.copy_text }}</pre>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Copy,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Building2,
  Hourglass,
  Globe,
  Info,
  ChevronDown,
} from 'lucide-vue-next'

const { t } = useLang()
const { apiFetch, isAuthenticated } = useAuth()

const props = defineProps<{
  modelValue: boolean
  ticket: Record<string, any> | null
  showCopyFormat?: boolean
  showAdminActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', ticket: Record<string, any>): void
  (e: 'delete', ticket: Record<string, any>): void
  (e: 'change-status', payload: { ticket: Record<string, any>; newStatus: string }): void
  (e: 'updated', ticket: Record<string, any>): void
}>()

const copied = ref(false)
const actionDropdownOpen = ref(false)
const statusDropdownOpen = ref(false)

const canEditSolution = computed(() => Boolean(props.showAdminActions || isAuthenticated.value))
const editingSolution = ref(false)
const savingSolution = ref(false)
const solutionInputRef = ref<HTMLTextAreaElement | null>(null)
const solutionSectionRef = ref<HTMLElement | null>(null)

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

const solutionForm = reactive({
  completed_date: getTodayLocalDate(),
  solution: '',
})

const solutionTime = reactive({
  startHour: '09',
  startMinute: '00',
  endHour: '10',
  endMinute: '00',
})

const padTwo = (val: string | number) => {
  const num = parseInt(String(val), 10)
  if (isNaN(num) || num < 0) return '00'
  return String(num).padStart(2, '0')
}

const padTimeField = (field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', max: number) => {
  const raw = String(solutionTime[field] ?? '').trim()
  if (raw === '') return
  let num = parseInt(raw, 10)
  if (isNaN(num) || num < 0) num = 0
  if (num > max) num = max
  solutionTime[field] = String(num).padStart(2, '0')
}

const buildDurationFromTime = (): string => {
  const sh = Math.min(23, Math.max(0, parseInt(String(solutionTime.startHour || '9'), 10) || 0))
  const sm = Math.min(59, Math.max(0, parseInt(String(solutionTime.startMinute || '0'), 10) || 0))
  const eh = Math.min(23, Math.max(0, parseInt(String(solutionTime.endHour || '10'), 10) || 0))
  const em = Math.min(59, Math.max(0, parseInt(String(solutionTime.endMinute || '0'), 10) || 0))

  const rangeStr = `${padTwo(sh)}:${padTwo(sm)} - ${padTwo(eh)}:${padTwo(em)}`
  let diffMinutes = eh * 60 + em - (sh * 60 + sm)
  if (diffMinutes < 0) diffMinutes += 24 * 60

  const hours = Math.floor(diffMinutes / 60)
  const mins = diffMinutes % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} Jam`)
  if (mins > 0) parts.push(`${mins} Menit`)
  const diffLabel = parts.length > 0 ? ` (${parts.join(' ')})` : ''
  const datePrefix = solutionForm.completed_date ? `${formatDateShortIndo(solutionForm.completed_date)} • ` : ''

  return `${datePrefix}${rangeStr}${diffLabel}`
}

const openSolutionEditor = () => {
  if (!props.ticket || !canEditSolution.value) return
  solutionForm.completed_date = props.ticket.completed_date || getTodayLocalDate()
  solutionForm.solution = props.ticket.solution || ''

  const rawDur = (props.ticket.duration || '').trim()
  const match = rawDur.match(/(\d{1,2})\s*:\s*(\d{1,2})\s*-\s*(\d{1,2})\s*:\s*(\d{1,2})/)
  if (match) {
    solutionTime.startHour = padTwo(match[1])
    solutionTime.startMinute = padTwo(match[2])
    solutionTime.endHour = padTwo(match[3])
    solutionTime.endMinute = padTwo(match[4])
  } else {
    solutionTime.startHour = '09'
    solutionTime.startMinute = '00'
    solutionTime.endHour = '10'
    solutionTime.endMinute = '00'
  }

  editingSolution.value = true
  nextTick(() => {
    solutionInputRef.value?.focus()
  })
}

const submitInlineSolution = async (moveToDone: boolean) => {
  if (!props.ticket) return
  if (!solutionForm.solution.trim()) {
    await Swal.fire({
      icon: 'warning',
      title: t('Solution Case Kosong', 'Empty Solution Case'),
      text: t('Silakan isi catatan solution case terlebih dahulu.', 'Please enter the solution case notes first.'),
      confirmButtonColor: '#042B4F',
    })
    return
  }

  savingSolution.value = true
  try {
    const durationStr = buildDurationFromTime()
    const res = await apiFetch<{ message: string; data: any }>(
      `/admin/work-orders/${props.ticket.id}/solution`,
      {
        method: 'POST',
        body: {
          completed_date: solutionForm.completed_date,
          duration: durationStr,
          solution: solutionForm.solution.trim(),
          move_to_done: moveToDone,
        },
      }
    )

    if (res.data && props.ticket) {
      Object.assign(props.ticket, res.data)
      emit('updated', res.data)
    }

    editingSolution.value = false

    await Swal.fire({
      icon: 'success',
      title: moveToDone ? t('Tiket Selesai (Done)', 'Ticket Completed (Done)') : t('Solution Tersimpan', 'Solution Saved'),
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1600,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Menyimpan Solution', 'Failed to Save Solution'),
      text: err?.data?.message || t('Pastikan catatan solution case telah diisi.', 'Please check your solution case input.'),
      confirmButtonColor: '#042B4F',
    })
  } finally {
    savingSolution.value = false
  }
}

const moveTicketToDoneWithSolution = async () => {
  if (!props.ticket || !props.ticket.solution) return
  savingSolution.value = true
  try {
    const res = await apiFetch<{ message: string; data: any }>(
      `/admin/work-orders/${props.ticket.id}/done`,
      {
        method: 'POST',
        body: {
          completed_date: props.ticket.completed_date || getTodayLocalDate(),
          duration: props.ticket.duration || buildDurationFromTime(),
          solution: props.ticket.solution,
        },
      }
    )

    if (res.data && props.ticket) {
      Object.assign(props.ticket, res.data)
      emit('updated', res.data)
    }

    await Swal.fire({
      icon: 'success',
      title: t('Tiket Selesai (Done)', 'Ticket Completed (Done)'),
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1600,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Memindahkan ke Done', 'Failed to Move to Done'),
      text: err?.data?.message || t('Terjadi kesalahan saat memindahkan status tiket.', 'An error occurred while moving ticket to Done.'),
      confirmButtonColor: '#042B4F',
    })
  } finally {
    savingSolution.value = false
  }
}

const statusOptions = [
  { value: 'open', label: 'Open', dotClass: 'bg-brand-600' },
  { value: 'wo_issued', label: 'WO has Been Issued', dotClass: 'bg-rose-500' },
  { value: 'done', label: 'Done', dotClass: 'bg-emerald-500' },
]

const statusLabel = (st: string) => {
  if (st === 'done') return 'Done'
  if (st === 'wo_issued') return 'WO has Been Issued'
  return 'Open'
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      actionDropdownOpen.value = false
      statusDropdownOpen.value = false
      editingSolution.value = false
    }
  }
)

watch(
  () => props.ticket?.id,
  () => {
    editingSolution.value = false
  }
)

const closeDrawer = () => {
  actionDropdownOpen.value = false
  statusDropdownOpen.value = false
  emit('update:modelValue', false)
}

const handleEditClick = () => {
  if (!props.ticket) return
  actionDropdownOpen.value = false
  emit('edit', props.ticket)
}

const handleDeleteClick = () => {
  if (!props.ticket) return
  actionDropdownOpen.value = false
  emit('delete', props.ticket)
}

const selectStatus = (newStatus: string) => {
  statusDropdownOpen.value = false
  if (!props.ticket || props.ticket.status === newStatus) return
  emit('change-status', { ticket: props.ticket, newStatus })
}

const copyConfirmation = async (text: string) => {
  if (!import.meta.client) return
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
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
</script>

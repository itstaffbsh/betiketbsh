<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && ticket"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="bg-white rounded-3xl shadow-modal border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-5 bg-slate-50/70 border-b border-slate-100">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                <FileText class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h3 class="text-lg font-extrabold text-slate-900">
                    {{ t('Detail Tiket', 'Ticket Details') }} {{ ticket.work_order_no }}
                  </h3>
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold',
                      ticket.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ticket.status === 'wo_issued'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        ticket.status === 'done'
                          ? 'bg-emerald-500'
                          : ticket.status === 'wo_issued'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                      ]"
                    />
                    {{ ticket.status_label || (ticket.status === 'done' ? 'Done' : ticket.status === 'wo_issued' ? 'WO has Been Issued' : 'Open') }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{
                    t(
                      'Informasi lengkap work order, durasi pengerjaan, dan catatan solusi IT.',
                      'Complete work order information, working duration, and IT resolution notes.'
                    )
                  }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              @click="$emit('update:modelValue', false)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <!-- Info Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Work Order No
                </span>
                <span class="text-sm font-bold text-brand-600 mt-0.5 block">
                  {{ ticket.work_order_no }}
                </span>
              </div>

              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Status
                </span>
                <div class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold',
                      ticket.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ticket.status === 'wo_issued'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    ]"
                  >
                    <CheckCircle2 v-if="ticket.status === 'done'" class="w-3.5 h-3.5" />
                    <AlertCircle v-else class="w-3.5 h-3.5" />
                    {{
                      ticket.status === 'done'
                        ? t('Done (Selesai)', 'Done (Completed)')
                        : ticket.status === 'wo_issued'
                          ? 'WO has Been Issued'
                          : t('Open (Belum Selesai)', 'Open (In Queue)')
                    }}
                  </span>
                </div>
              </div>

              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {{ t('Nama Pembuat', 'Requested By') }}
                </span>
                <span class="text-sm font-bold text-slate-800 mt-0.5 block">
                  {{ ticket.requested_by }}
                </span>
              </div>

              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {{ t('Departemen', 'Department') }}
                </span>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-sm font-bold text-slate-800">
                    {{ ticket.department_name || ticket.department }}
                  </span>
                  <span
                    v-if="ticket.raw_department && ticket.raw_department.toLowerCase() !== (ticket.department_name || '').toLowerCase()"
                    class="text-[11px] px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 font-semibold"
                  >
                    sub: {{ ticket.raw_department }}
                  </span>
                </div>
              </div>

              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {{ t('Tanggal Request', 'Date Requested') }}
                </span>
                <span class="text-sm font-semibold text-slate-800 mt-0.5 block">
                  {{ ticket.date_requested_label || ticket.date_requested }}
                </span>
                <span
                  v-if="ticket.completion_deadline_label"
                  class="text-[11px] text-slate-500 block mt-0.5"
                >
                  Deadline: {{ ticket.completion_deadline_label }}
                </span>
              </div>

              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Location Office
                </span>
                <span class="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  {{ ticket.location }}
                </span>
              </div>

              <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100 sm:col-span-2">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  {{ t('Durasi Tiket', 'Ticket Duration') }}
                </span>
                <span class="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <Clock class="w-4 h-4 text-brand-500 shrink-0" />
                  {{
                    ticket.duration ||
                    (ticket.status === 'done'
                      ? t('Selesai tepat waktu', 'Completed on time')
                      : t('Sedang dalam penanganan (Belum selesai)', 'In progress (Not yet completed)'))
                  }}
                </span>
              </div>
            </div>

            <!-- Deskripsi Case -->
            <div class="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {{ t('Deskripsi Case', 'Case Description') }}
                </span>
                <span class="text-[11px] text-slate-400 font-medium">
                  {{ t('Keluhan / Permintaan User', 'User Request / Issue') }}
                </span>
              </div>
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {{ ticket.description }}
              </p>
            </div>

            <!-- Solution Case -->
            <div
              :class="[
                'rounded-2xl border p-4',
                ticket.solution
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-200/80 bg-slate-50/50'
              ]"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span
                  :class="[
                    'text-xs font-bold uppercase tracking-wider',
                    ticket.solution ? 'text-emerald-800' : 'text-slate-600'
                  ]"
                >
                  Solution Case
                </span>
                <span class="text-[11px] text-slate-400 font-medium">
                  {{ t('Resolusi & Catatan Teknisi IT', 'IT Technician Resolution & Notes') }}
                </span>
              </div>
              <p
                :class="[
                  'text-sm leading-relaxed whitespace-pre-line',
                  ticket.solution ? 'text-emerald-900 font-medium' : 'text-slate-400 italic'
                ]"
              >
                {{
                  ticket.solution ||
                  t(
                    'Belum ada catatan solusi (Tiket masih berstatus Open).',
                    'No resolution notes yet (Ticket is still Open).'
                  )
                }}
              </p>
            </div>

            <!-- Format Konfirmasi Work Order (hanya tampil di halaman Admin jika diaktifkan) -->
            <div v-if="showCopyFormat && ticket.copy_text" class="rounded-2xl border border-brand-100 bg-brand-50/30 p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  {{ t('Format Konfirmasi Work Order', 'Work Order Confirmation Format') }}
                </span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition shadow-sm"
                  @click="copyConfirmation(ticket.copy_text)"
                >
                  <Check v-if="copied" class="w-3.5 h-3.5" />
                  <Copy v-else class="w-3.5 h-3.5" />
                  {{ copied ? t('Tersalin!', 'Copied!') : t('Copy Format', 'Copy Format') }}
                </button>
              </div>
              <pre class="text-xs font-mono text-slate-700 bg-white/80 rounded-xl p-3 border border-brand-100/80 overflow-x-auto whitespace-pre-wrap">{{ ticket.copy_text }}</pre>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition shadow-sm"
              @click="$emit('update:modelValue', false)"
            >
              {{ t('Tutup Detail', 'Close Details') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { FileText, X, CheckCircle2, AlertCircle, MapPin, Clock, Copy, Check } from 'lucide-vue-next'

const { t } = useLang()

defineProps<{
  modelValue: boolean
  ticket: Record<string, any> | null
  showCopyFormat?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const copied = ref(false)

const copyConfirmation = async (text: string) => {
  if (!import.meta.client) return
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

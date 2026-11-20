<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    <!-- 1. Total Tiket Keseluruhan -->
    <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-card transition-all hover:shadow-md group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-semibold text-slate-600">
          {{ t('Total Tiket Keseluruhan', 'Total All Tickets') }}
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600">
          <TrendingUp class="w-3 h-3" />
          {{ t('Semua', 'All Time') }}
        </span>
      </div>
      <div class="flex items-baseline gap-2 relative z-10">
        <span class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ formatNumber(summary.total) }}
        </span>
        <span class="text-xs font-medium text-slate-400">
          {{ t('total work order', 'total work orders') }}
        </span>
      </div>
      <Ticket class="w-20 h-20 text-brand-500/[0.06] absolute -right-2 -bottom-2 transform -rotate-12 transition-transform group-hover:scale-110" />
    </div>

    <!-- 2. Tiket Selesai (status = done) -->
    <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-card transition-all hover:shadow-md group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-semibold text-slate-600">
          {{ t('Tiket Selesai', 'Completed Tickets') }}
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
          {{ completionRate }}% {{ t('Selesai', 'Done') }}
        </span>
      </div>
      <div class="flex items-baseline gap-2 relative z-10">
        <span class="text-3xl font-extrabold text-emerald-600 tracking-tight">
          {{ formatNumber(summary.done) }}
        </span>
        <span class="text-xs font-medium text-slate-400">status = done</span>
      </div>
      <CheckCircle2 class="w-20 h-20 text-emerald-500/[0.07] absolute -right-2 -bottom-2 transition-transform group-hover:scale-110" />
    </div>

    <!-- 3. Tiket Belum Selesai (status = open) -->
    <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-card transition-all hover:shadow-md group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-semibold text-slate-600">
          {{ t('Tiket Belum Selesai', 'Pending Tickets') }}
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
          {{ t('Antrian', 'In Queue') }}
        </span>
      </div>
      <div class="flex items-baseline gap-2 relative z-10">
        <span class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ formatNumber(summary.open) }}
        </span>
        <span class="text-xs font-medium text-slate-400">status = open</span>
      </div>
      <Clock class="w-20 h-20 text-amber-500/[0.07] absolute -right-2 -bottom-2 transition-transform group-hover:scale-110" />
    </div>

    <!-- 4. Jumlah Tiket Hari Ini (created_at = today) -->
    <div class="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-card transition-all hover:shadow-md group">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-semibold text-slate-600">
          {{ t('Jumlah Tiket Hari Ini', "Today's Tickets") }}
        </span>
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
          {{ t('Hari Ini', 'Today') }}
        </span>
      </div>
      <div class="flex items-baseline gap-2 relative z-10">
        <span class="text-3xl font-extrabold text-brand-600 tracking-tight">
          {{ formatTwoDigits(summary.today) }}
        </span>
        <span class="text-xs font-medium text-slate-400">
          {{ t('tiket masuk hari ini', 'incoming today') }}
        </span>
      </div>
      <Calendar class="w-20 h-20 text-indigo-500/[0.06] absolute -right-2 -bottom-2 transition-transform group-hover:scale-110" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ticket, CheckCircle2, Clock, Calendar, TrendingUp } from 'lucide-vue-next'

const { t } = useLang()

const props = defineProps<{
  summary: {
    total: number
    done: number
    open: number
    today: number
  }
}>()

const completionRate = computed(() => {
  if (!props.summary.total) return 0
  return Math.round((props.summary.done / props.summary.total) * 100)
})

const formatNumber = (val: number) => {
  return (val ?? 0).toLocaleString('id-ID')
}

const formatTwoDigits = (val: number) => {
  const num = val ?? 0
  return num < 10 && num > 0 ? `0${num}` : `${num}`
}
</script>

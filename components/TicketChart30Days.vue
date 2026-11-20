<template>
  <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-base font-extrabold text-slate-900">
          {{
            t(
              'Statistik Tiket Masuk & Selesai (30 Hari Terakhir)',
              'Incoming & Completed Tickets (Last 30 Days)'
            )
          }}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          {{
            t(
              'Tren harian jumlah work order masuk dibandingkan tiket selesai selama 1 bulan terakhir',
              'Daily trend of incoming work orders compared to completed tickets over the last 30 days'
            )
          }}
        </p>
      </div>

      <!-- Toggle Line / Bar Chart -->
      <div class="inline-flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
            chartType === 'line'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          ]"
          @click="chartType = 'line'"
        >
          <TrendingUp class="w-3.5 h-3.5" />
          Line Chart
        </button>
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5',
            chartType === 'bar'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          ]"
          @click="chartType = 'bar'"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          Bar Chart
        </button>
      </div>
    </div>

    <!-- Chart Canvas Container -->
    <div class="h-72 w-full relative">
      <Line v-if="chartType === 'line'" :data="chartData" :options="chartOptions" />
      <Bar v-else :data="chartData" :options="chartOptions" />
    </div>

    <!-- Legend Footer -->
    <div class="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
      <div class="flex items-center gap-5">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-brand-600 inline-block" />
          <span class="font-semibold text-slate-700">
            {{ t('Total Tiket Masuk', 'Incoming Tickets') }} ({{ total30Days }})
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span class="font-semibold text-slate-700">
            {{ t('Tiket Selesai', 'Completed Tickets') }} ({{ done30Days }})
          </span>
        </div>
      </div>
      <div class="font-bold text-emerald-600">
        {{ t('Tingkat Penyelesaian 30 Hari', '30-Day Resolution Rate') }}: {{ resolutionRate30Days }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import { TrendingUp, BarChart3 } from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface ChartDayPoint {
  date: string
  label: string
  full_label: string
  total: number
  done: number
  open: number
}

const props = defineProps<{
  series: ChartDayPoint[]
}>()

const { t } = useLang()
const chartType = ref<'line' | 'bar'>('line')

const total30Days = computed(() =>
  (props.series || []).reduce((acc, item) => acc + (item.total || 0), 0)
)
const done30Days = computed(() =>
  (props.series || []).reduce((acc, item) => acc + (item.done || 0), 0)
)
const resolutionRate30Days = computed(() => {
  if (!total30Days.value) return 0
  return Math.round((done30Days.value / total30Days.value) * 100)
})

const chartData = computed(() => {
  const labels = (props.series || []).map((d) => d.label)
  const totals = (props.series || []).map((d) => d.total)
  const dones = (props.series || []).map((d) => d.done)

  return {
    labels,
    datasets: [
      {
        label: t('Tiket Masuk', 'Incoming Tickets'),
        data: totals,
        borderColor: '#4F46E5',
        backgroundColor: chartType.value === 'line' ? 'rgba(79, 70, 229, 0.14)' : '#4F46E5',
        borderWidth: 2.5,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#4F46E5',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        borderRadius: 6,
      },
      {
        label: t('Tiket Selesai', 'Completed Tickets'),
        data: dones,
        borderColor: '#10B981',
        backgroundColor: chartType.value === 'line' ? 'rgba(16, 185, 129, 0.12)' : '#10B981',
        borderWidth: 2.5,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#10B981',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        borderRadius: 6,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#0F172A',
      titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' as const },
      bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: { family: 'Plus Jakarta Sans', size: 11 },
        color: '#64748B',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: { family: 'Plus Jakarta Sans', size: 11 },
        color: '#64748B',
      },
      grid: {
        color: '#F1F5F9',
      },
    },
  },
}
</script>

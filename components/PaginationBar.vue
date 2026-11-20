<template>
  <div class="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
    <!-- Left: Per-page selector + Showing X to Y of Z entries -->
    <div class="flex flex-wrap items-center justify-center sm:justify-start text-center sm:text-left gap-3 text-xs sm:text-sm text-slate-500 font-medium">
      <div class="flex items-center justify-center gap-2">
        <span>{{ t('Tampilkan', 'Show') }}</span>
        <select
          :value="meta.per_page || 10"
          class="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:bg-white focus:border-brand-600 outline-none transition cursor-pointer"
          @change="$emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="opt in [5, 10, 25, 50, 100]" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>

      <span>
        {{ t('Menampilkan', 'Showing') }}
        <span class="font-bold text-slate-800">{{ meta.from || 0 }}</span>
        {{ t('sampai', 'to') }}
        <span class="font-bold text-slate-800">{{ meta.to || 0 }}</span>
        {{ t('dari', 'of') }}
        <span class="font-bold text-slate-800">{{ meta.total || 0 }}</span>
        {{ t('data', 'entries') }}
      </span>
    </div>

    <!-- Right: Pagination (Prev, 1, 2, 3..., Next) -->
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        :disabled="meta.current_page <= 1"
        class="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
        @click="$emit('change', meta.current_page - 1)"
      >
        {{ t('Sebelumnya', 'Prev') }}
      </button>

      <template v-for="p in pages" :key="p">
        <span
          v-if="p === '...'"
          class="px-2 py-1 text-xs font-semibold text-slate-400"
        >
          ...
        </span>
        <button
          v-else
          type="button"
          :class="[
            'w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center',
            p === meta.current_page
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 border border-transparent'
          ]"
          @click="$emit('change', Number(p))"
        >
          {{ p }}
        </button>
      </template>

      <button
        type="button"
        :disabled="meta.current_page >= meta.last_page"
        class="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
        @click="$emit('change', meta.current_page + 1)"
      >
        {{ t('Berikutnya', 'Next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useLang()

const props = defineProps<{
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}>()

defineEmits<{
  (e: 'change', page: number): void
  (e: 'update:perPage', perPage: number): void
}>()

const pages = computed(() => {
  const total = props.meta.last_page || 1
  const current = props.meta.current_page || 1
  const items: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i)
    return items
  }

  items.push(1)
  if (current > 3) items.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    items.push(i)
  }

  if (current < total - 2) items.push('...')
  items.push(total)

  return items
})
</script>

<template>
  <div class="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 select-none">
    <button
      type="button"
      :class="[
        'px-2.5 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1',
        lang === 'id'
          ? 'bg-brand-600 text-white shadow-xs'
          : 'text-slate-500 hover:text-slate-800'
      ]"
      title="Bahasa Indonesia"
      @click="setLang('id')"
    >
      <span>ID</span>
    </button>
    <button
      type="button"
      :class="[
        'px-2.5 py-1 rounded-lg text-xs font-extrabold transition flex items-center gap-1',
        lang === 'en'
          ? 'bg-brand-600 text-white shadow-xs'
          : 'text-slate-500 hover:text-slate-800'
      ]"
      title="English"
      @click="setLang('en')"
    >
      <span>EN</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { lang, setLang } = useLang()
</script>

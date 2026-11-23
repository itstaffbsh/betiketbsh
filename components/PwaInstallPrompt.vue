<template>
  <Teleport to="body">
    <!-- Top Compact Install Bar when modal is minimized on <= 480px -->
    <div
      v-if="isSmallScreen && !isStandalone && minimized && !showGuide"
      class="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-brand-600 text-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center justify-between gap-2"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Download class="w-4 h-4 text-white" />
        </div>
        <div class="truncate">
          <p class="text-xs font-extrabold leading-tight truncate">Install BSHsupport App</p>
          <p class="text-[10px] text-brand-100 truncate">Akses lebih cepat dalam mode aplikasi</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          class="px-3 py-1.5 rounded-xl bg-white text-brand-600 text-xs font-extrabold shadow-xs hover:bg-brand-50 transition"
          @click="triggerInstall"
        >
          Install
        </button>
        <button
          type="button"
          class="p-1 text-brand-100 hover:text-white"
          @click="minimized = false"
        >
          <ChevronUp class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Full Install Direction Sheet / Modal for width <= 480px -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="isSmallScreen && !isStandalone && !minimized"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs"
      >
        <div class="w-full max-w-sm bg-white rounded-3xl shadow-modal border border-slate-100 overflow-hidden p-5 space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25 shrink-0 p-1.5">
                <img src="/bsh-logo.png" alt="BaliSuperHost" class="w-full h-auto object-contain" />
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <h3 class="text-base font-extrabold text-slate-900">Install BSHsupport</h3>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-50 text-brand-600">
                    PWA
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  Layar mobile terdeteksi (&le; 480px). Pasang aplikasi untuk pengalaman layar penuh.
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"
              @click="minimized = true"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Benefits -->
          <div class="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs text-slate-600 border border-slate-100">
            <div class="flex items-center gap-2 font-semibold">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tampilan mobile responsif &amp; navigasi bawah cepat</span>
            </div>
            <div class="flex items-center gap-2 font-semibold">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Buka langsung dari Home Screen tanpa address bar</span>
            </div>
          </div>

          <!-- Manual Install Guide if native prompt wasn't triggered yet -->
          <div
            v-if="showGuide"
            class="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs text-slate-700 space-y-1.5"
          >
            <p class="font-extrabold text-brand-800">Cara Install di Browser Anda:</p>
            <ol class="list-decimal list-inside space-y-1 text-[11px] font-medium text-slate-600">
              <li>Ketuk ikon menu browser <strong>(&#8942;)</strong> di pojok kanan atas atau tombol <strong>Share</strong> (iOS).</li>
              <li>Pilih <strong>"Install App"</strong> / <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
              <li>Ketuk <strong>Install / Tambah</strong> untuk membuka BSHsupport sebagai aplikasi.</li>
            </ol>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              @click="minimized = true"
            >
              Nanti Saja
            </button>
            <button
              type="button"
              class="flex-[1.6] py-2.5 px-4 rounded-xl text-xs font-extrabold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/25 transition flex items-center justify-center gap-1.5"
              @click="triggerInstall"
            >
              <Download class="w-4 h-4" />
              <span>Install Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Headset, Download, X, CheckCircle2, ChevronUp } from 'lucide-vue-next'

const isSmallScreen = ref(false)
const isStandalone = ref(false)
const minimized = ref(false)
const showGuide = ref(false)
let deferredPrompt: any = null

const checkScreenAndStandalone = () => {
  if (!import.meta.client) return
  isSmallScreen.value = window.innerWidth <= 480
  const standaloneMedia = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = (window.navigator as any).standalone === true
  isStandalone.value = standaloneMedia || iosStandalone
}

const triggerInstall = async () => {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        isStandalone.value = true
      }
      deferredPrompt = null
    } catch {
      showGuide.value = true
    }
  } else {
    minimized.value = false
    showGuide.value = true
  }
}

onMounted(() => {
  if (!import.meta.client) return
  checkScreenAndStandalone()
  window.addEventListener('resize', checkScreenAndStandalone)

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt = e
    checkScreenAndStandalone()
  })

  window.addEventListener('appinstalled', () => {
    isStandalone.value = true
    deferredPrompt = null
  })
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('resize', checkScreenAndStandalone)
})
</script>

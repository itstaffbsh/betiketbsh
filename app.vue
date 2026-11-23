<template>
  <div>
    <VitePwaManifest />

    <!-- PWA Launch Splash Screen (ONLY when opened as installed PWA app) -->
    <Transition
      leave-active-class="transition-opacity duration-300 ease-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showPwaSplash"
        class="fixed inset-0 z-[99999] bg-[#042B4F] flex items-center justify-center p-8 select-none"
      >
        <img
          src="/bsh-logo.png"
          alt="BaliSuperHost"
          class="w-[260px] sm:w-[320px] max-w-[78vw] h-auto object-contain"
        />
      </div>
    </Transition>

    <PwaInstallPrompt />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const checkIsInstalledPwa = () => {
  if (!import.meta.client) return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (window.navigator as any).standalone === true ||
    window.location.search.includes('pwa=1') ||
    document.documentElement.classList.contains('is-pwa-launch')
  )
}

const showPwaSplash = ref(checkIsInstalledPwa())

onMounted(async () => {
  // Remove pre-hydration CSS splash pseudo-element once Vue splash overlay takes over
  document.documentElement.classList.remove('is-pwa-launch')

  if (showPwaSplash.value) {
    setTimeout(() => {
      showPwaSplash.value = false
    }, 1000)
  }

  // Clear outdated workbox caches so updated PWA icons & manifest take effect immediately
  if ('caches' in window) {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    } catch {
      // ignore cache clear errors
    }
  }
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      for (const reg of regs) {
        await reg.update()
      }
    } catch {
      // ignore sw update errors
    }
  }
})
</script>

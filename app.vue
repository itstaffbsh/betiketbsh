<template>
  <div>
    <VitePwaManifest />

    <!-- PWA Launch Splash Screen (ONLY when opened as installed PWA standalone app) -->
    <Transition
      leave-active-class="transition-opacity duration-300 ease-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showPwaSplash"
        class="fixed inset-0 z-[9999] bg-[#042B4F] flex items-center justify-center p-8 select-none"
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
const isStandalonePwa =
  import.meta.client &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true)

const showPwaSplash = ref(isStandalonePwa)

onMounted(() => {
  if (showPwaSplash.value) {
    setTimeout(() => {
      showPwaSplash.value = false
    }, 900)
  }
})
</script>

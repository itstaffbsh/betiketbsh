<template>
  <div class="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
    <!-- LEFT COLUMN: Clean White Centered Login Form (Matches Pagedone Left Side) -->
    <div class="w-full lg:w-[44%] flex flex-col justify-between p-6 sm:p-10 lg:p-12">
      <!-- Top Back Link & Language Switcher -->
      <div class="flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-600 transition"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>{{ t('Public Dashboard', 'Public Dashboard') }}</span>
        </NuxtLink>

        <LanguageSwitcher />
      </div>

      <!-- Centered Login Block -->
      <div class="w-full max-w-sm mx-auto my-auto py-8">
        <!-- Centered Brand Logo + Name -->
        <div class="flex items-center justify-center gap-2.5 mb-7">
          <div class="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25">
            <Headset class="w-5 h-5" />
          </div>
          <span class="text-2xl font-extrabold text-slate-900 tracking-tight">
            BSHsupport
          </span>
        </div>

        <!-- Centered Heading & Subtitle -->
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ t('Selamat Datang Kembali', 'Welcome Back') }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 font-medium mt-2">
            {{
              t(
                'Masuk untuk mengelola work order dan tiket layanan IT Anda.',
                'Sign in to manage your IT work orders and support tickets.'
              )
            }}
          </p>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Pill-Shaped Inputs & Login Button -->
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="Email"
              class="w-full px-5 py-3.5 rounded-full bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/15 outline-none transition"
            />
          </div>

          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Password"
              class="w-full pl-5 pr-12 py-3.5 rounded-full bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/15 outline-none transition"
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition"
            >
              {{ submitting ? t('Memproses...', 'Signing in...') : 'Login' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Bottom Spacer -->
      <div class="h-4" />
    </div>

    <!-- RIGHT COLUMN: Primary Rounded-Left Showcase Panel with BSHsupport Dashboard Preview -->
    <div class="w-full lg:w-[56%] bg-[#042B4F] lg:rounded-l-[3rem] relative overflow-hidden flex flex-col justify-between pt-10 sm:pt-14 lg:pt-16 pl-6 sm:pl-12 lg:pl-16 min-h-[420px] lg:min-h-screen">
      <!-- Subtle Decorative Glow -->
      <div class="w-96 h-96 rounded-full bg-white/10 blur-3xl absolute -top-24 -right-24 pointer-events-none" />

      <!-- Top Headline Block -->
      <div class="relative z-10 pr-6 sm:pr-12 max-w-xl">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
          {{ t('Kelola Work Order IT Anda', 'Control your IT Work Orders') }}
          <br />
          {{ t('Dengan Sistem Terintegrasi', 'With Our Smart Tool') }}
        </h2>
        <p class="text-xs sm:text-sm text-brand-100/90 mt-3 max-w-md leading-relaxed">
          {{
            t(
              'Kelola tiket dukungan teknis, pemetaan departemen otomatis, dan pemantauan penyelesaian work order dengan mudah.',
              'Manage technical support tickets, automated department mapping, and work order resolution tracking effortlessly.'
            )
          }}
        </p>
      </div>

      <!-- Bottom-Right Browser Window Frame showcasing BSHsupport Dashboard Image -->
      <div class="relative z-10 mt-8 sm:mt-10 flex-1 flex flex-col justify-end">
        <div class="w-full h-full min-h-[260px] sm:min-h-[360px] lg:min-h-[430px] bg-white/20 backdrop-blur-md rounded-tl-3xl border-t-2 border-l-2 border-white/30 pt-3.5 pl-3.5 shadow-2xl flex flex-col">
          <!-- Browser Window Controls Bar -->
          <div class="flex items-center gap-2 pb-3 pl-2">
            <span class="w-2.5 h-2.5 rounded-full bg-white/75" />
            <span class="w-2.5 h-2.5 rounded-full bg-white/75" />
            <span class="w-2.5 h-2.5 rounded-full bg-white/75" />
          </div>

          <!-- Inner Frame Content with BSHsupport Dashboard Preview -->
          <div class="relative flex-1 rounded-tl-2xl overflow-hidden bg-[#F8F9FE]">
            <img
              src="/bsh-login-preview.jpg"
              alt="BSHsupport Dashboard Preview"
              class="w-full h-full object-cover object-left-top"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Headset, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-vue-next'

const { login, isAuthenticated } = useAuth()
const { t } = useLang()

const form = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/admin/dashboard')
  }
})

const handleLogin = async () => {
  submitting.value = true
  errorMessage.value = ''
  try {
    await login(form.email, form.password)
    await navigateTo('/admin/dashboard')
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message ||
      t(
        'Email atau password tidak sesuai. Silakan coba lagi.',
        'Invalid email or password. Please try again.'
      )
  } finally {
    submitting.value = false
  }
}
</script>

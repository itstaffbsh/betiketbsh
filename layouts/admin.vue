<template>
  <div class="min-h-screen bg-[#F8F9FE] flex flex-col min-[481px]:flex-row">
    <!-- Tablet Sidebar Backdrop (only for 481px - 1023px) -->
    <div
      v-if="mobileMenuOpen"
      class="hidden min-[481px]:block fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
      @click="mobileMenuOpen = false"
    />

    <!-- LEFT SIDEBAR (Hidden on <= 480px because <= 480px uses the Bottom Navigation Bar) -->
    <aside
      :class="[
        'hidden min-[481px]:flex fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-64 h-screen bg-white border-r border-slate-100 flex-col justify-between transition-transform duration-200 ease-in-out shrink-0',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Top Brand Logo & Navigation -->
      <div>
        <!-- Brand Header -->
        <div class="h-20 px-6 flex items-center justify-between border-b border-slate-100/80">
          <NuxtLink to="/admin/dashboard" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20 group-hover:scale-105 transition">
              <Headset class="w-5 h-5" />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-lg font-extrabold text-slate-900 tracking-tight">BSHsupport</span>
            </div>
          </NuxtLink>

          <button
            type="button"
            class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            @click="mobileMenuOpen = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Sidebar Menu Items -->
        <nav class="p-4 space-y-1.5">
          <div class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('Menu Utama', 'Main Menu') }}
          </div>

          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
              isActive(item.to)
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            ]"
            @click="mobileMenuOpen = false"
          >
            <component
              :is="item.icon"
              :class="[
                'w-4 h-4 shrink-0',
                isActive(item.to) ? 'text-white' : 'text-slate-400'
              ]"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- BOTTOM LEFT SIDEBAR: Logout Button -->
      <div class="p-4 border-t border-slate-100">
        <button
          type="button"
          class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-600 hover:text-white transition-all group"
          @click="handleLogout"
        >
          <span class="flex items-center gap-3">
            <LogOut class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Logout</span>
          </span>
          <span class="text-[11px] font-semibold opacity-75">{{ t('Keluar', 'Exit') }}</span>
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT WRAPPER -->
    <div class="flex-1 flex flex-col min-w-0 pb-20 min-[481px]:pb-0">
      <!-- TOP HEADER -->
      <header class="h-16 min-[481px]:h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <!-- Left Header -->
        <div class="flex items-center gap-3">
          <!-- Tablet Hamburger (only visible between 481px and 1023px) -->
          <button
            type="button"
            class="hidden min-[481px]:inline-flex lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            @click="mobileMenuOpen = true"
          >
            <Menu class="w-5 h-5" />
          </button>

          <!-- Mobile <= 480px Brand Title -->
          <NuxtLink to="/admin/dashboard" class="flex min-[481px]:hidden items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Headset class="w-4 h-4" />
            </div>
            <span class="text-base font-extrabold text-slate-900 tracking-tight">BSHsupport</span>
          </NuxtLink>

          <div class="hidden sm:flex items-center gap-2.5 text-xs font-semibold text-slate-400">
            <span>BSHsupport Panel</span>
            <span>/</span>
            <span class="text-slate-800 font-bold">{{ currentPageTitle }}</span>
          </div>
        </div>

        <!-- Right Header: Language Switcher & User Profile Initials [NN] -->
        <div class="flex items-center gap-2.5 sm:gap-3.5">
          <!-- Language Switcher (ID / EN) -->
          <LanguageSwitcher />

          <!-- User Profile Button (On <= 480px shows clean purple [NN] square badge at top right as in wireframe) -->
          <button
            type="button"
            class="flex items-center gap-3 p-1 min-[481px]:pl-2 min-[481px]:pr-3 min-[481px]:py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent min-[481px]:hover:border-slate-200/80 transition text-left group"
            :title="t('Klik untuk membuka Detail User & Pengaturan Profil', 'Click to open User Details & Profile Settings')"
            @click="profileModalOpen = true"
          >
            <div class="w-10 h-10 rounded-xl bg-brand-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-brand-600/20 group-hover:scale-105 transition">
              {{ userInitials }}
            </div>
            <div class="hidden min-[481px]:block">
              <div class="flex items-center gap-2">
                <span class="text-sm font-extrabold text-slate-900 group-hover:text-brand-600 transition">
                  {{ user?.name || 'Admin User' }}
                </span>
              </div>
              <span class="inline-flex items-center px-2 py-0.2 rounded-md text-[11px] font-bold bg-brand-50 text-brand-600">
                {{ user?.position || 'IT Support Admin' }}
              </span>
            </div>
            <MoreVertical class="hidden min-[481px]:block w-4 h-4 text-slate-400 group-hover:text-brand-600 transition" />
          </button>
        </div>
      </header>

      <!-- PAGE MAIN CONTENT -->
      <main class="flex-1 p-3.5 sm:p-8 max-w-7xl w-full mx-auto">
        <slot />
      </main>
    </div>

    <!-- BOTTOM NAVIGATION BAR FOR SCREENS <= 480px (Matches User Wireframe Image) -->
    <nav
      class="min-[481px]:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] grid grid-cols-4 h-16 px-1"
    >
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex flex-col items-center justify-center gap-1 transition-all',
          isActive(item.to)
            ? 'bg-brand-600 text-white rounded-t-2xl shadow-md shadow-brand-600/25 -mt-1 pt-1'
            : 'text-slate-400 hover:text-slate-700'
        ]"
      >
        <component
          :is="item.icon"
          :class="[
            'w-5 h-5 shrink-0',
            isActive(item.to) ? 'text-white' : 'text-slate-400'
          ]"
        />
        <span class="text-[10px] font-extrabold leading-none tracking-tight truncate max-w-[76px]">
          {{ item.shortLabel }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Detail User Modal/Drawer with Three-Dot Dropdown (Edit Profil & Ubah Password) -->
    <ProfileDrawerModal v-model="profileModalOpen" @logout="handleLogout" />
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import {
  Headset,
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  MoreVertical,
} from 'lucide-vue-next'

const route = useRoute()
const { user, logout, fetchMe } = useAuth()
const { t } = useLang()

const mobileMenuOpen = ref(false)
const profileModalOpen = ref(false)

onMounted(() => {
  fetchMe()
})

const menuItems = computed(() => [
  {
    label: 'Dashboard',
    shortLabel: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: t('Work Order (Tiket)', 'Work Orders'),
    shortLabel: 'Work Order',
    to: '/admin/work-orders',
    icon: ClipboardList,
  },
  {
    label: 'Department',
    shortLabel: 'Department',
    to: '/admin/departments',
    icon: Building2,
  },
  {
    label: 'Admin Management',
    shortLabel: 'Admin',
    to: '/admin/admins',
    icon: Users,
  },
])

const isActive = (path: string) => route.path.startsWith(path)

const currentPageTitle = computed(() => {
  const found = menuItems.value.find((i) => route.path.startsWith(i.to))
  return found ? found.label : 'Admin Panel'
})

const userInitials = computed(() => {
  const name = user.value?.name || 'Admin'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

const handleLogout = async () => {
  profileModalOpen.value = false
  const result = await Swal.fire({
    icon: 'question',
    title: t('Konfirmasi Logout', 'Confirm Logout'),
    text: t('Apakah Anda yakin ingin logout?', 'Are you sure you want to log out?'),
    showCancelButton: true,
    confirmButtonText: t('Ya, Logout', 'Yes, Logout'),
    cancelButtonText: t('Batal', 'Cancel'),
    confirmButtonColor: '#E11D48',
    cancelButtonColor: '#64748B',
    reverseButtons: true,
  })

  if (result.isConfirmed) {
    await logout()
    await navigateTo('/login')
  }
}
</script>

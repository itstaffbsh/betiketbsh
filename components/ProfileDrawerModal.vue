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
        v-if="modelValue && user"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="bg-[#F8F9FE] rounded-3xl shadow-modal border border-slate-100 w-full max-w-2xl overflow-hidden my-8">
          <!-- Top Bar Header with Three Dots (⋮) Dropdown -->
          <div class="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-xl font-extrabold text-slate-900">
                  {{
                    activeMode === 'view'
                      ? t('Detail Akun', 'Account Details')
                      : activeMode === 'edit_profile'
                        ? t('Edit Profil', 'Edit Profile')
                        : t('Ubah Password', 'Change Password')
                  }}
                </h2>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                {{
                  activeMode === 'view'
                    ? t('Informasi ringkas profil dan peran tim akun Anda.', 'Summary of your profile and team role.')
                    : activeMode === 'edit_profile'
                      ? t('Perbarui informasi nama, jabatan, email, dan nomor HP akun Anda.', 'Update your name, position, email, and phone number.')
                      : t('Perbarui kata sandi keamanan akun admin Anda.', 'Update your admin account security password.')
                }}
              </p>
            </div>

            <!-- Right Actions: Three Dots (⋮) Dropdown + Close Button -->
            <div class="flex items-center gap-2">
              <div ref="dropdownRef" class="relative">
                <button
                  type="button"
                  :title="t('Menu Profil (⋮)', 'Profile Menu (⋮)')"
                  class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 flex items-center justify-center transition border border-slate-200/70"
                  @click="dropdownOpen = !dropdownOpen"
                >
                  <MoreVertical class="w-5 h-5" />
                </button>

                <!-- Dropdown Menu (Titik Tiga ⋮) -->
                <Transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition duration-100 ease-in"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95"
                >
                  <div
                    v-if="dropdownOpen"
                    class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30"
                  >
                    <button
                      v-if="activeMode !== 'view'"
                      type="button"
                      class="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                      @click="switchMode('view')"
                    >
                      <UserIcon class="w-4 h-4 text-brand-600" />
                      {{ t('Detail User', 'User Details') }}
                    </button>
                    <button
                      type="button"
                      :class="[
                        'w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2.5 transition',
                        activeMode === 'edit_profile'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      ]"
                      @click="switchMode('edit_profile')"
                    >
                      <UserCog class="w-4 h-4 text-brand-600" />
                      1. {{ t('Edit Profil', 'Edit Profile') }}
                    </button>
                    <button
                      type="button"
                      :class="[
                        'w-full px-4 py-2.5 text-left text-xs font-bold flex items-center gap-2.5 transition',
                        activeMode === 'change_password'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      ]"
                      @click="switchMode('change_password')"
                    >
                      <KeyRound class="w-4 h-4 text-brand-600" />
                      2. {{ t('Ubah Password', 'Change Password') }}
                    </button>
                  </div>
                </Transition>
              </div>

              <button
                type="button"
                class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
                @click="closeModal"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Body Content -->
          <div class="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            <!-- Hero Profile Banner Card -->
            <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <div class="w-16 h-16 rounded-2xl bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                    {{ initials }}
                  </div>
                  <span class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-1 -right-1 flex items-center justify-center">
                    <Check class="w-2.5 h-2.5 text-white" />
                  </span>
                </div>
                <div>
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <h3 class="text-xl font-extrabold text-slate-900">{{ user.name }}</h3>
                  </div>
                  <p class="text-sm font-semibold text-brand-600 mt-0.5">{{ user.position }}</p>
                  <p class="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Mail class="w-3.5 h-3.5" />
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </div>

            <!-- VIEW MODE: Informasi Akun (Full Width) -->
            <div v-if="activeMode === 'view'" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-card space-y-4">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <UserIcon class="w-4 h-4" />
                </div>
                <h4 class="text-sm font-extrabold text-slate-900">
                  {{ t('Informasi Akun', 'Account Information') }}
                </h4>
              </div>

              <div class="space-y-2.5 text-xs">
                <div class="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50/90">
                  <span class="text-slate-500 font-medium">{{ t('Nama Lengkap', 'Full Name') }}</span>
                  <span class="font-bold text-slate-900">{{ user.name }}</span>
                </div>
                <div class="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50/90">
                  <span class="text-slate-500 font-medium">{{ t('Alamat Email', 'Email Address') }}</span>
                  <span class="font-bold text-slate-900">{{ user.email }}</span>
                </div>
                <div class="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50/90">
                  <span class="text-slate-500 font-medium">{{ t('Nomor Telepon / HP', 'Phone Number') }}</span>
                  <span class="font-bold text-slate-900">{{ user.phone || '-' }}</span>
                </div>
                <div class="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50/90">
                  <span class="text-slate-500 font-medium">{{ t('Jabatan / Role', 'Position / Role') }}</span>
                  <span class="font-bold text-brand-600">{{ user.position }}</span>
                </div>
                <div class="flex items-center justify-between px-3.5 py-3 rounded-xl bg-slate-50/90">
                  <span class="text-slate-500 font-medium">{{ t('Tanggal Bergabung', 'Joined Date') }}</span>
                  <span class="font-bold text-slate-900">{{ user.joined_label || '14 Maret 2022' }}</span>
                </div>
              </div>

              <!-- Mobile <= 480px Logout Button -->
              <div class="min-[481px]:hidden pt-3 border-t border-slate-100">
                <button
                  type="button"
                  class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition"
                  @click="$emit('logout')"
                >
                  <LogOut class="w-4 h-4" />
                  <span>{{ t('Logout dari Akun', 'Logout from Account') }}</span>
                </button>
              </div>
            </div>

            <!-- MODE 1: EDIT PROFIL -->
            <form
              v-else-if="activeMode === 'edit_profile'"
              class="bg-white rounded-2xl p-6 border border-slate-100 shadow-card space-y-4"
              @submit.prevent="submitEditProfile"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 class="text-sm font-extrabold text-slate-900">
                  {{ t('Form Edit Profil Admin', 'Edit Admin Profile') }}
                </h4>
                <span class="text-xs text-slate-400">
                  {{ t('Semua field bertanda * wajib diisi', 'All fields marked with * are required') }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">
                    {{ t('Nama Lengkap *', 'Full Name *') }}
                  </label>
                  <input
                    v-model="profileForm.name"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                    :placeholder="t('Masukkan nama lengkap', 'Enter full name')"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">
                    {{ t('Jabatan / Role *', 'Position / Role *') }}
                  </label>
                  <input
                    v-model="profileForm.position"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                    :placeholder="t('Contoh: Lead Support Specialist', 'e.g. Lead Support Specialist')"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">
                    {{ t('Alamat Email *', 'Email Address *') }}
                  </label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    required
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                    placeholder="nama@bshsupport.io"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">
                    {{ t('Nomor HP / Telepon (Hanya Angka) *', 'Phone Number (Digits Only) *') }}
                  </label>
                  <input
                    v-model="profileForm.phone"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    required
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                    placeholder="081234567890"
                    @input="onPhoneInput"
                    @keypress="onlyDigitsKeypress"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  @click="switchMode('view')"
                >
                  {{ t('Batal', 'Cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="savingProfile"
                  class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Check class="w-4 h-4" />
                  {{ savingProfile ? t('Menyimpan...', 'Saving...') : t('Simpan Perubahan', 'Save Changes') }}
                </button>
              </div>
            </form>

            <!-- MODE 2: UBAH PASSWORD -->
            <form
              v-else-if="activeMode === 'change_password'"
              class="bg-white rounded-2xl p-6 border border-slate-100 shadow-card space-y-4"
              @submit.prevent="submitChangePassword"
            >
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 class="text-sm font-extrabold text-slate-900">
                  {{ t('Form Ubah Password', 'Change Password Form') }}
                </h4>
                <span class="text-xs text-slate-400">
                  {{ t('Minimal 6 karakter', 'Minimum 6 characters') }}
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">
                    {{ t('Password Baru *', 'New Password *') }}
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.password"
                      :type="showNewPassword ? 'text' : 'password'"
                      required
                      minlength="6"
                      class="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                      :placeholder="t('Masukkan password baru', 'Enter new password')"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">
                    {{ t('Konfirmasi Password Baru *', 'Confirm New Password *') }}
                  </label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.password_confirmation"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      required
                      minlength="6"
                      class="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                      :placeholder="t('Ulangi password baru', 'Repeat new password')"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  class="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                  @click="switchMode('view')"
                >
                  {{ t('Batal', 'Cancel') }}
                </button>
                <button
                  type="submit"
                  :disabled="savingPassword"
                  class="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
                >
                  <KeyRound class="w-4 h-4" />
                  {{ savingPassword ? t('Memproses...', 'Processing...') : t('Perbarui Password', 'Update Password') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import {
  MoreVertical,
  X,
  Check,
  Mail,
  User as UserIcon,
  UserCog,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'logout'): void
}>()

const { user, apiFetch, updateStoredUser } = useAuth()
const { t } = useLang()

const activeMode = ref<'view' | 'edit_profile' | 'change_password'>('view')
const dropdownOpen = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = reactive({
  name: '',
  position: '',
  email: '',
  phone: '',
})

const passwordForm = reactive({
  password: '',
  password_confirmation: '',
})

const initials = computed(() => {
  const name = user.value?.name || 'Admin'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

const onPhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const digitsOnly = target.value.replace(/\D/g, '')
  target.value = digitsOnly
  profileForm.phone = digitsOnly
}

const onlyDigitsKeypress = (e: KeyboardEvent) => {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

const syncFormWithUser = () => {
  if (!user.value) return
  profileForm.name = user.value.name || ''
  profileForm.position = user.value.position || ''
  profileForm.email = user.value.email || ''
  const rawPhone = user.value.phone === '-' ? '' : user.value.phone || ''
  profileForm.phone = rawPhone.replace(/\D/g, '')
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      activeMode.value = 'view'
      dropdownOpen.value = false
      syncFormWithUser()
    }
  }
)

const switchMode = (mode: 'view' | 'edit_profile' | 'change_password') => {
  syncFormWithUser()
  passwordForm.password = ''
  passwordForm.password_confirmation = ''
  showNewPassword.value = false
  showConfirmPassword.value = false
  activeMode.value = mode
  dropdownOpen.value = false
}

const closeModal = () => {
  dropdownOpen.value = false
  emit('update:modelValue', false)
}

const submitEditProfile = async () => {
  profileForm.phone = profileForm.phone.replace(/\D/g, '')
  savingProfile.value = true
  try {
    const res = await apiFetch<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: { ...profileForm },
    })
    updateStoredUser(res.user)
    activeMode.value = 'view'
    await Swal.fire({
      icon: 'success',
      title: t('Profil Diperbarui', 'Profile Updated'),
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Memperbarui Profil', 'Failed to Update Profile'),
      text: err?.data?.message || t('Terjadi kesalahan saat menyimpan profil.', 'An error occurred while saving profile.'),
      confirmButtonColor: '#042B4F',
    })
  } finally {
    savingProfile.value = false
  }
}

const submitChangePassword = async () => {
  if (passwordForm.password !== passwordForm.password_confirmation) {
    await Swal.fire({
      icon: 'warning',
      title: t('Konfirmasi Tidak Cocok', 'Password Mismatch'),
      text: t('Password baru dan konfirmasi password baru harus sama.', 'New password and confirmation must match.'),
      confirmButtonColor: '#042B4F',
    })
    return
  }

  savingPassword.value = true
  try {
    const res = await apiFetch<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: { ...passwordForm },
    })
    activeMode.value = 'view'
    await Swal.fire({
      icon: 'success',
      title: t('Password Diubah', 'Password Changed'),
      text: res.message,
      confirmButtonColor: '#042B4F',
      timer: 1800,
    })
  } catch (err: any) {
    await Swal.fire({
      icon: 'error',
      title: t('Gagal Mengubah Password', 'Failed to Change Password'),
      text: err?.data?.message || t('Terjadi kesalahan saat mengubah password.', 'An error occurred while changing password.'),
      confirmButtonColor: '#042B4F',
    })
  } finally {
    savingPassword.value = false
  }
}
</script>

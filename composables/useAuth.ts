export interface AdminUser {
  id: number
  name: string
  position: string
  email: string
  phone: string
  created_at?: string
  joined_label?: string
  stats?: {
    resolved_total: number
    open_total: number
  }
}

export const useAuth = () => {
  const token = useState<string | null>('hex_auth_token', () => null)
  const user = useState<AdminUser | null>('hex_auth_user', () => null)
  const expiresAt = useState<string | null>('hex_auth_expires', () => null)
  const initialized = useState<boolean>('hex_auth_init', () => false)

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const clearStorage = () => {
    token.value = null
    user.value = null
    expiresAt.value = null
    if (import.meta.client) {
      localStorage.removeItem('hexsupport_token')
      localStorage.removeItem('hexsupport_user')
      localStorage.removeItem('hexsupport_expires_at')
    }
  }

  const initAuth = () => {
    if (!import.meta.client || initialized.value) return
    initialized.value = true

    const savedToken = localStorage.getItem('hexsupport_token')
    const savedUser = localStorage.getItem('hexsupport_user')
    const savedExpires = localStorage.getItem('hexsupport_expires_at')

    if (savedToken && savedExpires) {
      const expTime = new Date(savedExpires).getTime()
      if (Date.now() >= expTime) {
        // Token expired (daily expiration)
        clearStorage()
        return
      }
      token.value = savedToken
      expiresAt.value = savedExpires
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch {
          user.value = null
        }
      }
    }
  }

  if (import.meta.client && !initialized.value) {
    initAuth()
  }

  const isAuthenticated = computed(() => {
    if (!token.value) return false
    if (expiresAt.value && Date.now() >= new Date(expiresAt.value).getTime()) {
      return false
    }
    return true
  })

  const setAuthData = (newToken: string, newUser: AdminUser, newExpiresAt: string) => {
    token.value = newToken
    user.value = newUser
    expiresAt.value = newExpiresAt
    if (import.meta.client) {
      localStorage.setItem('hexsupport_token', newToken)
      localStorage.setItem('hexsupport_user', JSON.stringify(newUser))
      localStorage.setItem('hexsupport_expires_at', newExpiresAt)
    }
  }

  const updateStoredUser = (updatedUser: AdminUser) => {
    user.value = updatedUser
    if (import.meta.client) {
      localStorage.setItem('hexsupport_user', JSON.stringify(updatedUser))
    }
  }

  const apiFetch = async <T = any>(path: string, options: Record<string, any> = {}): Promise<T> => {
    initAuth()
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers || {}),
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(`${apiBase}${path}`, {
        ...options,
        headers,
      })
    } catch (error: any) {
      if (error?.response?.status === 401 && token.value) {
        clearStorage()
        if (import.meta.client && window.location.pathname.startsWith('/admin')) {
          await navigateTo('/login')
        }
      }
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{
      message: string
      token: string
      expires_at: string
      user: AdminUser
    }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    setAuthData(res.token, res.user, res.expires_at)
    return res
  }

  const fetchMe = async () => {
    if (!token.value) return null
    try {
      const res = await apiFetch<{ user: AdminUser }>('/auth/me')
      updateStoredUser(res.user)
      return res.user
    } catch {
      return null
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await apiFetch('/auth/logout', { method: 'POST' })
      }
    } catch {
      // ignore error on logout
    } finally {
      clearStorage()
    }
  }

  return {
    token,
    user,
    expiresAt,
    isAuthenticated,
    initAuth,
    apiFetch,
    login,
    fetchMe,
    logout,
    updateStoredUser,
    clearStorage,
  }
}

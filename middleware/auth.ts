export default defineNuxtRouteMiddleware((to) => {
  const { initAuth, isAuthenticated } = useAuth()
  initAuth()

  if (to.path.startsWith('/admin') && !isAuthenticated.value) {
    return navigateTo('/login')
  }
})

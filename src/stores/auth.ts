import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Usuario, LoginRequest, LoginResponse } from '@/types'
import apiService from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<Usuario | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.rol?.nombre || '')
  const isAdmin = computed(() => userRole.value === 'Admin')
  const isMesero = computed(() => userRole.value === 'Mesero')
  const isCliente = computed(() => userRole.value === 'Cliente')

  // Actions
  async function login(credentials: LoginRequest) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.login(credentials)
      
      token.value = response.token
      user.value = {
        id: response.id,
        nombre: response.nombre,
        email: response.email,
        direccion: response.direccion,
        telefono: response.telefono,
        rol: response.rol
      }
      
      localStorage.setItem('token', response.token)
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await apiService.logout()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      // Limpiar estado local independientemente del resultado del API
      token.value = null
      refreshToken.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  async function loadUser() {
    if (!token.value) return
    
    try {
      const userData = await apiService.getCurrentUser()
      user.value = userData
    } catch (err) {
      console.error('Error al cargar usuario:', err)
      // Si falla, limpiar tokens
      await logout()
    }
  }

  function clearError() {
    error.value = null
  }

  // Inicializar usuario si hay token
  if (token.value) {
    loadUser()
  }

  return {
    // Estado
    user,
    token,
    refreshToken,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isMesero,
    isCliente,
    
    // Actions
    login,
    logout,
    loadUser,
    clearError
  }
})

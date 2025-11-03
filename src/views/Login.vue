<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🍽️ Milo Restaurant</h1>
          <p>Iniciar Sesión</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button 
            type="submit" 
            class="btn btn-primary login-btn"
            :disabled="loading"
          >
            <span v-if="loading">Iniciando...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div class="login-footer">
          <p>Sistema de Gestión de Restaurantes</p>
          <div class="login-actions">
            <router-link to="/create-user" class="btn btn-secondary">
              Crear Cuenta
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import type { LoginRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const { success } = useNotifications()

const form = reactive<LoginRequest>({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.login(form)
    
    // Mostrar notificación de éxito
    success(
      '¡Login Exitoso!',
      `Bienvenido, ${authStore.user?.nombre || 'Usuario'}`
    )
    
    // Redirigir según el rol del usuario
    const userRole = authStore.userRole
    
    if (userRole === 'Admin') {
      router.push('/dashboard')
    } else if (userRole === 'Mesero') {
      router.push('/pedidos')
    } else {
      router.push('/')
    }
  } catch (err: any) {
    console.error('Error en login:', err)
    error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.login-header p {
  color: #666;
  font-size: 1.1rem;
}

.login-form {
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1.1rem;
  margin-top: 1rem;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.login-footer p {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.login-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.login-actions .btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>

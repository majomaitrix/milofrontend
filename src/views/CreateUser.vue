<template>
  <div class="create-user-page">
    <div class="container">
      <div class="page-header">
        <div class="breadcrumb">
          <router-link to="/" class="breadcrumb-link">Inicio</router-link>
          <span class="breadcrumb-separator">/</span>
          <router-link to="/login" class="breadcrumb-link">Login</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Crear Usuario</span>
        </div>
        <h1>👤 Crear Usuario</h1>
        <p>¡Únete a nuestro sistema de gestión de restaurantes!</p>
        <p class="welcome-text">Completa el formulario para crear tu cuenta y acceder a todas las funcionalidades.</p>
        <div class="header-actions">
          <router-link to="/login" class="btn btn-secondary">
            ← Volver al Login
          </router-link>
        </div>
      </div>

      <!-- Formulario de creación de usuario -->
      <div class="card">
        <div class="form-header">
          <h3>Formulario de Registro</h3>
          <p class="required-note">Los campos marcados con * son obligatorios</p>
        </div>
        <form @submit.prevent="handleSubmit" class="user-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre Completo *</label>
              <input
                v-model="form.nombre"
                type="text"
                class="form-control"
                placeholder="Nombre completo del usuario"
                required
                :class="{ 'error': errors.nombre }"
              />
              <div v-if="errors.nombre" class="error-message">{{ errors.nombre }}</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                placeholder="usuario@ejemplo.com"
                required
                :class="{ 'error': errors.email }"
              />
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Contraseña *</label>
              <input
                v-model="form.contraseña"
                type="password"
                class="form-control"
                placeholder="Mínimo 6 caracteres"
                required
                :class="{ 'error': errors.contraseña }"
              />
              <div v-if="errors.contraseña" class="error-message">{{ errors.contraseña }}</div>
              <div class="password-hint">
                Debe contener al menos una letra minúscula, una mayúscula y un número
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Confirmar Contraseña *</label>
              <input
                v-model="form.confirmarContraseña"
                type="password"
                class="form-control"
                placeholder="Repite la contraseña"
                required
                :class="{ 'error': errors.confirmarContraseña }"
              />
              <div v-if="errors.confirmarContraseña" class="error-message">{{ errors.confirmarContraseña }}</div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Rol *</label>
              <select 
                v-model="form.rol" 
                class="form-control" 
                required
                :class="{ 'error': errors.rol }"
              >
                <option value="">Seleccionar rol</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.nombre }}
                </option>
              </select>
              <div v-if="errors.rol" class="error-message">{{ errors.rol }}</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input
                v-model="form.telefono"
                type="tel"
                class="form-control"
                placeholder="Número de teléfono"
                :class="{ 'error': errors.telefono }"
              />
              <div v-if="errors.telefono" class="error-message">{{ errors.telefono }}</div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Dirección</label>
            <textarea
              v-model="form.direccion"
              class="form-control"
              rows="3"
              placeholder="Dirección completa del usuario"
              :class="{ 'error': errors.direccion }"
            ></textarea>
            <div v-if="errors.direccion" class="error-message">{{ errors.direccion }}</div>
          </div>
          
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>
          
          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
            <div class="success-actions">
              <router-link to="/login" class="btn btn-primary">
                Ir al Login
              </router-link>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading">Creando Usuario...</span>
              <span v-else>Crear Usuario</span>
            </button>
            
            <button @click="resetForm" type="button" class="btn btn-secondary">
              Limpiar Formulario
            </button>
          </div>
        </form>
      </div>

      <!-- Información de roles -->
      <div class="card">
        <h3>Información de Roles</h3>
        <div class="roles-info">
          <div v-for="role in roles" :key="role.id" class="role-card">
            <h4>{{ role.nombre }}</h4>
            <p>{{ getRoleDescription(role.nombre) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import apiService from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'
import type { CreateUserRequest, Role } from '@/types'

const { success: showSuccess } = useNotifications()

// Estado
const roles = ref<Role[]>([])
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

// Formulario
const form = reactive<CreateUserRequest & { confirmarContraseña: string }>({
  nombre: '',
  email: '',
  contraseña: '',
  confirmarContraseña: '',
  rol: 0,
  direccion: '',
  telefono: ''
})

// Errores de validación
const errors = reactive<Record<string, string>>({})

// Cargar roles
const loadRoles = async () => {
  try {
    const response = await apiService.getRoles()
    roles.value = response
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar roles'
  }
}

// Validar formulario
const validateForm = (): boolean => {
  errors.nombre = ''
  errors.email = ''
  errors.contraseña = ''
  errors.confirmarContraseña = ''
  errors.rol = ''
  errors.telefono = ''
  errors.direccion = ''

  let isValid = true

  // Validar nombre
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio'
    isValid = false
  } else if (form.nombre.length < 2 || form.nombre.length > 100) {
    errors.nombre = 'El nombre debe tener entre 2 y 100 caracteres'
    isValid = false
  }

  // Validar email
  if (!form.email.trim()) {
    errors.email = 'El email es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El formato del email no es válido'
    isValid = false
  }

  // Validar contraseña
  if (!form.contraseña) {
    errors.contraseña = 'La contraseña es obligatoria'
    isValid = false
  } else if (form.contraseña.length < 6 || form.contraseña.length > 100) {
    errors.contraseña = 'La contraseña debe tener entre 6 y 100 caracteres'
    isValid = false
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(form.contraseña)) {
    errors.contraseña = 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
    isValid = false
  }

  // Validar confirmación de contraseña
  if (!form.confirmarContraseña) {
    errors.confirmarContraseña = 'Debe confirmar la contraseña'
    isValid = false
  } else if (form.contraseña !== form.confirmarContraseña) {
    errors.confirmarContraseña = 'Las contraseñas no coinciden'
    isValid = false
  }

  // Validar rol
  if (!form.rol || form.rol === 0) {
    errors.rol = 'Debe seleccionar un rol'
    isValid = false
  }

  // Validar teléfono (opcional)
  if (form.telefono && !/^[\d\s\-\+\(\)]+$/.test(form.telefono)) {
    errors.telefono = 'El formato del teléfono no es válido'
    isValid = false
  }

  // Validar dirección (opcional)
  if (form.direccion && form.direccion.length > 500) {
    errors.direccion = 'La dirección no puede exceder 500 caracteres'
    isValid = false
  }

  return isValid
}

// Manejar envío del formulario
const handleSubmit = async () => {
  error.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const userData: CreateUserRequest = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      contraseña: form.contraseña,
      rol: form.rol,
      direccion: form.direccion?.trim() || undefined,
      telefono: form.telefono?.trim() || undefined
    }

    const response = await apiService.createUser(userData)
    
    // Mostrar notificación de éxito
    showSuccess(
      '¡Usuario Creado!',
      'El usuario ha sido registrado exitosamente. Ya puedes iniciar sesión.'
    )
    
    successMessage.value = '¡Usuario creado exitosamente! Ya puedes iniciar sesión con tus credenciales.'
    resetForm()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear usuario'
  } finally {
    loading.value = false
  }
}

// Resetear formulario
const resetForm = () => {
  Object.assign(form, {
    nombre: '',
    email: '',
    contraseña: '',
    confirmarContraseña: '',
    rol: 0,
    direccion: '',
    telefono: ''
  })
  
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  error.value = ''
  successMessage.value = ''
}

// Obtener descripción del rol
const getRoleDescription = (roleName: string): string => {
  const descriptions: Record<string, string> = {
    'Admin': 'Acceso completo al sistema. Puede gestionar usuarios, productos, categorías y pedidos.',
    'Mesero': 'Puede gestionar pedidos y cambiar estados. Acceso limitado a funciones administrativas.',
    'Cliente': 'Acceso básico para realizar pedidos y ver su historial.'
  }
  
  return descriptions[roleName] || 'Rol del sistema'
}

// Cargar datos iniciales
onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.create-user-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #999;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.welcome-text {
  color: #999 !important;
  font-size: 1rem !important;
  font-style: italic;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.success-actions {
  margin-top: 1rem;
  text-align: center;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.form-header h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.required-note {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 1rem;
}

.password-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-control.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.roles-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.role-card {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.role-card h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.role-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .roles-info {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>🍽️ Milo Restaurant</h1>
      </div>
      <div class="nav-menu">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/categorias" class="nav-link">Categorías</router-link>
        <router-link to="/productos" class="nav-link">Productos</router-link>
        <router-link to="/pedidos" class="nav-link">Pedidos</router-link>
        <router-link to="/admin-productos" class="nav-link" v-if="isAdmin">Admin Productos</router-link>
        <router-link to="/create-user" class="nav-link" v-if="isAdmin">Crear Usuario</router-link>
        <router-link to="/create-user" class="nav-link" v-if="!isAuthenticated">Crear Cuenta</router-link>
        <router-link to="/login" class="nav-link" v-if="!isAuthenticated">Login</router-link>
        <button @click="logout" class="nav-link logout-btn" v-if="isAuthenticated">Logout</button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
    
    <footer class="footer">
      <p>&copy; 2025 Milo Restaurant - Sistema de Gestión</p>
    </footer>
    
    <!-- Contenedor de notificaciones -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import NotificationContainer from '@/components/NotificationContainer.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

const logout = () => {
  authStore.logout()
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.1);
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
}

.main-content {
  min-height: calc(100vh - 140px);
  padding: 2rem;
}

.footer {
  background-color: #f8f9fa;
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  color: #6c757d;
}
</style>

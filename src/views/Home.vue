<template>
  <div class="home">
    <div class="hero-section">
      <div class="container">
        <h1 class="hero-title">🍽️ Bienvenido a Milo Restaurant</h1>
        <p class="hero-subtitle">Sistema de Gestión Integral para Restaurantes</p>
        <div class="hero-actions">
          <router-link to="/categorias" class="btn btn-primary">Ver Categorías</router-link>
          <router-link to="/productos" class="btn btn-secondary">Ver Productos</router-link>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="features-section">
        <h2>Características del Sistema</h2>
        <div class="grid grid-3">
          <div class="card feature-card">
            <div class="feature-icon">📋</div>
            <h3>Gestión de Categorías</h3>
            <p>Organiza tus productos por categorías con paginación y búsqueda avanzada.</p>
          </div>
          
          <div class="card feature-card">
            <div class="feature-icon">🍕</div>
            <h3>Gestión de Productos</h3>
            <p>Administra tu inventario con filtros avanzados y control de stock.</p>
          </div>
          
          <div class="card feature-card">
            <div class="feature-icon">📦</div>
            <h3>Gestión de Pedidos</h3>
            <p>Sistema completo de pedidos con estados y seguimiento en tiempo real.</p>
          </div>
          
          <div class="card feature-card">
            <div class="feature-icon">👥</div>
            <h3>Control de Usuarios</h3>
            <p>Gestión de roles y permisos para diferentes tipos de usuarios.</p>
          </div>
          
          <div class="card feature-card">
            <div class="feature-icon">🔐</div>
            <h3>Autenticación Segura</h3>
            <p>Sistema de autenticación con JWT y refresh tokens para máxima seguridad.</p>
          </div>
          
          <div class="card feature-card">
            <div class="feature-icon">📊</div>
            <h3>Dashboard</h3>
            <p>Panel de control con métricas y estadísticas en tiempo real.</p>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h2>Estadísticas del Sistema</h2>
        <div class="grid grid-4">
          <div class="stat-card">
            <div class="stat-number">{{ stats.categorias }}</div>
            <div class="stat-label">Categorías</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.productos }}</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.pedidos }}</div>
            <div class="stat-label">Pedidos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.usuarios }}</div>
            <div class="stat-label">Usuarios</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref({
  categorias: 0,
  productos: 0,
  pedidos: 0,
  usuarios: 0
})

onMounted(async () => {
  // Aquí podrías cargar estadísticas reales desde la API
  // Por ahora usamos datos de ejemplo
  stats.value = {
    categorias: 8,
    productos: 45,
    pedidos: 123,
    usuarios: 12
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features-section {
  padding: 4rem 0;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #333;
}

.feature-card {
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.stats-section {
  padding: 4rem 0;
  background-color: #f8f9fa;
  margin: 2rem 0;
  border-radius: 10px;
}

.stats-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #333;
}

.stat-card {
  text-align: center;
  padding: 2rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .features-section h2,
  .stats-section h2 {
    font-size: 2rem;
  }
}
</style>


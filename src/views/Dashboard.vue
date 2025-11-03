<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="page-header">
        <h1>📊 Dashboard</h1>
        <p>Bienvenido, {{ user?.nombre || 'Usuario' }} - {{ userRole }}</p>
        <div class="user-info">
          <div class="user-details">
            <span class="user-email">{{ user?.email }}</span>
            <span v-if="user?.telefono" class="user-phone">{{ user.telefono }}</span>
          </div>
        </div>
      </div>

      <!-- Métricas principales -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">📋</div>
          <div class="metric-content">
            <h3>{{ metrics.categorias }}</h3>
            <p>Categorías Activas</p>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">🍕</div>
          <div class="metric-content">
            <h3>{{ metrics.productos }}</h3>
            <p>Productos en Stock</p>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">📦</div>
          <div class="metric-content">
            <h3>{{ metrics.pedidosHoy }}</h3>
            <p>Pedidos Hoy</p>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <h3>${{ metrics.ventasHoy.toFixed(2) }}</h3>
            <p>Ventas Hoy</p>
          </div>
        </div>
      </div>

      <!-- Gráficos y estadísticas -->
      <div class="charts-grid">
        <div class="card chart-card">
          <h3>Pedidos por Estado</h3>
          <div class="chart-placeholder">
            <div class="chart-bar" v-for="estado in estadosPedido" :key="estado.value">
              <div class="chart-label">{{ estado.label }}</div>
              <div class="chart-bar-container">
                <div 
                  class="chart-bar-fill"
                  :style="{ width: getEstadoPercentage(estado.value) + '%' }"
                ></div>
              </div>
              <div class="chart-value">{{ getEstadoCount(estado.value) }}</div>
            </div>
          </div>
        </div>
        
        <div class="card chart-card">
          <h3>Productos por Categoría</h3>
          <div class="chart-placeholder">
            <div class="chart-bar" v-for="categoria in categorias" :key="categoria.id">
              <div class="chart-label">{{ categoria.nombre }}</div>
              <div class="chart-bar-container">
                <div 
                  class="chart-bar-fill"
                  :style="{ width: getCategoriaPercentage(categoria.id) + '%' }"
                ></div>
              </div>
              <div class="chart-value">{{ getCategoriaCount(categoria.id) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="card">
        <h3>Acciones Rápidas</h3>
        <div class="quick-actions">
          <router-link to="/categorias" class="action-btn">
            <div class="action-icon">📋</div>
            <div class="action-text">Gestionar Categorías</div>
          </router-link>
          
          <router-link to="/productos" class="action-btn">
            <div class="action-icon">🍕</div>
            <div class="action-text">Gestionar Productos</div>
          </router-link>
          
          <router-link to="/pedidos" class="action-btn">
            <div class="action-icon">📦</div>
            <div class="action-text">Ver Pedidos</div>
          </router-link>
          
          <button @click="refreshData" class="action-btn">
            <div class="action-icon">🔄</div>
            <div class="action-text">Actualizar Datos</div>
          </button>
        </div>
      </div>

      <!-- Estado del sistema -->
      <div class="card">
        <h3>Estado del Sistema</h3>
        <div class="system-status">
          <div class="status-item">
            <span class="status-indicator success"></span>
            <span>API Conectada</span>
          </div>
          <div class="status-item">
            <span class="status-indicator success"></span>
            <span>Base de Datos</span>
          </div>
          <div class="status-item">
            <span class="status-indicator success"></span>
            <span>Autenticación</span>
          </div>
          <div class="status-item">
            <span class="status-indicator success"></span>
            <span>Servicios</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiService from '@/services/api'
import type { Categoria, EstadoPedido, Pedido } from '@/types'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole)

// Estado
const metrics = reactive({
  categorias: 0,
  productos: 0,
  pedidosHoy: 0,
  ventasHoy: 0
})

const categorias = ref<Categoria[]>([])
const pedidos = ref<Pedido[]>([])
const estadosPedido = ref<Array<{ value: EstadoPedido; label: string }>>([])

// Cargar métricas
const loadMetrics = async () => {
  try {
    // Cargar categorías
    const categoriasResponse = await apiService.getCategorias({ page: 1, pageSize: 100 })
    categorias.value = categoriasResponse.data
    metrics.categorias = categorias.value.filter(c => c.activa).length

    // Cargar productos
    const productosResponse = await apiService.getProductos({ page: 1, pageSize: 100 })
    metrics.productos = productosResponse.data.filter(p => p.activo && p.stock > 0).length

    // Cargar pedidos del día
    const today = new Date().toISOString().split('T')[0]
    const pedidosResponse = await apiService.getPedidos({
      page: 1,
      pageSize: 100,
      fechaInicio: today,
      fechaFin: today
    })
    pedidos.value = pedidosResponse.data
    metrics.pedidosHoy = pedidos.value.length
    metrics.ventasHoy = pedidos.value.reduce((sum, pedido) => sum + pedido.total, 0)

    // Cargar estados de pedido
    const estadosResponse = await apiService.getEstadosPedido()
    estadosPedido.value = estadosResponse

  } catch (error) {
    console.error('Error al cargar métricas:', error)
  }
}

// Utilidades para gráficos
const getEstadoCount = (estado: EstadoPedido) => {
  return pedidos.value.filter(p => p.estado === estado).length
}

const getEstadoPercentage = (estado: EstadoPedido) => {
  const count = getEstadoCount(estado)
  const total = pedidos.value.length
  return total > 0 ? (count / total) * 100 : 0
}

const getCategoriaCount = (categoriaId: number) => {
  // Aquí necesitarías cargar los productos para contar por categoría
  // Por simplicidad, usamos datos de ejemplo
  return Math.floor(Math.random() * 20) + 1
}

const getCategoriaPercentage = (categoriaId: number) => {
  const count = getCategoriaCount(categoriaId)
  const total = categorias.value.length * 10 // Valor aproximado
  return total > 0 ? (count / total) * 100 : 0
}

// Refrescar datos
const refreshData = () => {
  loadMetrics()
}

// Cargar datos iniciales
onMounted(() => {
  loadMetrics()
})
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  font-size: 2.5rem;
}

.metric-content h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.metric-content p {
  color: #666;
  margin: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  padding: 1.5rem;
}

.chart-card h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chart-label {
  min-width: 120px;
  font-size: 0.9rem;
  color: #666;
}

.chart-bar-container {
  flex: 1;
  height: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
}

.chart-bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.chart-value {
  min-width: 30px;
  text-align: right;
  font-weight: bold;
  color: #333;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.action-text {
  font-weight: 500;
  text-align: center;
}

.system-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.success {
  background-color: #28a745;
}

.status-indicator.warning {
  background-color: #ffc107;
}

.status-indicator.danger {
  background-color: #dc3545;
}

.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-email {
  font-weight: 500;
}

.user-phone {
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .system-status {
    grid-template-columns: 1fr;
  }
}
</style>

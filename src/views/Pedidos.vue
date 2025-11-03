<template>
  <div class="pedidos-page">
    <div class="container">
      <div class="page-header">
        <h1>📦 Gestión de Pedidos</h1>
        <p>Administra y sigue el estado de los pedidos del restaurante</p>
      </div>

      <!-- Filtros -->
      <div class="card filters-card">
        <h3>Filtros de Pedidos</h3>
        <div class="filters-row">
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select v-model="filters.estado" class="form-control">
              <option value="">Todos los estados</option>
              <option v-for="estado in estadosPedido" :key="estado.value" :value="estado.value">
                {{ estado.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Fecha Inicio</label>
            <input
              v-model="filters.fechaInicio"
              type="date"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Fecha Fin</label>
            <input
              v-model="filters.fechaFin"
              type="date"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Total Mínimo</label>
            <input
              v-model.number="filters.totalMin"
              type="number"
              class="form-control"
              placeholder="0"
            />
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="applyFilters" class="btn btn-primary">Aplicar Filtros</button>
          <button @click="clearFilters" class="btn btn-secondary">Limpiar</button>
        </div>
      </div>

      <!-- Lista de pedidos -->
      <div class="card">
        <div v-if="loading" class="loading">
          <p>Cargando pedidos...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <div v-else>
          <div class="pedidos-list">
            <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
              <div class="pedido-header">
                <div class="pedido-info">
                  <h3>Pedido #{{ pedido.id }}</h3>
                  <p class="pedido-fecha">{{ formatDate(pedido.fecha) }}</p>
                  <p class="pedido-usuario">👤 {{ pedido.usuarioNombre || 'Usuario desconocido' }}</p>
                </div>
                
                <div class="pedido-total">
                  <span class="total-amount">${{ pedido.total.toFixed(2) }}</span>
                </div>
              </div>
              
              <div class="pedido-body">
                <div class="pedido-estado">
                  <span 
                    class="status-badge"
                    :class="getEstadoClass(pedido.estado)"
                  >
                    {{ getEstadoLabel(pedido) }}
                  </span>
                </div>
                
                <div v-if="pedido.observaciones" class="pedido-observaciones">
                  <strong>Observaciones:</strong> {{ pedido.observaciones }}
                </div>
                
                <div v-if="pedido.detalles && pedido.detalles.length > 0" class="pedido-detalles">
                  <h4>Detalles del Pedido:</h4>
                  <ul>
                    <li v-for="detalle in pedido.detalles" :key="detalle.id">
                      {{ detalle.cantidad }}x {{ detalle.producto?.nombre || 'Producto' }} - ${{ detalle.subtotal.toFixed(2) }}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="pedido-actions">
                <button 
                  @click="viewPedido(pedido)"
                  class="btn btn-secondary btn-sm"
                >
                  Ver Detalles
                </button>
                
                <div v-if="canChangeEstado" class="estado-actions">
                  <select 
                    v-model="newEstados[pedido.id]"
                    class="form-control estado-select"
                    @change="changeEstado(pedido.id, newEstados[pedido.id])"
                  >
                    <option value="">Cambiar Estado</option>
                    <option 
                      v-for="estado in getValidEstados(pedido.estado)"
                      :key="estado.value"
                      :value="estado.value"
                    >
                      {{ estado.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="pagination" class="pagination-container">
            <div class="pagination-info">
              Mostrando {{ pedidos.length }} de {{ pagination.totalItems }} pedidos
            </div>
            
            <div class="pagination">
              <button 
                @click="goToPage(pagination.page - 1)"
                :disabled="!pagination.hasPrevious"
                class="btn btn-secondary"
              >
                ← Anterior
              </button>
              
              <span class="page-info">
                Página {{ pagination.page }} de {{ pagination.totalPages }}
              </span>
              
              <button 
                @click="goToPage(pagination.page + 1)"
                :disabled="!pagination.hasNext"
                class="btn btn-secondary"
              >
                Siguiente →
              </button>
            </div>
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
import type { Pedido, PedidoFilters, PagedRequest, PaginationMetadata } from '@/types'
import { EstadoPedido } from '@/types'

const authStore = useAuthStore()

// Estado
const pedidos = ref<Pedido[]>([])
const estadosPedido = ref<Array<{ value: number; label: string }>>([])
const pagination = ref<PaginationMetadata | null>(null)
const loading = ref(false)
const error = ref('')
const newEstados = ref<Record<number, number>>({})

// Filtros
const filters = reactive<PedidoFilters & PagedRequest>({
  page: 1,
  pageSize: 10,
  estado: undefined,
  fechaInicio: undefined,
  fechaFin: undefined,
  totalMin: undefined
})

// Computed
const canChangeEstado = computed(() => {
  console.log('🔍 Verificando permisos - isAdmin:', authStore.isAdmin, 'isMesero:', authStore.isMesero)
  return authStore.isAdmin || authStore.isMesero
})

// Cargar estados de pedido
const loadEstadosPedido = async () => {
  console.log('🔄 Cargando estados de pedido...')
  try {
    const response = await apiService.getEstadosPedido()
    console.log('📥 Estados recibidos:', response)
    estadosPedido.value = response
  } catch (err) {
    console.error('❌ Error al cargar estados:', err)
  }
}

// Cargar pedidos
const loadPedidos = async () => {
  console.log('🔄 Iniciando carga de pedidos...')
  loading.value = true
  error.value = ''
  
  try {
    console.log('📤 Enviando filtros:', filters)
    const response = await apiService.getPedidos(filters)
    console.log('📥 Respuesta recibida:', response)
    
    pedidos.value = response.data
    pagination.value = response.pagination
    
    console.log('✅ Pedidos cargados:', pedidos.value.length)
    console.log('📊 Paginación:', pagination.value)
  } catch (err: any) {
    console.error('❌ Error al cargar pedidos:', err)
    console.error('❌ Error details:', err.response?.data)
    error.value = err.response?.data?.message || 'Error al cargar pedidos'
  } finally {
    console.log('🏁 Finalizando carga de pedidos')
    loading.value = false
  }
}

// Aplicar filtros
const applyFilters = () => {
  filters.page = 1
  loadPedidos()
}

// Limpiar filtros
const clearFilters = () => {
  Object.assign(filters, {
    page: 1,
    pageSize: 10,
    estado: undefined,
    fechaInicio: undefined,
    fechaFin: undefined,
    totalMin: undefined
  })
  loadPedidos()
}

// Navegación de páginas
const goToPage = (page: number) => {
  if (page >= 1 && page <= (pagination.value?.totalPages || 1)) {
    filters.page = page
    loadPedidos()
  }
}

// Cambiar estado del pedido
const changeEstado = async (pedidoId: number, nuevoEstado: number | undefined) => {
  if (!nuevoEstado) return
  
  try {
    await apiService.cambiarEstadoPedido(pedidoId, nuevoEstado)
    // Recargar pedidos para mostrar el cambio
    loadPedidos()
    // Limpiar el select
    delete newEstados.value[pedidoId]
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cambiar estado'
  }
}

// Ver detalles del pedido
const viewPedido = (pedido: Pedido) => {
  console.log('Ver pedido:', pedido)
  // Aquí podrías navegar a una vista de detalles o mostrar un modal
}

// Utilidades
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEstadoLabel = (pedido: Pedido) => {
  return pedido.estadoNombre || 'Desconocido'
}

const getEstadoClass = (estado: number) => {
  const classes = {
    [EstadoPedido.Pendiente]: 'warning',
    [EstadoPedido.Preparando]: 'info',
    [EstadoPedido.Listo]: 'success',
    [EstadoPedido.Entregado]: 'primary',
    [EstadoPedido.Cancelado]: 'danger'
  }
  return classes[estado] || 'secondary'
}

const getValidEstados = (estadoActual: number) => {
  // Lógica para determinar qué estados son válidos desde el estado actual
  const validTransitions: Record<number, number[]> = {
    [EstadoPedido.Pendiente]: [EstadoPedido.Preparando, EstadoPedido.Cancelado],
    [EstadoPedido.Preparando]: [EstadoPedido.Listo, EstadoPedido.Cancelado],
    [EstadoPedido.Listo]: [EstadoPedido.Entregado],
    [EstadoPedido.Entregado]: [],
    [EstadoPedido.Cancelado]: []
  }
  
  return estadosPedido.value.filter(estado => 
    validTransitions[estadoActual]?.includes(estado.value) || false
  )
}

// Cargar datos iniciales
onMounted(async () => {
  console.log('🚀 Componente Pedidos montado, iniciando carga de datos...')
  
  try {
    console.log('📋 Cargando estados de pedido...')
    await loadEstadosPedido()
    console.log('✅ Estados cargados, ahora cargando pedidos...')
    await loadPedidos()
    console.log('🎉 Carga inicial completada')
  } catch (err) {
    console.error('❌ Error en carga inicial:', err)
  }
})
</script>

<style scoped>
.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pedido-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.pedido-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.pedido-fecha,
.pedido-usuario {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
}

.pedido-body {
  margin-bottom: 1rem;
}

.pedido-estado {
  margin-bottom: 1rem;
}

.pedido-observaciones {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.pedido-detalles {
  margin-bottom: 1rem;
}

.pedido-detalles h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.pedido-detalles ul {
  list-style: none;
  padding: 0;
}

.pedido-detalles li {
  padding: 0.25rem 0;
  color: #666;
}

.pedido-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.estado-actions {
  display: flex;
  gap: 0.5rem;
}

.estado-select {
  min-width: 150px;
}

.status-badge.warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.success {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.primary {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.danger {
  background-color: #f8d7da;
  color: #721c24;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .pedido-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pedido-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
}
</style>

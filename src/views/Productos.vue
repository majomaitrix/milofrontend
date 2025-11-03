<template>
  <div class="productos-page">
    <div class="container">
      <div class="page-header">
        <h1>🍕 Gestión de Productos</h1>
        <p>Administra el inventario de productos del restaurante</p>
      </div>

      <!-- Filtros avanzados -->
      <div class="card filters-card">
        <h3>Filtros Avanzados</h3>
        <div class="filters-grid">
          <div class="form-group">
            <label class="form-label">Buscar</label>
            <input
              v-model="filters.searchTerm"
              type="text"
              class="form-control"
              placeholder="Buscar productos..."
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select v-model="filters.categoriaId" class="form-control">
              <option value="">Todas las categorías</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Precio Mínimo</label>
            <input
              v-model.number="filters.precioMin"
              type="number"
              class="form-control"
              placeholder="0"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Precio Máximo</label>
            <input
              v-model.number="filters.precioMax"
              type="number"
              class="form-control"
              placeholder="1000"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Stock Mínimo</label>
            <input
              v-model.number="filters.stockMin"
              type="number"
              class="form-control"
              placeholder="0"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select v-model="filters.activo" class="form-control">
              <option value="">Todos</option>
              <option :value="true">Activos</option>
              <option :value="false">Inactivos</option>
            </select>
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="applyFilters" class="btn btn-primary">Aplicar Filtros</button>
          <button @click="clearFilters" class="btn btn-secondary">Limpiar</button>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="card">
        <div v-if="loading" class="loading">
          <p>Cargando productos...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <div v-else>
          <div class="products-grid">
            <div v-for="producto in productos" :key="producto.id" class="product-card">
              <div class="product-image">
                <img 
                  :src="getProductImage(producto)" 
                  :alt="producto.nombre"
                  @error="handleImageError"
                />
              </div>
              
              <div class="product-info">
                <h3>{{ producto.nombre }}</h3>
                <p class="product-description">{{ producto.descripcion }}</p>
                <div class="product-details">
                  <span class="product-price">${{ producto.precio.toFixed(2) }}</span>
                  <span class="product-stock">Stock: {{ producto.stock }}</span>
                </div>
                <div class="product-category">
                  📂 {{ producto.categoria?.nombre || 'Sin categoría' }}
                </div>
                <div class="product-status">
                  <span 
                    class="status-badge"
                    :class="producto.activo ? 'active' : 'inactive'"
                  >
                    {{ producto.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="pagination" class="pagination-container">
            <div class="pagination-info">
              Mostrando {{ productos.length }} de {{ pagination.totalItems }} productos
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
import { ref, reactive, onMounted } from 'vue'
import apiService from '@/services/api'
import type { Producto, Categoria, PagedRequest, ProductoFilters, PaginationMetadata } from '@/types'

// Estado
const productos = ref<Producto[]>([])
const categorias = ref<Categoria[]>([])
const pagination = ref<PaginationMetadata | null>(null)
const loading = ref(false)
const error = ref('')

// Filtros (paginación + filtros avanzados)
const filters = reactive<PagedRequest & ProductoFilters>({
  page: 1,
  pageSize: 12,
  searchTerm: '',
  sortBy: 'nombre',
  sortDescending: false,
  categoriaId: undefined,
  precioMin: undefined,
  precioMax: undefined,
  stockMin: undefined,
  activo: undefined
})

// Cargar categorías
const loadCategorias = async () => {
  try {
    const response = await apiService.getCategorias({ page: 1, pageSize: 100 })
    categorias.value = response.data
  } catch (err) {
    console.error('Error al cargar categorías:', err)
  }
}

// Cargar productos (con filtros avanzados)
const loadProductos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('Cargando productos con filtros:', filters)
    const response = await apiService.getProductosConFiltros(filters)
    console.log('Respuesta de productos:', response)
    productos.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    console.error('Error al cargar productos:', err)
    error.value = err.response?.data?.message || 'Error al cargar productos'
  } finally {
    loading.value = false
  }
}

// Aplicar filtros
const applyFilters = () => {
  filters.page = 1
  loadProductos()
}

// Limpiar filtros
const clearFilters = () => {
  Object.assign(filters, {
    page: 1,
    pageSize: 12,
    searchTerm: '',
    categoriaId: undefined,
    precioMin: undefined,
    precioMax: undefined,
    stockMin: undefined,
    activo: undefined
  })
  loadProductos()
}

// Navegación de páginas
const goToPage = (page: number) => {
  if (page >= 1 && page <= (pagination.value?.totalPages || 1)) {
    filters.page = page
    loadProductos()
  }
}

// Obtener imagen del producto
const getProductImage = (producto: Producto) => {
  if (producto.imagen && producto.imagen.trim() !== '') {
    // Si la imagen ya tiene el prefijo data:, la devolvemos tal como está
    if (producto.imagen.startsWith('data:')) {
      return producto.imagen
    }
    // Si es base64 sin prefijo, agregamos el prefijo
    return `data:image/jpeg;base64,${producto.imagen}`
  }
  return '/src/assets/placeholder-food.svg'
}

// Manejar error de imagen
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/src/assets/placeholder-food.svg'
}

// Cargar datos iniciales
onMounted(() => {
  loadCategorias()
  loadProductos()
})
</script>

<style scoped>
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.product-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.product-price {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
}

.product-stock {
  color: #666;
  font-size: 0.9rem;
}

.product-category {
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.product-status {
  text-align: right;
}

.filters-grid {
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
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
}
</style>

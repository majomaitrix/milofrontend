<template>
  <div class="categorias-page">
    <div class="container">
      <div class="page-header">
        <h1>📋 Gestión de Categorías</h1>
        <p>Administra las categorías de productos del restaurante</p>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card filters-card">
        <div class="filters-row">
          <div class="search-group">
            <input
              v-model="searchTerm"
              type="text"
              class="form-control"
              placeholder="Buscar categorías..."
              @input="debouncedSearch"
            />
          </div>
          
          <div class="sort-group">
            <select v-model="sortBy" class="form-control" @change="loadCategorias">
              <option value="nombre">Ordenar por Nombre</option>
              <option value="id">Ordenar por ID</option>
            </select>
          </div>
          
          <div class="sort-order">
            <button 
              @click="toggleSortOrder"
              class="btn btn-secondary"
              :class="{ 'active': sortDescending }"
            >
              {{ sortDescending ? '↓ Descendente' : '↑ Ascendente' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de categorías -->
      <div class="card">
        <div v-if="loading" class="loading">
          <p>Cargando categorías...</p>
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="categoria in categorias" :key="categoria.id">
                  <td>{{ categoria.id }}</td>
                  <td>
                    <strong>{{ categoria.nombre }}</strong>
                  </td>
                  <td>{{ categoria.descripcion || 'Sin descripción' }}</td>
                  <td>
                    <span class="status-badge active">
                      Activa
                    </span>
                  </td>
                  <td>
                    <button 
                      @click="viewCategoria(categoria)"
                      class="btn btn-secondary btn-sm"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div v-if="pagination" class="pagination-container">
            <div class="pagination-info">
              Mostrando {{ categorias.length }} de {{ pagination.totalItems }} categorías
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '@/services/api'
import type { Categoria, PagedRequest, PaginationMetadata } from '@/types'

const router = useRouter()

// Estado
const categorias = ref<Categoria[]>([])
const pagination = ref<PaginationMetadata | null>(null)
const loading = ref(false)
const error = ref('')

// Filtros
const searchTerm = ref('')
const sortBy = ref('nombre')
const sortDescending = ref(false)

// Paginación
const currentPage = ref(1)
const pageSize = ref(10)

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadCategorias()
  }, 500)
}

// Cargar categorías
const loadCategorias = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const request: PagedRequest = {
      page: currentPage.value,
      pageSize: pageSize.value,
      searchTerm: searchTerm.value || undefined,
      sortBy: sortBy.value,
      sortDescending: sortDescending.value
    }
    
    const response = await apiService.getCategorias(request)
    categorias.value = response.data
    pagination.value = response.pagination
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar categorías'
  } finally {
    loading.value = false
  }
}

// Navegación de páginas
const goToPage = (page: number) => {
  if (page >= 1 && page <= (pagination.value?.totalPages || 1)) {
    currentPage.value = page
    loadCategorias()
  }
}

// Cambiar orden de clasificación
const toggleSortOrder = () => {
  sortDescending.value = !sortDescending.value
  loadCategorias()
}

// Ver detalles de categoría
const viewCategoria = (categoria: Categoria) => {
  // Aquí podrías navegar a una vista de detalles o mostrar un modal
  console.log('Ver categoría:', categoria)
}

// Watchers
watch([currentPage, pageSize], () => {
  loadCategorias()
})

// Cargar datos iniciales
onMounted(() => {
  loadCategorias()
})
</script>

<style scoped>
.categorias-page {
  padding: 2rem 0;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.filters-card {
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.sort-group {
  min-width: 150px;
}

.sort-order .btn.active {
  background-color: #667eea;
  color: white;
}

.table-responsive {
  overflow-x: auto;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-info {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  font-size: 0.9rem;
  color: #495057;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-container {
    flex-direction: column;
    text-align: center;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>

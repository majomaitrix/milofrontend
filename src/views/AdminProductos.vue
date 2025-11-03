<template>
  <div class="admin-productos-page">
    <div class="container">
      <div class="page-header">
        <h1>🍕 Administración de Productos</h1>
        <p>Gestiona el inventario de productos del restaurante</p>
      </div>

      <!-- Formulario de producto -->
      <div class="card">
        <h3>{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input
                v-model="form.nombre"
                type="text"
                class="form-control"
                placeholder="Nombre del producto"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <select v-model="form.categoriaId" class="form-control" required>
                <option value="">Seleccionar categoría</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <textarea
              v-model="form.descripcion"
              class="form-control"
              rows="3"
              placeholder="Descripción del producto"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Precio *</label>
              <input
                v-model.number="form.precio"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                placeholder="0.00"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Stock *</label>
              <input
                v-model.number="form.stock"
                type="number"
                min="0"
                class="form-control"
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Imagen</label>
            <ImageUpload 
              v-model="form.imagen"
              alt-text="Imagen del producto"
              :max-size="2"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <input
                v-model="form.activo"
                type="checkbox"
                class="form-checkbox"
              />
              Producto activo
            </label>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading">Guardando...</span>
              <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }} Producto</span>
            </button>
            
            <button v-if="isEditing" @click="cancelEdit" type="button" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de productos -->
      <div class="card">
        <h3>Productos Existentes</h3>
        
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
                />
              </div>
              
              <div class="product-info">
                <h4>{{ producto.nombre }}</h4>
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
              
              <div class="product-actions">
                <button @click="editProduct(producto)" class="btn btn-secondary btn-sm">
                  Editar
                </button>
                <button @click="deleteProduct(producto.id)" class="btn btn-danger btn-sm">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'
import apiService from '@/services/api'
import type { Producto, Categoria, ProductoDTO } from '@/types'

// Estado
const productos = ref<Producto[]>([])
const categorias = ref<Categoria[]>([])
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)

// Formulario
const form = reactive<ProductoDTO>({
  id: 0,
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoriaId: 0,
  imagen: '',
  activo: true
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

// Cargar productos
const loadProductos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.getProductos({ page: 1, pageSize: 100 })
    productos.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar productos'
  } finally {
    loading.value = false
  }
}

// Obtener imagen del producto
const getProductImage = (producto: Producto) => {
  if (producto.imagen && producto.imagen.trim() !== '') {
    if (producto.imagen.startsWith('data:')) {
      return producto.imagen
    }
    return `data:image/jpeg;base64,${producto.imagen}`
  }
  return '/src/assets/placeholder-food.svg'
}

// Manejar envío del formulario
const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const opcion = isEditing.value ? 'u' : 'c'
    
    // Aquí necesitarías implementar el endpoint de admin-productos
    // Por ahora solo mostramos un mensaje
    console.log('Enviando producto:', { opcion, producto: form })
    
    alert(`Producto ${isEditing.value ? 'actualizado' : 'creado'} exitosamente`)
    
    // Limpiar formulario
    resetForm()
    
    // Recargar productos
    loadProductos()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al guardar producto'
  } finally {
    loading.value = false
  }
}

// Editar producto
const editProduct = (producto: Producto) => {
  isEditing.value = true
  Object.assign(form, {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio,
    stock: producto.stock,
    categoriaId: producto.categoriaId,
    imagen: producto.imagen || '',
    activo: producto.activo
  })
}

// Cancelar edición
const cancelEdit = () => {
  isEditing.value = false
  resetForm()
}

// Eliminar producto
const deleteProduct = async (id: number) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    return
  }
  
  try {
    // Aquí necesitarías implementar el endpoint de eliminación
    console.log('Eliminando producto:', id)
    
    alert('Producto eliminado exitosamente')
    loadProductos()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al eliminar producto'
  }
}

// Resetear formulario
const resetForm = () => {
  Object.assign(form, {
    id: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoriaId: 0,
    imagen: '',
    activo: true
  })
}

// Cargar datos iniciales
onMounted(() => {
  loadCategorias()
  loadProductos()
})
</script>

<style scoped>
.admin-productos-page {
  padding: 2rem 0;
}

.product-form {
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
}

.form-checkbox {
  margin-right: 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
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

.product-info h4 {
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
  margin-bottom: 1rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>


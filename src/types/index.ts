// Tipos para la API
export interface ApiResponse<T> {
  code: number
  message: string
  message_error?: string
  data?: T
}

export interface PagedResponse<T> {
  data: T[]
  pagination: PaginationMetadata
}

export interface PaginationMetadata {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PagedRequest {
  page: number
  pageSize: number
  searchTerm?: string
  sortBy?: string
  sortDescending?: boolean
}

// Tipos de entidades
export interface Usuario {
  id: number
  nombre: string
  email: string
  rolId: number
  rol?: Rol
}

export interface Rol {
  id: number
  nombre: string
}

export interface Categoria {
  id: number
  nombre: string
  descripcion?: string
  activa?: boolean
}

export interface Producto {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  categoriaId: number
  categoria?: Categoria
  activo: boolean
  imagen?: string // Base64 de la imagen
}

export interface Pedido {
  id: number
  usuarioId: number
  usuarioNombre: string
  usuarioEmail: string
  fecha: string
  total: number
  estado: number
  estadoNombre: string
  observaciones?: string
  detalles?: PedidoDetalle[]
}

export interface PedidoDetalle {
  id: number
  pedidoId: number
  productoId: number
  producto?: Producto
  cantidad: number
  precio: number
  subtotal: number
}

export enum EstadoPedido {
  Pendiente = 1,
  Preparando = 2,
  Listo = 3,
  Entregado = 4,
  Cancelado = 5
}

// Tipos para autenticación
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  id: number
  nombre: string
  email: string
  rol: Role
  direccion?: string
  telefono?: string
  token: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

// Tipos para creación de usuarios
export interface CreateUserRequest {
  nombre: string
  email: string
  contraseña: string
  rol: number
  direccion?: string
  telefono?: string
}

export interface CreateUserResponse {
  code: number
  message: string
  type: string
}

export interface Role {
  id: number
  nombre: string
}

// Tipos para filtros
export interface ProductoFilters {
  categoriaId?: number
  precioMin?: number
  precioMax?: number
  stockMin?: number
  activo?: boolean
}

export interface PedidoFilters {
  estado?: number
  fechaInicio?: string
  fechaFin?: string
  usuarioId?: number
  totalMin?: number
  totalMax?: number
}

// Tipos DTO para operaciones CRUD
export interface ProductoDTO {
  id?: number
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  categoriaId: number
  imagen?: string // Base64 de la imagen
  activo: boolean
}

export interface CategoriaDTO {
  id?: number
  nombre: string
  descripcion?: string
  activa?: boolean
}

export interface PedidoDTO {
  id?: number
  usuarioId: number
  fecha: string
  total: number
  estado: number
  observaciones?: string
  detalles?: PedidoDetalleDTO[]
}

export interface PedidoDetalleDTO {
  id?: number
  productoId: number
  cantidad: number
  precio: number
}

export interface RolDTO {
  id?: number
  nombre: string
}

// Tipos para Health Checks
export interface HealthCheck {
  name: string
  status: 'Healthy' | 'Unhealthy'
  description: string
  duration: string
}

export interface HealthStatus {
  status: 'Healthy' | 'Unhealthy' | 'Ready' | 'Not Ready' | 'Alive'
  timestamp: string
  checks?: HealthCheck[]
}

// Tipos para cambio de estado de pedido
export interface CambiarEstadoPedidoRequest {
  pedidoId: number
  nuevoEstado: number
  observaciones?: string
}

// Tipo para operaciones CRUD (opción)
export type OperacionCRUD = 'crear' | 'editar' | 'eliminar'

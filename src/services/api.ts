import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  Usuario,
  PagedRequest,
  PagedResponse,
  Categoria,
  Producto,
  Pedido,
  EstadoPedido,
  ProductoFilters,
  PedidoFilters,
  CreateUserRequest,
  CreateUserResponse,
  Role,
  ProductoDTO,
  CategoriaDTO,
  PedidoDTO,
  RolDTO,
  OperacionCRUD,
  CambiarEstadoPedidoRequest,
  HealthStatus
} from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    // En desarrollo usa localhost, en producción usa la variable de entorno o la URL de Render como fallback
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 
                       (import.meta.env.DEV ? 'http://localhost:7039' : 'https://miloapi.onrender.com')
    
    this.api = axios.create({
      baseURL: apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Interceptor para agregar token automáticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptor de respuesta (sin refresh automático por ahora)
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Sin refresh automático: limpiar sesión y enviar a login
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Enviando credenciales de login:', credentials)
    const response: AxiosResponse<{ 
      accessToken: string; 
      refreshToken?: string; 
      expiresAt?: string; 
      user: { id: number; name: string; email: string; role: string; address?: string; phone?: string }
    }> = await this.api.post('/api/Auth/login', credentials)

    const data = response.data
    // Guardar tokens
    localStorage.setItem('token', data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken)
    }

    // Mapear al tipo LoginResponse existente del frontend
    const mapped: LoginResponse = {
      id: data.user.id,
      nombre: data.user.name,
      email: data.user.email,
      direccion: data.user.address,
      telefono: data.user.phone,
      rol: { id: 0, nombre: data.user.role },
      token: data.accessToken
    }
    return mapped
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Según documentación actual, este endpoint devuelve 400 (en desarrollo)
    // Lo dejamos implementado por si se habilita más adelante
    const response: AxiosResponse<{ token?: string; refreshToken?: string }> = await this.api.post('/api/Auth/refresh', { refreshToken })
    return {
      token: response.data.token || '',
      refreshToken: response.data.refreshToken || refreshToken
    }
  }

  async logout(): Promise<void> {
    const rt = localStorage.getItem('refreshToken')
    try {
      await this.api.post('/api/Auth/logout', { refreshToken: rt })
    } catch (e) {
      // Ignorar errores de logout y continuar limpiando sesión
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  async getCurrentUser(): Promise<Usuario> {
    const response: AxiosResponse<{ id: number; name: string; email: string; role: string; address?: string; phone?: string }> = await this.api.get('/api/Auth/me')
    const u = response.data
    const mapped: Usuario = {
      id: u.id,
      nombre: u.name,
      email: u.email,
      rolId: 0,
      rol: { id: 0, nombre: u.role }
    }
    return mapped
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/api/Auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  }

  // Categorías
  async getCategorias(request: PagedRequest): Promise<PagedResponse<Categoria>> {
    console.log('Enviando request a categorías:', request)
    const response: AxiosResponse<PagedResponse<Categoria>> = await this.api.get('/api/Parameter/get-categorias', {
      params: request
    })
    console.log('Respuesta de categorías:', response.data)
    return response.data
  }

  async getCategoriaById(id: number): Promise<Categoria> {
    const response: AxiosResponse<ApiResponse<Categoria>> = await this.api.get(`/api/Parameter/get-categorias/${id}`)
    return response.data.data!
  }

  // Productos
  async getProductos(request: PagedRequest): Promise<PagedResponse<Producto>> {
    console.log('Enviando request a productos:', request)
    const response: AxiosResponse<PagedResponse<Producto>> = await this.api.get('/api/Parameter/get-productos', {
      params: request
    })
    console.log('Respuesta de productos:', response.data)
    return response.data
  }

  async getProductosConFiltros(request: PagedRequest & ProductoFilters): Promise<PagedResponse<Producto>> {
    // Mapear los nombres de parámetros según la documentación de la API
    const params: any = {
      page: request.page,
      pageSize: request.pageSize,
      ...(request.searchTerm && { searchTerm: request.searchTerm }),
      ...(request.sortBy && { sortBy: request.sortBy }),
      ...(request.sortDescending !== undefined && { sortDescending: request.sortDescending }),
      ...(request.precioMin !== undefined && { precioMinimo: request.precioMin }),
      ...(request.precioMax !== undefined && { precioMaximo: request.precioMax }),
      ...(request.stockMin !== undefined && { stockMinimo: request.stockMin }),
      ...(request.categoriaId !== undefined && { categoriaId: request.categoriaId }),
      ...(request.activo !== undefined && { soloDisponibles: request.activo })
    }
    
    const response: AxiosResponse<PagedResponse<Producto>> = await this.api.get('/api/Parameter/get-productos-filtros', {
      params
    })
    return response.data
  }

  async getProductoById(id: number): Promise<Producto> {
    const response: AxiosResponse<ApiResponse<Producto>> = await this.api.get(`/api/Parameter/get-productos/${id}`)
    return response.data.data!
  }

  // Pedidos
  async getPedidos(request: PagedRequest & PedidoFilters): Promise<PagedResponse<Pedido>> {
    console.log('Enviando request a pedidos:', request)
    // Mapear los nombres de parámetros según la documentación de la API
    const params: any = {
      page: request.page,
      pageSize: request.pageSize,
      ...(request.searchTerm && { searchTerm: request.searchTerm }),
      ...(request.sortBy && { sortBy: request.sortBy }),
      ...(request.sortDescending !== undefined && { sortDescending: request.sortDescending }),
      ...(request.estado !== undefined && { estadoFiltro: request.estado }),
      ...(request.fechaInicio && { fechaDesde: request.fechaInicio }),
      ...(request.fechaFin && { fechaHasta: request.fechaFin }),
      ...(request.usuarioId !== undefined && { usuarioId: request.usuarioId }),
      ...(request.totalMin !== undefined && { totalMinimo: request.totalMin }),
      ...(request.totalMax !== undefined && { totalMaximo: request.totalMax })
    }
    
    const response: AxiosResponse<PagedResponse<Pedido>> = await this.api.get('/api/Parameter/get-pedidos', {
      params
    })
    console.log('Respuesta de pedidos:', response.data)
    return response.data
  }

  async getPedidoById(id: number): Promise<Pedido> {
    const response: AxiosResponse<ApiResponse<Pedido>> = await this.api.get(`/api/Parameter/get-pedidos/${id}`)
    return response.data.data!
  }

  async cambiarEstadoPedido(id: number, nuevoEstado: number, observaciones?: string): Promise<void> {
    const request: CambiarEstadoPedidoRequest = {
      pedidoId: id,
      nuevoEstado,
      observaciones
    }
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/api/Parameter/cambiar-estado-pedido', request)
    return response.data.data!
  }

  async getEstadosPedido(): Promise<Array<{ value: number; label: string }>> {
    console.log('Obteniendo estados de pedido...')
    const response: AxiosResponse<{ code: number; message: string; message_error?: string; list: Array<{ id: number; nombre: string; descripcion: string }> }> = await this.api.get('/api/Parameter/get-estados-pedido')
    console.log('Respuesta de estados:', response.data)
    
    // Convertir la respuesta del backend al formato esperado por el frontend
    return response.data.list.map(estado => ({
      value: estado.id,
      label: estado.descripcion || estado.nombre
    }))
  }

  // Usuarios
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    console.log('Enviando datos de usuario:', userData)
    const response: AxiosResponse<CreateUserResponse> = await this.api.post('/api/Usuarios/crear-usuario', userData)
    console.log('Respuesta de crear usuario:', response.data)
    return response.data
  }

  async getRoles(): Promise<Role[]> {
    console.log('Obteniendo roles...')
    const response: AxiosResponse<{ apiResponse: ApiResponse<Role[]>; list: Role[] }> = await this.api.get('/api/Usuarios/get-roles')
    console.log('Respuesta de roles:', response.data)
    return response.data.list
  }

  // Administración de Categorías (CRUD)
  async adminCategorias(categoria: CategoriaDTO, operacion: OperacionCRUD): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(
      `/api/Parameter/admin-categorias?opcion=${operacion}`, 
      categoria
    )
    return response.data
  }

  // Administración de Productos (CRUD)
  async adminProductos(producto: ProductoDTO, operacion: OperacionCRUD): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(
      `/api/Parameter/admin-productos?opcion=${operacion}`, 
      producto
    )
    return response.data
  }

  // Administración de Pedidos (CRUD)
  async adminPedidos(pedido: PedidoDTO, operacion: OperacionCRUD): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(
      `/api/Parameter/admin-pedidos?opcion=${operacion}`, 
      pedido
    )
    return response.data
  }

  // Administración de Roles (CRUD)
  async adminRoles(rol: RolDTO, operacion: OperacionCRUD): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post(
      `/api/Usuarios/admin-roles?opcion=${operacion}`, 
      rol
    )
    return response.data
  }

  // Health Checks
  async getHealthStatus(): Promise<HealthStatus> {
    const response: AxiosResponse<HealthStatus> = await this.api.get('/api/Health')
    return response.data
  }

  async getHealthReady(): Promise<HealthStatus> {
    const response: AxiosResponse<HealthStatus> = await this.api.get('/api/Health/ready')
    return response.data
  }

  async getHealthLive(): Promise<HealthStatus> {
    const response: AxiosResponse<HealthStatus> = await this.api.get('/api/Health/live')
    return response.data
  }
}

const apiService = new ApiService()
export { apiService }
export default apiService

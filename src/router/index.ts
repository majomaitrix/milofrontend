import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Categorias from '@/views/Categorias.vue'
import Productos from '@/views/Productos.vue'
import Pedidos from '@/views/Pedidos.vue'
import Dashboard from '@/views/Dashboard.vue'
import AdminProductos from '@/views/AdminProductos.vue'
import CreateUser from '@/views/CreateUser.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: Categorias
  },
  {
    path: '/productos',
    name: 'Productos',
    component: Productos
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: Pedidos
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-productos',
    name: 'AdminProductos',
    component: AdminProductos,
    meta: { requiresAuth: true, roles: ['Admin'] }
  },
  {
    path: '/create-user',
    name: 'CreateUser',
    component: CreateUser
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // Validación de roles si la ruta lo requiere
  const routeRoles = (to.meta as any)?.roles as string[] | undefined
  if (routeRoles && routeRoles.length > 0) {
    const authStore = useAuthStore()

    // Obtener el rol actual del usuario desde el store
    const currentRoleRaw = (authStore.userRole || '').toLowerCase()

    // Normalizar nombres comunes (Admin/Administrador)
    const normalize = (role: string) => {
      const r = role.toLowerCase()
      if (r === 'administrador') return 'admin'
      return r
    }

    const currentRole = normalize(currentRoleRaw)
    const allowed = routeRoles.map(normalize)

    if (!currentRole || !allowed.includes(currentRole)) {
      // Sin permiso: redirigir al home o a una página de no autorizado
      return next('/')
    }
  }

  next()
})

export default router

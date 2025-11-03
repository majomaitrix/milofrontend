# Milo Restaurant – Frontend (Vue 3 + TypeScript)

Aplicación frontend para la gestión de un restaurante. Incluye autenticación por roles, administración de productos, listado y gestión de pedidos con cambio de estado, notificaciones, paginación y filtros avanzados.

## 🚀 Stack
- Framework: Vue 3 (Composition API)
- Lenguaje: TypeScript
- Router: Vue Router 4
- Estado: Pinia
- HTTP: Axios
- Build: Vite
- Estilos: CSS

## ✨ Funcionalidades
- Autenticación con JWT (login/logout) y guard de rutas con validación de roles.
- Gestión de usuarios (crear cuenta) y roles.
- Productos: listado con paginación y filtros avanzados (categoría, precio, stock, estado), CRUD de productos (Admin).
- Categorías: listado con paginación y orden.
- Pedidos: listado con filtros y cambio de estado (Admin/Mesero) validando transiciones.
- Notificaciones tipo toast.
- Dashboard con métricas básicas.

## 📦 Estructura principal
- `src/views/*`: Vistas (Home, Login, Categorias, Productos, Pedidos, AdminProductos, CreateUser, Dashboard)
- `src/services/api.ts`: Cliente HTTP (Axios) y métodos para consumir la API
- `src/stores/auth.ts`: Store de autenticación (Pinia)
- `src/router/index.ts`: Rutas y guard con validación de roles
- `src/components/*`: Componentes (Notification, NotificationContainer, ImageUpload)
- `src/types/index.ts`: Tipos y DTOs compartidos

## 🔌 API esperada (resumen)
Base URL (dev): `http://localhost:7039/api`

Autenticación (`/api/Auth/*`):
- `POST /api/Auth/login`: inicia sesión y retorna `accessToken`, `refreshToken?`, `user`
- `POST /api/Auth/logout`: revoca sesión (usa `refreshToken`)
- `GET /api/Auth/me`: retorna usuario actual
- `POST /api/Auth/refresh`: (en desarrollo)
- `POST /api/Auth/change-password`: (en desarrollo)

Parámetros – Categorías/Productos/Pedidos (`/api/Parameter/*`):
- `GET /api/Parameter/get-categorias`
- `POST /api/Parameter/admin-categorias` (CRUD)
- `GET /api/Parameter/get-productos`
- `GET /api/Parameter/get-productos-filtros` (filtros avanzados)
- `POST /api/Parameter/admin-productos` (CRUD)
- `GET /api/Parameter/get-pedidos`
- `POST /api/Parameter/admin-pedidos` (CRUD)
- `GET /api/Parameter/get-estados-pedido`
- `POST /api/Parameter/cambiar-estado-pedido`

Usuarios (`/api/Usuarios/*`):
- `POST /api/Usuarios/crear-usuario`
- `GET /api/Usuarios/get-roles`
- `POST /api/Usuarios/admin-roles` (CRUD)

Health (`/api/Health*`):
- `GET /api/Health`, `GET /api/Health/ready`, `GET /api/Health/live`

## ⚙️ Configuración y ejecución

1) Requisitos
- Node.js 18+

2) Instalar dependencias
```bash
npm install
```

3) Variables de entorno (opcional)
Crea un `.env` (o `.env.local`) si necesitas sobreescribir la URL base:
```bash
VITE_API_BASE_URL=http://localhost:7039
```
Nota: En desarrollo, el proyecto usa el proxy configurado en `vite.config.ts` para `'/api'` → `http://localhost:7039`.

4) Ejecutar en desarrollo
```bash
npm run dev
```

5) Build de producción
```bash
npm run build
```

6) Preview local del build
```bash
npm run preview
```

## 🔐 Autenticación y Roles
- El login usa `POST /api/Auth/login` y guarda `accessToken` (+ `refreshToken?`).
- Guard de rutas:
  - `meta.requiresAuth`: requiere token.
  - `meta.roles`: valida el rol del usuario (p. ej. `['Admin']`).
- Si el backend responde `401`, se limpia la sesión y se redirige a `/login`.

## 🧪 Puntos a revisar al integrar backend
- Endpoints `/api/Auth/refresh` y `/api/Auth/change-password` están marcados “en desarrollo”. El cliente no intenta refresh automático.
- Si cambian los nombres de roles ("Administrador"/"Admin"), el router normaliza para evitar conflictos.

## 🖼️ Screenshots (sugeridos)
- Login
- Productos (filtros)
- Pedidos (cambio de estado)
- Admin de Productos (CRUD)
- Dashboard

Colócalos en `docs/screenshots/` y referencia aquí.

## 🛠️ Scripts útiles
```bash
npm run dev       # entorno de desarrollo
npm run build     # build de producción
npm run preview   # previsualización del build
npm run lint      # lint + fix
npm run format    # formateo con Prettier
```

## ✅ Estado del proyecto
- Integrado con endpoints `/api/Auth/*` y `/api/Parameter/*` documentados.
- Filtros avanzados de productos conectados al backend.
- Guard de rutas con validación de roles funcionando.
- CRUD de productos operativo.
- Cambio de estado de pedidos validado por roles y transiciones.

## 📄 Licencia
MIT


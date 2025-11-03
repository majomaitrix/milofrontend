# 🚀 Guía de Despliegue - Milo Frontend

Esta guía te ayudará a desplegar el frontend de Milo en diferentes plataformas.

## 📋 Requisitos Previos

1. **Cuenta de GitHub/GitLab/Bitbucket** (para el repositorio)
2. **URL de tu API en Render** (ejemplo: `https://milo-api.onrender.com`)
3. **Node.js 18+** instalado localmente (para builds locales si es necesario)

---

## 🌐 Opción 1: Vercel (Recomendado)

### Ventajas
- ✅ Gratis con generoso plan gratuito
- ✅ Despliegue automático desde Git
- ✅ CDN global muy rápido
- ✅ SSL automático
- ✅ Configuración muy sencilla
- ✅ Preview de Pull Requests automático

### Pasos para desplegar en Vercel

1. **Preparar el repositorio**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/milo-frontend.git
   git push -u origin main
   ```

2. **Crear archivo de configuración de Vercel** (opcional pero recomendado)
   - Crea `vercel.json` en la raíz del proyecto:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **Ir a Vercel**
   - Visita [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub/GitLab

4. **Importar proyecto**
   - Haz clic en "Add New Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

5. **Configurar variables de entorno**
   - En la sección "Environment Variables", agrega:
     - **Name**: `VITE_API_BASE_URL`
     - **Value**: `https://tu-api-en-render.onrender.com` (reemplaza con tu URL real)

6. **Desplegar**
   - Haz clic en "Deploy"
   - Espera unos minutos
   - ¡Listo! Tu app estará en `https://tu-proyecto.vercel.app`

### Configuración de dominio personalizado (opcional)
- Ve a Project Settings → Domains
- Agrega tu dominio personalizado

---

## 🌐 Opción 2: Netlify

### Ventajas
- ✅ Gratis con buen plan gratuito
- ✅ Despliegue automático desde Git
- ✅ CDN rápido
- ✅ SSL automático
- ✅ Funciones serverless incluidas

### Pasos para desplegar en Netlify

1. **Subir código a Git** (igual que en Vercel)

2. **Crear archivo de configuración de Netlify**
   - Crea `netlify.toml` en la raíz:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Ir a Netlify**
   - Visita [netlify.com](https://netlify.com)
   - Inicia sesión con tu cuenta de GitHub

4. **Importar proyecto**
   - Haz clic en "Add new site" → "Import an existing project"
   - Conecta tu repositorio
   - Netlify detectará el archivo `netlify.toml`

5. **Configurar variables de entorno**
   - Ve a Site settings → Build & deploy → Environment
   - Agrega:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://tu-api-en-render.onrender.com`

6. **Desplegar**
   - Haz clic en "Deploy site"
   - Tu app estará en `https://tu-proyecto.netlify.app`

---

## 🌐 Opción 3: Render (Static Site)

### Ventajas
- ✅ Mantienes todo en Render (API + Frontend)
- ✅ Gratis con plan estático
- ✅ Despliegue automático

### Pasos para desplegar en Render

1. **Subir código a Git**

2. **Ir a Render**
   - Visita [render.com](https://render.com)
   - Inicia sesión

3. **Crear nuevo Static Site**
   - Haz clic en "New +" → "Static Site"
   - Conecta tu repositorio

4. **Configurar build**
   - **Name**: `milo-frontend` (o el que prefieras)
   - **Branch**: `main` (o tu rama principal)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

5. **Configurar variables de entorno**
   - En "Environment Variables", agrega:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://tu-api-en-render.onrender.com`

6. **Desplegar**
   - Haz clic en "Create Static Site"
   - Tu app estará en `https://milo-frontend.onrender.com`

---

## 🌐 Opción 4: Cloudflare Pages

### Ventajas
- ✅ Gratis ilimitado (ancho de banda)
- ✅ Muy rápido (CDN global)
- ✅ SSL automático

### Pasos para desplegar en Cloudflare Pages

1. **Subir código a Git**

2. **Ir a Cloudflare Pages**
   - Visita [dash.cloudflare.com](https://dash.cloudflare.com)
   - Ve a "Pages" en el menú lateral
   - Conecta tu repositorio

3. **Configurar build**
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

4. **Configurar variables de entorno**
   - En "Environment variables", agrega:
     - **Variable name**: `VITE_API_BASE_URL`
     - **Value**: `https://tu-api-en-render.onrender.com`

5. **Desplegar**
   - Haz clic en "Save and Deploy"
   - Tu app estará en `https://tu-proyecto.pages.dev`

---

## 🔧 Configuración Post-Despliegue

### 1. Verificar que la API esté accesible

Asegúrate de que tu API en Render:
- ✅ Esté desplegada y funcionando
- ✅ Tenga CORS configurado para permitir tu dominio frontend
- ✅ Tenga la URL correcta (sin `/api` al final si tu API ya incluye `/api` en las rutas)

### 2. Configurar CORS en tu API (si es necesario)

Si tu API está en Render, asegúrate de que permita requests desde tu dominio frontend:

```csharp
// En tu API .NET (Startup.cs o Program.cs)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://tu-frontend.vercel.app",
            "https://tu-frontend.netlify.app",
            "https://tu-frontend.onrender.com"
            // Agrega todos los dominios donde esté tu frontend
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### 3. Probar la conexión

1. Abre tu frontend desplegado
2. Intenta hacer login
3. Verifica en la consola del navegador (F12) que no haya errores de CORS

---

## 📝 Variables de Entorno por Entorno

### Desarrollo Local
```bash
VITE_API_BASE_URL=http://localhost:7039
```

### Producción (Vercel/Netlify/Render/Cloudflare)
```bash
VITE_API_BASE_URL=https://tu-api-en-render.onrender.com
```

**Nota**: Asegúrate de que la URL de la API **NO** termine con `/api` si tu API ya incluye `/api` en todas las rutas.

---

## 🐛 Solución de Problemas Comunes

### Error: CORS policy blocked
**Solución**: Configura CORS en tu API para permitir tu dominio frontend (ver arriba).

### Error: 404 en rutas
**Solución**: Configura redirects/rewrites para que todas las rutas vayan a `index.html` (ya incluido en las configuraciones arriba).

### Error: API no responde
**Solución**: 
- Verifica que la URL de la API sea correcta
- Verifica que la API esté desplegada y funcionando
- Revisa los logs en Render

### Variables de entorno no funcionan
**Solución**: 
- Asegúrate de que las variables empiecen con `VITE_`
- Reinicia el build después de agregar variables
- Verifica que el valor no tenga espacios extras

---

## ✅ Checklist Final

- [ ] Código subido a Git
- [ ] Variables de entorno configuradas
- [ ] CORS configurado en la API
- [ ] Frontend desplegado y accesible
- [ ] Login funcionando
- [ ] Rutas protegidas funcionando
- [ ] Sin errores en consola del navegador

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando correctamente. Si tienes problemas, revisa los logs de despliegue en la plataforma que elegiste.


# 🚂 Pasos para Desplegar en Railway - Guía Rápida

## ✅ Checklist Pre-Despliegue

Antes de desplegar, asegúrate de que:

- [ ] Tu código está en un repositorio de GitHub
- [ ] Has hecho commit de todos los cambios
- [ ] Tienes una cuenta en Railway.app
- [ ] Has leído `RAILWAY_DEPLOYMENT.md` para detalles completos

## 🚀 Pasos de Despliegue (5 minutos)

### Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión con GitHub
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Busca y selecciona tu repositorio: `pruebaTecnicaOctubre`
5. Railway detectará automáticamente tu configuración

### Paso 2: Agregar PostgreSQL

1. En tu proyecto, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará la base de datos automáticamente
4. Espera a que se complete (icono verde de check)

### Paso 3: Conectar Database con tu Servicio

1. En tu servicio backend (donde está tu código), ve a **"Variables"**
2. Click en **"+ New Variable"** → **"Add Reference"**
3. Selecciona `Postgres` → `DATABASE_URL`
4. Guarda los cambios

### Paso 4: Configurar Variables de Entorno

En la sección **"Variables"** de tu servicio backend, agrega:

#### 🔐 Generar JWT Secrets

**Abre PowerShell y ejecuta:**
```powershell
# Para JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Para JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

#### ➕ Agregar estas variables en Railway:

```
Variable Name: JWT_SECRET
Value: [pega el primer string generado]

Variable Name: JWT_REFRESH_SECRET  
Value: [pega el segundo string generado]

Variable Name: JWT_ACCESS_EXPIRATION
Value: 15m

Variable Name: JWT_REFRESH_EXPIRATION
Value: 7d

Variable Name: CORS_ORIGIN
Value: https://tu-frontend.vercel.app
(O déjalo en blanco por ahora si no tienes frontend)
```

### Paso 5: Verificar Variables

Deberías tener estas variables configuradas:

- ✅ `DATABASE_URL` → `${{Postgres.DATABASE_URL}}` (referencia)
- ✅ `JWT_SECRET` → tu secret generado
- ✅ `JWT_REFRESH_SECRET` → tu secret generado  
- ✅ `JWT_ACCESS_EXPIRATION` → `15m`
- ✅ `JWT_REFRESH_EXPIRATION` → `7d`
- ✅ `CORS_ORIGIN` → URL de tu frontend (opcional por ahora)
- ⚠️ `PORT` → No lo configures, Railway lo hace automáticamente

### Paso 6: Desplegar

1. Railway automáticamente empezará a desplegar
2. Puedes ver el progreso en **"Deployments"**
3. Espera a que aparezca el estado **"Success"** (2-3 minutos)

### Paso 7: Obtener tu URL

1. En tu servicio, ve a **"Settings"**
2. Busca la sección **"Domains"**
3. Click en **"Generate Domain"**
4. Railway te dará una URL como: `https://tu-proyecto.up.railway.app`

### Paso 8: Verificar que Funciona

Abre estas URLs en tu navegador:

```
✅ Swagger API Docs:
https://tu-proyecto.up.railway.app/api/docs

✅ API Base:
https://tu-proyecto.up.railway.app
```

## 🎉 ¡Listo!

Tu API está desplegada. Ahora puedes:

1. **Ver los logs**: Click en "Deployments" → selecciona el deployment → ve los logs en tiempo real
2. **Probar la API**: Usa Swagger en `/api/docs`
3. **Monitorear**: Railway te muestra métricas de CPU, memoria y requests

## 🔄 Próximas Veces

Cada vez que hagas `git push` a tu rama `main`, Railway:
1. Detectará el cambio automáticamente
2. Construirá y desplegará la nueva versión
3. Ejecutará las migraciones de Prisma
4. Reiniciará el servicio

## ❗ Problemas Comunes

### "Build Failed"
- Revisa los logs en Railway
- Verifica que todas las variables estén configuradas
- Asegúrate de que `DATABASE_URL` esté conectado

### "Application Error"  
- Ve a "Deployments" → "View Logs"
- Busca errores en rojo
- Verifica que las migraciones de Prisma se ejecutaron

### "CORS Error" en el Frontend
- Agrega la URL de tu frontend a `CORS_ORIGIN`
- Formato: `https://dominio.com` (sin slash final)
- Múltiples URLs separadas por comas

## 📞 Ayuda

Si tienes problemas, revisa:
1. Los logs en Railway (Deployments → View Logs)
2. El archivo `RAILWAY_DEPLOYMENT.md` (guía completa)
3. La documentación de Railway: https://docs.railway.app

---

**Tiempo estimado total: 5-10 minutos** ⏱️

# 🚂 Guía de Despliegue en Railway

Esta guía te ayudará a desplegar tu aplicación NestJS con PostgreSQL en Railway paso a paso.

## 📋 Requisitos Previos

- Cuenta en [Railway](https://railway.app/)
- Cuenta en GitHub con tu repositorio
- Git instalado en tu máquina

---

## 🚀 Paso 1: Preparar el Proyecto

### 1.1 Verificar archivos de configuración

Tu proyecto ya incluye los siguientes archivos necesarios para Railway:

✅ `railway.json` - Configuración de build y deploy
✅ `nixpacks.toml` - Configuración de Nixpacks
✅ `Procfile` - Comando de inicio
✅ `src/main.ts` - Configurado para escuchar en `0.0.0.0`
✅ `package.json` - Con scripts de build y start

### 1.2 Verificar `.gitignore`

Asegúrate de que tu `.gitignore` NO incluya estos archivos:
- ✅ `railway.json`
- ✅ `nixpacks.toml`
- ✅ `Procfile`
- ❌ `.env` (NO debe estar en Git)

### 1.3 Commit y Push a GitHub

```bash
# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: add Railway deployment configuration"

# Push al repositorio
git push origin main
```

---

## 🎯 Paso 2: Crear Proyecto en Railway

### 2.1 Iniciar sesión en Railway

1. Ve a [railway.app](https://railway.app/)
2. Haz clic en **"Login"** o **"Start a New Project"**
3. Inicia sesión con GitHub

### 2.2 Crear nuevo proyecto

1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio: `I-AM-TIAN/pruebaTecnicaOctubre`
4. Railway detectará automáticamente que es un proyecto Node.js

---

## 🗄️ Paso 3: Agregar Base de Datos PostgreSQL

### 3.1 Agregar servicio de PostgreSQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"**
3. Selecciona **"Add PostgreSQL"**
4. Railway creará automáticamente una instancia de PostgreSQL

### 3.2 Copiar la variable DATABASE_URL

1. Haz clic en el servicio de **PostgreSQL**
2. Ve a la pestaña **"Variables"**
3. Copia el valor de `DATABASE_URL` (o usa la referencia `${{Postgres.DATABASE_URL}}`)

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Ir al servicio de tu aplicación

1. Haz clic en tu servicio de aplicación (backend)
2. Ve a la pestaña **"Variables"**

### 4.2 Agregar variables requeridas

Agrega las siguientes variables una por una haciendo clic en **"+ New Variable"**:

#### **Variables de Base de Datos:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

#### **Variables de JWT:**
```bash
JWT_SECRET=tu-secreto-super-seguro-cambialo-en-produccion-12345
JWT_REFRESH_SECRET=tu-refresh-secreto-super-seguro-cambialo-en-produccion-67890
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

#### **Variables de Servidor:**
```bash
PORT=4001
NODE_ENV=production
```

#### **Variables de PostgreSQL (Opcional, ya incluidas en DATABASE_URL):**
```bash
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
```

#### **Variables de CORS (Opcional):**
```bash
CORS_ORIGIN=https://tu-frontend-url.com,https://otro-dominio.com
```

> 💡 **Tip:** Railway automáticamente referencia las variables de PostgreSQL usando `${{Postgres.VARIABLE_NAME}}`

### 4.3 Guardar cambios

Railway guardará automáticamente cada variable que agregues.

---

## 🔄 Paso 5: Configurar el Deploy

### 5.1 Verificar configuración de build

1. Ve a la pestaña **"Settings"** de tu servicio
2. En **"Build Command"**, verifica que esté:
   ```bash
   npm install && npx prisma generate && npm run build
   ```

3. En **"Start Command"**, verifica que esté:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

> 💡 Railway debería detectar esto automáticamente desde `railway.json` y `Procfile`

### 5.2 Configurar dominio público

1. Ve a la pestaña **"Settings"**
2. Busca la sección **"Networking"**
3. Haz clic en **"Generate Domain"**
4. Railway te asignará un dominio tipo: `tu-app.up.railway.app`

---

## 🚀 Paso 6: Deployar

### 6.1 Iniciar deploy manual (primera vez)

1. Ve a la pestaña **"Deployments"**
2. Haz clic en **"Deploy"** o simplemente espera
3. Railway automáticamente:
   - Clonará tu repositorio
   - Instalará dependencias (`npm install`)
   - Generará Prisma Client (`npx prisma generate`)
   - Compilará TypeScript (`npm run build`)
   - Ejecutará migraciones (`npx prisma migrate deploy`)
   - Iniciará la aplicación (`npm run start:prod`)

### 6.2 Monitorear logs

1. Ve a la pestaña **"Deployments"**
2. Haz clic en el deployment activo
3. Ve a **"Build Logs"** para ver el proceso de build
4. Ve a **"Deploy Logs"** para ver los logs en tiempo real

Deberías ver algo como:
```
✅ Running migrations...
✅ Application is running on: http://0.0.0.0:4001
✅ Swagger documentation: http://0.0.0.0:4001/api/docs
```

---

## 🌱 Paso 7: Ejecutar el Seed (Opcional)

### 7.1 Conectarse a Railway CLI (Opcional)

Si quieres ejecutar el seed desde Railway CLI:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar seed
railway run npm run prisma:seed
```

### 7.2 Seed manual via Prisma Studio

Alternativamente, puedes usar Prisma Studio para insertar datos manualmente.

---

## ✅ Paso 8: Verificar el Deploy

### 8.1 Probar la API

1. Abre tu dominio de Railway: `https://tu-app.up.railway.app/api/docs`
2. Deberías ver la documentación de Swagger
3. Prueba el endpoint de login:
   ```bash
   POST https://tu-app.up.railway.app/api/auth/login
   {
     "email": "admin@test.com",
     "password": "admin123"
   }
   ```

### 8.2 Verificar endpoints públicos

```bash
# Health check
GET https://tu-app.up.railway.app/api

# Swagger docs
GET https://tu-app.up.railway.app/api/docs
```

---

## 🔧 Paso 9: Configuración Adicional (Opcional)

### 9.1 Configurar auto-deploy en push

Railway ya tiene configurado auto-deploy por defecto. Cada vez que hagas `git push` a tu rama principal:
1. Railway detectará los cambios
2. Iniciará un nuevo deployment automáticamente

### 9.2 Configurar health checks

1. Ve a **"Settings"** > **"Health Check"**
2. Activa health checks
3. Configura:
   - Path: `/api/auth/validate` o crea un endpoint `/health`
   - Intervalo: `30s`
   - Timeout: `10s`

### 9.3 Configurar variables de entorno por rama

Si tienes múltiples ramas (staging, production):
1. Railway permite crear servicios separados por rama
2. Cada servicio puede tener sus propias variables de entorno

---

## 📊 Paso 10: Monitoreo y Logs

### 10.1 Ver logs en tiempo real

```bash
# Desde Railway CLI
railway logs
```

O desde el dashboard:
1. Ve a **"Deployments"**
2. Selecciona el deployment activo
3. Ve a **"Deploy Logs"**

### 10.2 Ver métricas

1. Ve a la pestaña **"Metrics"**
2. Podrás ver:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request rate

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Usa la referencia: `${{Postgres.DATABASE_URL}}`
3. Verifica que el servicio de PostgreSQL esté ejecutándose

### Error: "Prisma Client not generated"

**Solución:**
1. Agrega `npx prisma generate` al build command:
   ```bash
   npm install && npx prisma generate && npm run build
   ```

### Error: "Port already in use"

**Solución:**
1. Asegúrate de que `main.ts` use `process.env.PORT`
2. Railway asigna automáticamente el puerto

### Error de migraciones

**Solución:**
```bash
# Desde Railway CLI
railway run npx prisma migrate deploy

# O resetear (⚠️ borra datos)
railway run npx prisma migrate reset --force
```

### La aplicación no responde

**Solución:**
1. Verifica que esté escuchando en `0.0.0.0` (no `localhost`)
2. Verifica logs: `railway logs`
3. Asegúrate de que el health check pase

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **API**: `https://tu-app.up.railway.app/api`
- **Swagger Docs**: `https://tu-app.up.railway.app/api/docs`
- **Login Endpoint**: `https://tu-app.up.railway.app/api/auth/login`

---

## 📚 Recursos Adicionales

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

---

## 🔐 Seguridad en Producción

### Cambiar secretos JWT

```bash
# Genera secretos seguros
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Actualiza en Railway:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### Configurar CORS apropiadamente

```bash
# Solo permite tu frontend
CORS_ORIGIN=https://tu-frontend.com
```

### Usar variables de entorno seguras

❌ **NO hagas esto:**
```bash
JWT_SECRET=123456
```

✅ **Haz esto:**
```bash
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 📝 Comandos Útiles Railway CLI

```bash
# Login
railway login

# Listar proyectos
railway list

# Conectar al proyecto
railway link

# Ver variables
railway variables

# Agregar variable
railway variables set KEY=value

# Ver logs
railway logs

# Ejecutar comando en Railway
railway run <command>

# Abrir dashboard
railway open
```

---

## 🔄 Actualizar el Proyecto

```bash
# 1. Hacer cambios localmente
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push a GitHub
git push origin main

# 3. Railway auto-deploya automáticamente
# 4. Monitorea en el dashboard
```

---

¡Felicidades! 🎉 Tu aplicación está desplegada en Railway.

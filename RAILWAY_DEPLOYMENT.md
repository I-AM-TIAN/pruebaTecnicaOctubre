# 🚀 Guía de Despliegue en Railway

Esta guía te ayudará a desplegar tu aplicación NestJS con Prisma y PostgreSQL en Railway.

## 📋 Prerequisitos

1. Cuenta en [Railway.app](https://railway.app/)
2. Proyecto subido a GitHub
3. Railway CLI instalado (opcional)

## 🔧 Configuración Inicial

### 1. Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app/) e inicia sesión
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza a Railway para acceder a tu repositorio
5. Selecciona tu repositorio

### 2. Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente la base de datos y te proporcionará las credenciales

### 3. Configurar Variables de Entorno

Ve a tu servicio (el que tiene tu código) y agrega estas variables de entorno:

#### Variables Requeridas:

```bash
# Database (Railway genera esto automáticamente al conectar el servicio con PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-long-string-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-long-string-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS Configuration (URL de tu frontend)
CORS_ORIGIN=https://tu-frontend.vercel.app,https://otro-dominio.com

# Port (Railway lo configura automáticamente)
PORT=${{PORT}}
```

#### Generar Secrets Seguros:

Para generar secrets JWT seguros, usa estos comandos en tu terminal:

**PowerShell:**
```powershell
# JWT Secret
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))

# JWT Refresh Secret
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

**Linux/Mac:**
```bash
# JWT Secret
openssl rand -base64 64

# JWT Refresh Secret
openssl rand -base64 64
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 4. Conectar Servicio con Base de Datos

1. En tu servicio de backend, ve a "Settings" → "Variables"
2. Haz clic en "+ Variable" → "Add Reference"
3. Selecciona tu base de datos PostgreSQL
4. Selecciona `DATABASE_URL`
5. Railway automáticamente configurará la variable `DATABASE_URL` con la referencia: `${{Postgres.DATABASE_URL}}`

## 🚢 Proceso de Despliegue

Railway detectará automáticamente tu configuración y:

1. **Instalará las dependencias** con `npm ci`
2. **Generará Prisma Client** con el postinstall script
3. **Construirá la aplicación** con `npm run build`
4. **Ejecutará las migraciones** con `npm run migrate:deploy`
5. **Iniciará la aplicación** con `npm run start:prod`

### Comandos Configurados:

- **Build**: `npm ci && npm run build`
- **Start**: `npm run migrate:deploy && npm run start:prod`

## 🔍 Verificación del Despliegue

Una vez desplegado, Railway te proporcionará una URL como: `https://tu-proyecto.up.railway.app`

Verifica que todo funciona:

1. **API**: `https://tu-proyecto.up.railway.app/api/docs`
2. **Health Check**: Railway monitoreará `/api/docs` automáticamente

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real:

1. En Railway, selecciona tu servicio
2. Haz clic en la pestaña "Deployments"
3. Selecciona el deployment activo
4. Verás los logs en tiempo real

### Logs Comunes:

```bash
✅ Éxito:
🚀 Servidor escuchando en puerto 4001
📚 Swagger en /api/docs

❌ Error de Base de Datos:
Error: P1001: Can't reach database server
Solución: Verifica que DATABASE_URL esté correctamente configurado

❌ Error de Migraciones:
Error: Migration failed
Solución: Revisa los logs de Prisma y verifica el schema
```

## 🔄 Actualizar el Despliegue

Railway desplegará automáticamente cada vez que hagas push a tu rama principal (main).

### Despliegue Manual:

1. Ve a tu servicio en Railway
2. Haz clic en "Deployments"
3. Haz clic en "Deploy" en la esquina superior derecha

## 🛠️ Solución de Problemas

### Problema: La aplicación no inicia

**Solución:**
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs en Railway
3. Asegúrate de que `DATABASE_URL` esté conectado correctamente

### Problema: Error de migraciones

**Solución:**
```bash
# Conectar a la base de datos de Railway localmente
railway link
railway run npx prisma migrate reset --force
railway run npx prisma migrate deploy
```

### Problema: CORS Error

**Solución:**
1. Verifica que `CORS_ORIGIN` incluya la URL de tu frontend
2. Formato correcto: `https://dominio.com` (sin slash final)
3. Múltiples orígenes separados por comas

### Problema: JWT Token Inválido

**Solución:**
1. Verifica que `JWT_SECRET` y `JWT_REFRESH_SECRET` estén configurados
2. Asegúrate de que sean lo suficientemente largos (mínimo 32 caracteres)
3. No uses los valores de ejemplo en producción

## 🔐 Seguridad

### Checklist de Seguridad:

- ✅ `JWT_SECRET` y `JWT_REFRESH_SECRET` únicos y seguros
- ✅ `CORS_ORIGIN` configurado correctamente
- ✅ Variables de entorno nunca commiteadas al repositorio
- ✅ Base de datos con contraseñas seguras
- ✅ HTTPS habilitado (Railway lo hace por defecto)

## 📝 Scripts Útiles

### Seed de Base de Datos:

Si necesitas poblar tu base de datos con datos de prueba:

```bash
# Localmente conectado a Railway
railway run npm run prisma:seed
```

### Prisma Studio en Producción:

```bash
# Abrir Prisma Studio conectado a Railway
railway run npx prisma studio
```

### Ver Estado de Migraciones:

```bash
railway run npx prisma migrate status
```

## 🌐 URLs Importantes

Después del despliegue, tendrás acceso a:

- **API Base**: `https://tu-proyecto.up.railway.app`
- **Swagger Docs**: `https://tu-proyecto.up.railway.app/api/docs`
- **Health Check**: `https://tu-proyecto.up.railway.app/api/docs`

## 📚 Recursos Adicionales

- [Railway Documentation](https://docs.railway.app/)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [NestJS Documentation](https://docs.nestjs.com/)

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Railway
2. Verifica la documentación de Railway
3. Revisa los archivos de configuración: `railway.toml`, `nixpacks.toml`
4. Contacta al soporte de Railway

---

## 🎉 ¡Felicidades!

Tu aplicación está lista para producción en Railway. Recuerda:

- Monitorear los logs regularmente
- Mantener las dependencias actualizadas
- Realizar backups de la base de datos
- Revisar las métricas de rendimiento en Railway

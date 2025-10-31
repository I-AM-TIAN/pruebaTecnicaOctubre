# Solución de Errores de Build en Railway

## Error 1: "Failed to load config file /app as a TypeScript/JavaScript module"

### Causa
El archivo `prisma.config.ts` no es parte de la configuración estándar de Prisma y causaba conflictos durante el build.

### Solución Aplicada
✅ Eliminado `prisma.config.ts`

## Error 2: "failed to compute cache key: /app/generated: not found"

### Causa
Railway estaba usando el Dockerfile en lugar de Nixpacks, y el Dockerfile intentaba copiar el directorio `generated` que ya no existe porque Prisma ahora genera el cliente en la ubicación por defecto (`node_modules/@prisma/client`).

### Solución Aplicada

1. **Renombrado `Dockerfile` a `Dockerfile.backup`**
   - Railway prioriza Dockerfile sobre Nixpacks
   - Al renombrar, forzamos el uso de Nixpacks

2. **Creado `.railwayignore`**
   - Asegura que el Dockerfile no sea considerado

3. **Nixpacks es mejor para este proyecto porque:**
   - Detecta automáticamente Node.js y Prisma
   - Maneja correctamente `postinstall` scripts
   - Más simple y menos propenso a errores
   - Optimizado para Railway

## Configuración Actualizada

### 1. Eliminado `prisma.config.ts`**
   - Este archivo no es necesario para Prisma

2. **Actualizado `prisma/schema.prisma`**
   ```prisma
   generator client {
     provider = "prisma-client-js"
     output   = "../generated/prisma"
   }
   ```

3. **Mejorado `nixpacks.toml`**
   ```toml
   [phases.install]
   cmds = ['npm ci --include=dev']
   
   [phases.build]
   cmds = ['npx prisma generate', 'npm run build']
   ```

4. **Simplificado scripts en `package.json`**
   - Removidos los límites de memoria innecesarios
   - Cambiado `prisma generate` a `npx prisma generate`
   - Agregado script `prisma:generate` explícito

5. **Creado `.npmrc`**
   - Configuración optimizada para Railway

## Pasos para Re-deployar

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "Fix Prisma configuration for Railway deployment"
   git push origin main
   ```

2. **Railway detectará el push y re-desplegará automáticamente**

3. **Verificar el build:**
   - Ve a Railway Dashboard
   - Click en tu servicio
   - Ve a "Deployments"
   - Observa los logs en tiempo real

## Verificación Local (Opcional)

Antes de hacer push, puedes probar localmente:

```bash
# Limpiar
Remove-Item -Recurse -Force node_modules, dist, generated -ErrorAction SilentlyContinue

# Instalar
npm ci --include=dev

# Generar Prisma
npx prisma generate

# Build
npm run build

# Verificar
Test-Path dist/main.js
Test-Path generated/prisma
```

## Qué Esperar en los Logs

### ✅ Build Exitoso:
```
[builder 1/8] Installing dependencies
[builder 2/8] Running npm ci --include=dev
[builder 3/8] Generating Prisma Client
[builder 4/8] RUN npx prisma generate
✔ Generated Prisma Client
[builder 5/8] Building application
[builder 6/8] RUN npm run build
✔ Build completed successfully
```

### ❌ Si aún hay errores:

1. **Error de Base de Datos:**
   - Verifica que `DATABASE_URL` esté configurado en Railway
   - Debe ser una referencia: `${{Postgres.DATABASE_URL}}`

2. **Error de Memoria:**
   - Railway free tier tiene 512MB RAM
   - El build está optimizado para esto

3. **Error de Dependencias:**
   - Verifica que `package.json` no tenga errores de sintaxis
   - Asegúrate de que todas las dependencias existan en npm

## Variables de Entorno Requeridas

En Railway, asegúrate de tener:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | [tu secret de 64+ chars] |
| `JWT_REFRESH_SECRET` | [tu secret de 64+ chars] |
| `JWT_ACCESS_EXPIRATION` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `CORS_ORIGIN` | URL de tu frontend (opcional) |

## Contacto y Soporte

Si el error persiste después de estos cambios:

1. Comparte los logs completos del build
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el servicio PostgreSQL esté corriendo en Railway
4. Verifica que la conexión entre tu servicio y PostgreSQL esté establecida

---

**Última actualización:** 31 de Octubre, 2025

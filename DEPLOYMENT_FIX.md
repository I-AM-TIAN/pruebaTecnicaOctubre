# 🔧 Solución de Errores de Despliegue - Out of Memory

## 📋 Problema Detectado

Tu aplicación estaba fallando durante el despliegue con el siguiente error:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

Este error ocurre cuando Node.js agota la memoria del heap (por defecto ~256MB) durante la compilación o inicio de la aplicación NestJS.

## ✅ Soluciones Implementadas

### 1. Aumento de Memoria en Scripts (✅ IMPLEMENTADO)

He modificado el `package.json` para aumentar la memoria disponible en todos los scripts críticos:

```json
{
  "scripts": {
    "build": "node --max-old-space-size=512 ./node_modules/.bin/nest build",
    "start": "node --max-old-space-size=512 ./node_modules/.bin/nest start",
    "start:dev": "node --max-old-space-size=512 ./node_modules/.bin/nest start --watch",
    "start:prod": "node --max-old-space-size=512 dist/main"
  }
}
```

**¿Qué hace `--max-old-space-size=512`?**
- Aumenta la memoria del heap de Node.js de ~256MB a 512MB
- Suficiente para compilar y ejecutar aplicaciones NestJS medianas
- Valor conservador que funciona en la mayoría de plataformas de despliegue

### 2. Configuración para Plataforma de Despliegue

Dependiendo de tu plataforma de despliegue, necesitas configurar lo siguiente:

#### **Railway / Render / Heroku**

No requiere configuración adicional. Los scripts actualizados funcionarán automáticamente.

#### **Docker / Containers**

Si usas Docker, asegúrate de que tu Dockerfile incluya:

```dockerfile
# Aumentar memoria durante el build
ENV NODE_OPTIONS="--max-old-space-size=512"

# Build
RUN npm run build

# Para producción
CMD ["node", "--max-old-space-size=512", "dist/main"]
```

#### **Variables de Entorno (Alternativa)**

Puedes configurar la variable de entorno en tu plataforma:

```bash
NODE_OPTIONS=--max-old-space-size=512
```

Esta variable se aplicará automáticamente a todos los procesos de Node.js.

## 🚀 Pasos para Redesplegar

### Opción A: Con los Scripts Actualizados (Recomendado)

1. **Commitea los cambios:**
   ```bash
   git add package.json
   git commit -m "fix: increase Node.js memory limit to 512MB"
   git push origin main
   ```

2. **Redesplegar:**
   - Tu plataforma debería detectar automáticamente los cambios
   - Los nuevos scripts con `--max-old-space-size=512` se ejecutarán

### Opción B: Configurar Variable de Entorno

1. **En tu plataforma de despliegue (Railway/Render/Heroku):**
   - Ve a la sección de Variables de Entorno
   - Agrega: `NODE_OPTIONS` = `--max-old-space-size=512`

2. **Redespliega manualmente** si es necesario

## 📊 Ajustes de Memoria Según Necesidad

Si 512MB no es suficiente (poco probable), puedes aumentar:

| Tamaño App | Memoria Recomendada |
|------------|---------------------|
| Pequeña    | 256MB (default)     |
| Mediana    | 512MB ✅            |
| Grande     | 1024MB (1GB)        |
| Muy Grande | 2048MB (2GB)        |

Para cambiar, modifica el valor en `package.json`:
```json
"start": "node --max-old-space-size=1024 ./node_modules/.bin/nest start"
```

## 🔍 Verificación

Después de redesplegar, deberías ver en los logs:

```
✅ [Nest] Application successfully started
✅ 🚀 Servidor corriendo en http://...
✅ 📚 Documentación Swagger disponible en http://.../api/docs
```

En lugar de:
```
❌ FATAL ERROR: Reached heap limit Allocation failed
❌ Aborted
```

## 🛠️ Solución Alternativa: Build Optimizado

Si el problema persiste, considera construir localmente y desplegar solo los archivos compilados:

```bash
# Local
npm run build

# Desplegar solo dist/ y node_modules de producción
# Esto evita compilar en el servidor
```

Modifica el start command en tu plataforma a:
```bash
node --max-old-space-size=512 dist/main
```

## 📝 Notas Importantes

1. **Prisma Client:** Asegúrate de que `npx prisma generate` se ejecute ANTES del build
   ```json
   "scripts": {
     "postinstall": "prisma generate",
     "build": "node --max-old-space-size=512 ./node_modules/.bin/nest build"
   }
   ```

2. **Dependencias Dev:** El warning `npm warn config production Use --omit=dev instead` es solo un aviso, no causa el error OOM.

3. **Memoria de Plataforma:** Verifica que tu plan de hosting tenga al menos 512MB de RAM disponible.

## 🎯 Resumen

- ✅ **Causa:** Node.js se quedó sin memoria durante el inicio de NestJS
- ✅ **Solución:** Aumentar memoria con `--max-old-space-size=512`
- ✅ **Implementado en:** Todos los scripts críticos de `package.json`
- ✅ **Próximo paso:** Commit y push para redesplegar

---

**¿Necesitas más ayuda?** Si el problema persiste después de estos cambios, revisa:
1. Logs de tu plataforma de despliegue
2. Plan de memoria de tu hosting (debe tener ≥512MB RAM)
3. Considera usar `NODE_OPTIONS` como variable de entorno global

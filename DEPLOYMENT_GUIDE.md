# 🚀 Guía de Despliegue por Plataforma

## 🎯 Configuración Rápida según tu Plataforma

Los cambios en `package.json` ya están aplicados. Sigue los pasos según tu plataforma:

---

## 🚂 Railway

### Configuración Automática
1. **Conecta tu repositorio de GitHub**
2. **Railway detectará automáticamente:**
   - `package.json` con los nuevos scripts
   - Variables de entorno necesarias

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=tu_secreto_jwt_muy_seguro_de_al_menos_32_caracteres
JWT_REFRESH_SECRET=tu_secreto_refresh_jwt_diferente_al_anterior
PORT=4001
```

### Comandos de Despliegue (Railway ejecuta automáticamente)
```bash
# Install
npm install

# Build (con memoria aumentada)
npm run build

# Start (con memoria aumentada)
npm start
```

### Plan Recomendado
- ✅ **Starter Plan** ($5/mes) - 512MB RAM mínimo
- ⚠️ Free tier puede quedarse sin memoria

---

## 🎨 Render

### Configuración en Dashboard

1. **Build Command:**
   ```bash
   npm install && npm run build
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

3. **Variables de Entorno:**
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   PORT=4001
   NODE_ENV=production
   ```

### Alternativa: render.yaml
Crea un archivo `render.yaml` en la raíz:

```yaml
services:
  - type: web
    name: backend-prueba-tecnica
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: PORT
        value: 4001
```

### Plan Recomendado
- ✅ **Starter Plan** ($7/mes) - 512MB RAM

---

## 🟣 Heroku

### Procfile
Crea un archivo `Procfile` en la raíz:

```
web: npm start
release: npx prisma migrate deploy
```

### Buildpacks
```bash
heroku buildpacks:set heroku/nodejs
```

### Variables de Entorno
```bash
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set JWT_SECRET="tu_secreto_jwt"
heroku config:set JWT_REFRESH_SECRET="tu_secreto_refresh"
heroku config:set NODE_ENV="production"
```

### Alternativa: Usar NODE_OPTIONS globalmente
```bash
heroku config:set NODE_OPTIONS="--max-old-space-size=512"
```

### Plan Recomendado
- ✅ **Basic Plan** ($7/mes) - 512MB RAM

---

## 🐳 Docker (Generic)

### Usando el Dockerfile.example

1. **Renombra el archivo:**
   ```bash
   cp Dockerfile.example Dockerfile
   ```

2. **Build:**
   ```bash
   docker build -t backend-prueba-tecnica .
   ```

3. **Run:**
   ```bash
   docker run -p 4001:4001 \
     -e DATABASE_URL="postgresql://..." \
     -e JWT_SECRET="..." \
     -e JWT_REFRESH_SECRET="..." \
     backend-prueba-tecnica
   ```

### Docker Compose
Crea `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/appdb
      - JWT_SECRET=your_jwt_secret
      - JWT_REFRESH_SECRET=your_refresh_secret
      - PORT=4001
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## ☁️ AWS / Azure / GCP

### AWS Elastic Beanstalk

1. **Archivo .ebextensions/node-settings.config:**
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "node --max-old-space-size=512 dist/main"
       NodeVersion: 20
   ```

2. **Deploy:**
   ```bash
   eb init
   eb create
   eb deploy
   ```

### Azure App Service

1. **Configuración en Portal Azure:**
   - Application Settings → NODE_OPTIONS → `--max-old-space-size=512`
   - Startup Command → `npm start`

2. **O mediante Azure CLI:**
   ```bash
   az webapp config appsettings set \
     --name myapp \
     --resource-group mygroup \
     --settings NODE_OPTIONS="--max-old-space-size=512"
   ```

### Google Cloud Run

1. **Dockerfile obligatorio** (usa Dockerfile.example)

2. **Deploy:**
   ```bash
   gcloud run deploy backend-prueba-tecnica \
     --source . \
     --memory 512Mi \
     --allow-unauthenticated
   ```

---

## 🔧 Configuración de Base de Datos

### Para cualquier plataforma, asegúrate de:

1. **Crear la base de datos PostgreSQL**

2. **Obtener la DATABASE_URL** en formato:
   ```
   postgresql://usuario:password@host:puerto/database?schema=public
   ```

3. **Ejecutar migraciones:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Seed (opcional):**
   ```bash
   npm run prisma:seed
   ```

---

## 🌐 Variables de Entorno Completas

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@host:5432/database?schema=public

# JWT Secrets (generar strings seguros de 32+ caracteres)
JWT_SECRET=tu_secreto_super_seguro_para_jwt_tokens_minimo_32_caracteres
JWT_REFRESH_SECRET=otro_secreto_diferente_para_refresh_tokens_minimo_32

# Puerto
PORT=4001

# Entorno
NODE_ENV=production

# Opcional: Memoria de Node.js (si no usas los scripts modificados)
NODE_OPTIONS=--max-old-space-size=512
```

### Generar Secrets Seguros:
```bash
# En terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Checklist Pre-Despliegue

- [ ] `package.json` actualizado con `--max-old-space-size=512` ✅
- [ ] Variables de entorno configuradas en la plataforma
- [ ] Base de datos PostgreSQL creada
- [ ] `DATABASE_URL` correcta y accesible
- [ ] Secrets JWT generados (32+ caracteres)
- [ ] Plan de hosting con mínimo 512MB RAM
- [ ] Código commiteado y pusheado a GitHub

---

## 🚨 Solución de Problemas

### Error: "Out of Memory" persiste

1. **Aumentar a 1GB:**
   ```json
   "start": "node --max-old-space-size=1024 ./node_modules/.bin/nest start"
   ```

2. **O usar variable de entorno:**
   ```env
   NODE_OPTIONS=--max-old-space-size=1024
   ```

### Error: "Cannot connect to database"

- Verifica que `DATABASE_URL` esté correcta
- Verifica que la IP del servidor esté en la whitelist de tu DB
- Usa conexión SSL si es requerida: `?sslmode=require`

### Error: "Port already in use"

- Asegúrate de que `PORT` esté configurada
- Algunas plataformas asignan el puerto automáticamente (Railway, Render)

---

## 📚 Recursos Adicionales

- [Documentación NestJS Deployment](https://docs.nestjs.com/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Node.js Memory Management](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes)

---

**¿Listo para desplegar? 🚀**

```bash
git add .
git commit -m "fix: increase Node.js memory limit and add deployment configs"
git push origin main
```

¡Tu plataforma debería detectar automáticamente los cambios y redesplegar! 🎉

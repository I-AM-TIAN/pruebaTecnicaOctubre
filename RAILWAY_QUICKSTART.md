# 🚂 Railway - Guía Rápida (5 minutos)

## ✅ Checklist Rápido

### 1️⃣ Preparar Proyecto (1 min)
```bash
# Ya tienes estos archivos creados:
✅ railway.json
✅ nixpacks.toml
✅ Procfile
✅ src/main.ts

# Commit y push
git add .
git commit -m "feat: railway deployment config"
git push origin main
```

### 2️⃣ Railway Setup (2 min)
1. Ve a [railway.app](https://railway.app/) → Login con GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repo: `I-AM-TIAN/pruebaTecnicaOctubre`
4. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**

### 3️⃣ Variables de Entorno (2 min)

Ve a tu servicio → **"Variables"** → Agrega:

```bash
# Base de datos
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (⚠️ Cambia en producción)
JWT_SECRET=genera-un-secreto-seguro-aqui-con-64-caracteres-minimo
JWT_REFRESH_SECRET=genera-otro-secreto-diferente-aqui-tambien-64-chars

# Servidor
PORT=4001
NODE_ENV=production
```

### 4️⃣ Deploy y Verifica (30 seg)
1. Railway auto-deploya al detectar cambios
2. Ve a **"Settings"** → **"Generate Domain"**
3. Abre: `https://tu-app.up.railway.app/api/docs`

---

## 🔑 Generar Secretos Seguros

Ejecuta esto en tu terminal local:

```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Linux/Mac
openssl rand -hex 64
```

Copia el resultado y úsalo para `JWT_SECRET` y `JWT_REFRESH_SECRET`

---

## 🧪 Probar tu API

```bash
# Login
curl -X POST https://tu-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Swagger UI
https://tu-app.up.railway.app/api/docs
```

---

## 🐛 Problemas Comunes

### "Cannot connect to database"
- ✅ Verifica: `DATABASE_URL=${{Postgres.DATABASE_URL}}`

### "Prisma Client not generated"  
- ✅ Build command debe incluir: `npx prisma generate`

### "Port error"
- ✅ Asegúrate que `main.ts` usa `process.env.PORT`

---

## 📚 Documentación Completa
Ver: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

---

¡Eso es todo! 🎉 Tu app debería estar funcionando.

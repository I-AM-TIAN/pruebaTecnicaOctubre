# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client y construir la aplicación
RUN npx prisma generate
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# Exponer el puerto
EXPOSE 4001

# Comando de inicio: ejecutar migraciones y luego iniciar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

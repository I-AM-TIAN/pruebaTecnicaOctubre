<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API REST para gestión de prescripciones médicas construida con NestJS, Prisma y PostgreSQL. Incluye autenticación JWT y control de acceso basado en roles (RBAC).

### Características

- 🔐 Autenticación JWT con refresh tokens
- 👥 Sistema de roles (Admin, Doctor, Patient)
- 💊 Gestión de prescripciones médicas
- 📄 Generación de PDFs con códigos QR
- 📚 Documentación automática con Swagger
- 🗄️ Base de datos PostgreSQL con Prisma ORM
- 🚀 Listo para desplegar en Railway

## � Requisitos Previos

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 14.x
- **Git**: Para clonar el repositorio

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd backend-prueba-tecnica-vf
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# ============================================
# Server Configuration
# ============================================
PORT=4001

# ============================================
# Database Configuration
# ============================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=prueba_tecnica
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Prisma Database URL
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ============================================
# CORS Configuration
# ============================================
# Puedes especificar múltiples orígenes separados por comas
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

> **⚠️ IMPORTANTE**: Cambia los valores de `JWT_SECRET` y `JWT_REFRESH_SECRET` en producción por claves seguras generadas aleatoriamente.

### 4. Configurar la base de datos

#### Opción A: Usando Docker (Recomendado)

```bash
# Inicia PostgreSQL con Docker Compose
docker-compose up -d
```

#### Opción B: PostgreSQL local

Asegúrate de tener PostgreSQL instalado y ejecutándose localmente, luego crea la base de datos:

```sql
CREATE DATABASE prueba_tecnica;
```

### 5. Ejecutar migraciones de Prisma

```bash
# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones
npx prisma migrate deploy

# O si es desarrollo
npx prisma migrate dev
```

### 6. Poblar la base de datos (Seed)

```bash
npm run prisma:seed
```

Esto creará usuarios de prueba:
- **Admin**: admin@example.com / admin123
- **Doctor**: doctor@example.com / doctor123
- **Paciente**: patient@example.com / patient123

## 🏃 Ejecutar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:4001`

## 📚 Documentación de la API

Una vez que la aplicación esté ejecutándose, accede a la documentación interactiva de Swagger:

```
http://localhost:4001/api
```

## 🧪 Ejecutar Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 🗄️ Comandos útiles de Prisma

```bash
# Ver la base de datos en Prisma Studio
npx prisma studio

# Crear una nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear la base de datos (¡Cuidado! Borra todos los datos)
npx prisma migrate reset

# Ver el estado de las migraciones
npx prisma migrate status
```

## 📖 Estructura del Proyecto

```
backend-prueba-tecnica-vf/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.ts                # Script de población inicial
│   └── migrations/            # Migraciones de base de datos
├── src/
│   ├── admin/                 # Módulo de administración
│   ├── auth/                  # Módulo de autenticación (JWT)
│   ├── common/                # Filtros e interceptores globales
│   ├── doctors/               # Módulo de doctores
│   ├── patients/              # Módulo de pacientes
│   ├── prescriptions/         # Módulo de prescripciones
│   ├── prisma/                # Servicio de Prisma
│   ├── app.module.ts          # Módulo principal
│   └── main.ts                # Punto de entrada
├── .env                       # Variables de entorno (crear)
├── docker-compose.yml         # Configuración de Docker
└── package.json               # Dependencias del proyecto
```

## 🔐 Autenticación

El sistema utiliza JWT con tokens de acceso y refresh tokens:

1. **Login**: POST `/auth/login`
   - Devuelve `accessToken` y `refreshToken`
   
2. **Refresh Token**: POST `/auth/refresh`
   - Usa el `refreshToken` para obtener un nuevo `accessToken`

3. **Logout**: POST `/auth/logout`
   - Invalida el refresh token actual

### Roles disponibles:
- **admin**: Acceso completo a todas las funcionalidades
- **doctor**: Puede crear y gestionar prescripciones
- **patient**: Puede ver sus propias prescripciones

## 🔗 Endpoints Principales

### Auth
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/profile` - Ver perfil

### Prescriptions
- `GET /prescriptions` - Listar todas (Admin/Doctor)
- `GET /prescriptions/:id` - Ver una prescripción
- `POST /prescriptions` - Crear prescripción (Doctor)
- `PATCH /prescriptions/:id` - Actualizar (Doctor)
- `DELETE /prescriptions/:id` - Eliminar (Doctor)
- `GET /prescriptions/:id/pdf` - Descargar PDF

### Patients
- `GET /patients` - Listar pacientes
- `GET /patients/:id` - Ver paciente
- `GET /patients/:id/prescriptions` - Ver prescripciones del paciente

### Doctors
- `GET /doctors` - Listar doctores
- `GET /doctors/:id` - Ver doctor

### Admin
- `GET /admin/metrics` - Métricas del sistema
- `GET /admin/users` - Gestión de usuarios

## 🐳 Docker

El proyecto incluye configuración de Docker para desarrollo:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## 🛠️ Tecnologías Utilizadas

- **Framework**: NestJS 11.x
- **ORM**: Prisma 6.x
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (Passport)
- **Validación**: class-validator & class-transformer
- **Documentación**: Swagger/OpenAPI
- **PDF Generation**: PDFKit
- **QR Codes**: qrcode (vía nanoid)

## 📝 Variables de Entorno Detalladas

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `PORT` | Puerto del servidor | `4001` | No |
| `DATABASE_URL` | URL de conexión a PostgreSQL | - | Sí |
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` | Sí |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `postgres` | Sí |
| `POSTGRES_DB` | Nombre de la base de datos | `prueba_tecnica` | Sí |
| `POSTGRES_HOST` | Host de PostgreSQL | `localhost` | Sí |
| `POSTGRES_PORT` | Puerto de PostgreSQL | `5432` | Sí |
| `JWT_SECRET` | Secreto para access tokens | - | Sí |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | - | Sí |
| `JWT_ACCESS_EXPIRATION` | Duración del access token | `15m` | No |
| `JWT_REFRESH_EXPIRATION` | Duración del refresh token | `7d` | No |
| `CORS_ORIGIN` | Orígenes permitidos (separados por comas) | - | No |

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté ejecutándose
- Comprueba las credenciales en el archivo `.env`
- Si usas Docker: `docker-compose ps`

### Error: "JWT must be provided"
- Asegúrate de incluir el header `Authorization: Bearer <token>`
- Verifica que el token no haya expirado

### Error de migraciones
```bash
# Resetea la base de datos y aplica todas las migraciones
npx prisma migrate reset
```

### Puerto ya en uso
```bash
# En PowerShell, encuentra el proceso usando el puerto 4001
Get-NetTCPConnection -LocalPort 4001 | Select-Object -Property OwningProcess
Stop-Process -Id <PID>
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## 👤 Autor

**Tu Nombre**
- GitHub: [@I-AM-TIAN](https://github.com/I-AM-TIAN)
- Proyecto: pruebaTecnicaOctubre

## 📄 License

Este proyecto es de código cerrado y fue desarrollado como prueba técnica.

---

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

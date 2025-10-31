# 📋 Swagger Documentation

## 📚 Acceso a la Documentación Interactiva

La API cuenta con documentación interactiva generada con **Swagger UI** donde puedes:
- Ver todos los endpoints disponibles
- Probar la API directamente desde el navegador
- Ver esquemas de request/response
- Autenticarte y ejecutar peticiones reales

## 🌐 URL de Swagger

```
http://localhost:4001/api/docs
```

**Abre esta URL en tu navegador** después de iniciar el servidor.

---

## 🔐 Cómo Usar Swagger

### 1. Iniciar el Servidor

```bash
npm run start:dev
```

### 2. Abrir Swagger UI

Navega a: `http://localhost:4001/api/docs`

### 3. Autenticación en Swagger

Para probar endpoints protegidos:

1. **Login primero:**
   - Expande el endpoint `POST /auth/login` (en la sección **Auth**)
   - Haz clic en **"Try it out"**
   - Ingresa las credenciales:
     ```json
     {
       "email": "admin@test.com",
       "password": "admin123"
     }
     ```
   - Haz clic en **"Execute"**
   - Copia el `accessToken` de la respuesta

2. **Autorizar Swagger:**
   - Haz clic en el botón **"Authorize" 🔓** (esquina superior derecha)
   - Pega el token en el campo `Value`: `tu_access_token_aqui`
   - Haz clic en **"Authorize"**
   - Haz clic en **"Close"**

3. **Ya puedes usar endpoints protegidos:**
   - Todos los endpoints ahora enviarán automáticamente el Bearer token

---

## 📖 Estructura de la Documentación

### Tags (Secciones)

La documentación está organizada en 5 secciones principales:

#### 🔑 **Auth**
Endpoints de autenticación y gestión de sesiones:
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar token
- `GET /auth/profile` - Ver mi perfil
- `GET /auth/validate` - Validar token
- `POST /auth/logout` - Cerrar sesión

#### 👥 **Admin**
Endpoints exclusivos para administradores:
- `GET /users` - Listar usuarios
- `GET /admin/metrics` - Métricas del sistema

#### 🏥 **Patients**
Gestión de pacientes:
- `GET /patients` - Listar pacientes (Admin y Doctor)

#### 👨‍⚕️ **Doctors**
Gestión de doctores:
- `GET /doctors` - Listar doctores (Admin)

#### 💊 **Prescriptions**
Gestión de prescripciones médicas:

**Para Doctores:**
- `POST /prescriptions` - Crear prescripción
- `GET /prescriptions` - Listar prescripciones
- `GET /prescriptions/:id` - Ver detalle

**Para Administradores:**
- `GET /prescriptions/admin/prescriptions` - Ver todas

**Para Pacientes:**
- `GET /prescriptions/me/prescriptions` - Mis prescripciones
- `PUT /prescriptions/:id/consume` - Marcar como consumida
- `GET /prescriptions/:id/pdf` - Descargar PDF

---

## 🎯 Ejemplo: Flujo Completo en Swagger

### 1. Login como Doctor

1. Expande `POST /auth/login`
2. Click en **"Try it out"**
3. Body:
   ```json
   {
     "email": "dr@test.com",
     "password": "dr123"
   }
   ```
4. Click **"Execute"**
5. Copia el `accessToken`

### 2. Autorizar

1. Click en **"Authorize" 🔓**
2. Pega el token
3. Click **"Authorize"** → **"Close"**

### 3. Crear Prescripción

1. Expande `POST /prescriptions` (en sección Prescriptions)
2. Click **"Try it out"**
3. Body:
   ```json
   {
     "patientId": "cm2xzy6e40003u2k6xyz",
     "notes": "Gripe común",
     "items": [
       {
         "name": "Paracetamol 500mg",
         "dosage": "1 tableta cada 8 horas",
         "quantity": 20,
         "instructions": "Tomar con alimentos"
       }
     ]
   }
   ```
4. Click **"Execute"**
5. Ver respuesta 201 con la prescripción creada

### 4. Listar Mis Prescripciones

1. Expande `GET /prescriptions`
2. Click **"Try it out"**
3. Configura filtros:
   - `mine`: `true`
   - `status`: `pending`
   - `page`: `1`
   - `limit`: `10`
4. Click **"Execute"**

---

## 🧪 Usuarios de Prueba

Usa estas credenciales para probar diferentes roles:

### Admin
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

### Doctor
```json
{
  "email": "dr@test.com",
  "password": "dr123"
}
```

### Patient
```json
{
  "email": "patient@test.com",
  "password": "patient123"
}
```

---

## 📊 Funcionalidades de Swagger UI

### ✅ Ventajas

1. **Probar en vivo:** Ejecuta peticiones reales sin necesidad de Postman
2. **Esquemas automáticos:** Ve los tipos de datos esperados
3. **Validación:** Swagger valida los datos antes de enviar
4. **Ejemplos:** Todos los endpoints tienen ejemplos pre-cargados
5. **Respuestas:** Ve todas las posibles respuestas (200, 401, 403, etc.)
6. **Documentación siempre actualizada:** Se genera automáticamente del código

### 🎨 Características

- **Bearer Auth integrado:** Solo autoriza una vez
- **Formato JSON automático:** No necesitas escribir comillas manualmente
- **Ejemplos pre-cargados:** Click en "Try it out" y los campos ya tienen valores
- **Sintaxis highlight:** Respuestas JSON coloreadas
- **Curl commands:** Puedes copiar el comando curl de cualquier request

---

## 🔒 Control de Acceso en Swagger

Cuando intentes acceder a un endpoint sin permisos, verás:

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```
**Causa:** No has autorizado Swagger o el token expiró.

### 403 Forbidden
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```
**Causa:** Estás autenticado pero no tienes el rol correcto para ese endpoint.

---

## 💡 Tips

### Tip 1: Refresh Token
El `accessToken` expira en 15 minutos. Cuando expire:
1. Usa `POST /auth/refresh` con tu `refreshToken`
2. Obtén un nuevo `accessToken`
3. Vuelve a **Authorize** con el nuevo token

### Tip 2: Logout
Después de hacer logout (`POST /auth/logout`), debes:
1. Hacer login nuevamente
2. Re-autorizar Swagger con el nuevo token

### Tip 3: IDs
Para obtener IDs válidos (patientId, doctorId, prescriptionId):
- Usa `GET /patients` para obtener IDs de pacientes
- Usa `GET /doctors` para obtener IDs de doctores
- Usa `GET /prescriptions` para obtener IDs de prescripciones

### Tip 4: Formato de Fechas
Las fechas deben estar en formato ISO:
- ✅ `2025-10-31`
- ✅ `2025-10-31T14:30:00.000Z`
- ❌ `31/10/2025`

### Tip 5: Descargar PDF
El endpoint `GET /prescriptions/:id/pdf` descarga un archivo.
Swagger mostrará el contenido binario. Para probarlo mejor:
- Usa el navegador directamente: `http://localhost:4001/prescriptions/{id}/pdf` (con token en headers)
- O usa Postman/Thunder Client

---

## 🛠️ Configuración Técnica

La configuración de Swagger está en `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('API Prescripciones Médicas')
  .setDescription('API REST para gestión de prescripciones médicas con JWT y RBAC')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingrese el token JWT',
      in: 'header',
    },
    'access-token',
  )
  .addTag('Auth', 'Endpoints de autenticación')
  .addTag('Admin', 'Endpoints exclusivos para administradores')
  .addTag('Patients', 'Gestión de pacientes')
  .addTag('Doctors', 'Gestión de doctores')
  .addTag('Prescriptions', 'Gestión de prescripciones médicas')
  .build();
```

---

## 📚 Recursos Adicionales

- **Swagger UI Docs:** https://swagger.io/tools/swagger-ui/
- **OpenAPI Specification:** https://spec.openapis.org/oas/latest.html
- **NestJS Swagger:** https://docs.nestjs.com/openapi/introduction

---

## ✨ Resumen

✅ **Swagger UI está disponible en:** `http://localhost:4001/api/docs`  
✅ **Todos los endpoints están documentados** con ejemplos  
✅ **Autenticación Bearer JWT** integrada  
✅ **Organizado por tags** (Auth, Admin, Patients, Doctors, Prescriptions)  
✅ **Probar en vivo** sin necesidad de herramientas externas  
✅ **Documentación siempre sincronizada** con el código  

**🚀 ¡Ya puedes usar Swagger para explorar y probar toda la API!**

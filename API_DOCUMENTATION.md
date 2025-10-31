# 📚 API Documentation - Backend Prueba Técnica

## 🌐 Base URL
```
http://localhost:4001
```

## 🔐 Autenticación

Todos los endpoints protegidos requieren un **Bearer Token** en el header:
```
Authorization: Bearer {accessToken}
```

---

## 📋 Índice de Endpoints

### Autenticación
- [POST /auth/login](#post-authlogin) - Login
- [POST /auth/refresh](#post-authrefresh) - Refrescar token
- [GET /auth/profile](#get-authprofile) - Obtener perfil
- [POST /auth/logout](#post-authlogout) - Cerrar sesión

### Admin
- [GET /users](#get-users) - Listar usuarios
- [GET /admin/metrics](#get-adminmetrics) - Obtener métricas del sistema

### Patients
- [GET /patients](#get-patients) - Listar pacientes

### Doctors
- [GET /doctors](#get-doctors) - Listar doctores

### Prescriptions (Doctor)
- [POST /prescriptions](#post-prescriptions) - Crear prescripción
- [GET /prescriptions](#get-prescriptions) - Listar mis prescripciones
- [GET /prescriptions/:id](#get-prescriptionsid) - Ver detalle de prescripción

### Prescriptions (Patient)
- [GET /prescriptions/me/prescriptions](#get-prescriptionsmeprescriptions) - Mis prescripciones
- [PUT /prescriptions/:id/consume](#put-prescriptionsidconsume) - Marcar como consumida
- [GET /prescriptions/:id/pdf](#get-prescriptionsidpdf) - Descargar PDF

### Prescriptions (Admin)
- [GET /prescriptions/admin/prescriptions](#get-prescriptionsadminprescriptions) - Todas las prescripciones

---

## 🔑 Autenticación

### POST /auth/login
Iniciar sesión y obtener tokens de acceso.

**Request:**
```json
POST /auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm2xzy6e10000u2k6xyz",
    "email": "admin@test.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

**Usuarios de prueba:**
- Admin: `admin@test.com` / `admin123`
- Doctor: `dr@test.com` / `dr123`
- Patient: `patient@test.com` / `patient123`

---

### POST /auth/refresh
Refrescar el token de acceso cuando expire.

**Request:**
```json
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### GET /auth/profile
Obtener información del usuario autenticado.

**Request:**
```
GET /auth/profile
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "cm2xzy6e10000u2k6xyz",
  "email": "admin@test.com",
  "name": "Administrador",
  "role": "admin",
  "createdAt": "2025-10-31T12:00:00.000Z"
}
```

---

### POST /auth/logout
Cerrar sesión e invalidar el token actual.

**Request:**
```
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

## 👥 Admin Endpoints

### GET /users
Listar usuarios del sistema con filtros y paginación.

**Roles permitidos:** `admin`

**Query Parameters:**
- `role` (opcional): `admin` | `doctor` | `patient`
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Request:**
```
GET /users?role=doctor&page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "cm2xzy6e20001u2k6t8p3l9jx",
      "email": "dr@test.com",
      "name": "Dr. Juan Pérez",
      "role": "doctor",
      "createdAt": "2025-10-31T12:00:00.000Z",
      "doctor": {
        "id": "cm2xzy6e30002u2k6xyz",
        "specialty": "Medicina General",
        "licenseNumber": "12345"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /admin/metrics
Obtener métricas y estadísticas del sistema.

**Roles permitidos:** `admin`

**Query Parameters:**
- `from` (opcional): Fecha inicial ISO (ej: `2025-10-01`)
- `to` (opcional): Fecha final ISO (ej: `2025-10-31`)

**Request:**
```
GET /admin/metrics?from=2025-10-01&to=2025-10-31
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "totals": {
    "doctors": 1,
    "patients": 1,
    "prescriptions": 8
  },
  "byStatus": {
    "pending": 6,
    "consumed": 2
  },
  "byDay": [
    {
      "date": "2025-10-01",
      "count": 2
    },
    {
      "date": "2025-10-15",
      "count": 3
    }
  ],
  "topDoctors": [
    {
      "doctorId": "cm2xzy6e20001u2k6t8p3l9jx",
      "doctorName": "Dr. Juan Pérez",
      "specialty": "Medicina General",
      "count": 8
    }
  ]
}
```

---

## 🩺 Patients Endpoints

### GET /patients
Listar pacientes del sistema.

**Roles permitidos:** `admin`, `doctor`

**Query Parameters:**
- `search` (opcional): Buscar por nombre o email
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Request:**
```
GET /patients?search=maria&page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "cm2xzy6e40003u2k6xyz",
      "user": {
        "id": "cm2xzy6e50004u2k6xyz",
        "email": "patient@test.com",
        "name": "María García",
        "role": "patient"
      },
      "birthDate": "1990-05-15T00:00:00.000Z",
      "address": "Calle Principal 123",
      "phone": "555-0123"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 👨‍⚕️ Doctors Endpoints

### GET /doctors
Listar doctores del sistema.

**Roles permitidos:** `admin`

**Query Parameters:**
- `specialty` (opcional): Filtrar por especialidad
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Request:**
```
GET /doctors?specialty=Cardiología&page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "cm2xzy6e30002u2k6xyz",
      "user": {
        "id": "cm2xzy6e20001u2k6t8p3l9jx",
        "email": "dr@test.com",
        "name": "Dr. Juan Pérez",
        "role": "doctor"
      },
      "specialty": "Medicina General",
      "licenseNumber": "12345"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 💊 Prescriptions Endpoints

### POST /prescriptions
Crear una nueva prescripción (solo Doctor).

**Roles permitidos:** `doctor`

**Request:**
```json
POST /prescriptions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "patientId": "cm2xzy6e40003u2k6xyz",
  "diagnosis": "Gripe común",
  "notes": "Tomar abundante líquido y reposo",
  "items": [
    {
      "medication": "Paracetamol 500mg",
      "dosage": "1 tableta cada 8 horas",
      "quantity": 20,
      "duration": "5 días"
    },
    {
      "medication": "Ibuprofeno 400mg",
      "dosage": "1 tableta cada 12 horas si hay dolor",
      "quantity": 10,
      "duration": "5 días"
    }
  ]
}
```

**Response 201:**
```json
{
  "id": "cm2xzy6e60005u2k6xyz",
  "code": "RX-AB12CD34EF",
  "patientId": "cm2xzy6e40003u2k6xyz",
  "authorId": "cm2xzy6e30002u2k6xyz",
  "diagnosis": "Gripe común",
  "notes": "Tomar abundante líquido y reposo",
  "status": "pending",
  "createdAt": "2025-10-31T12:00:00.000Z",
  "consumedAt": null,
  "items": [
    {
      "id": "cm2xzy6e70006u2k6xyz",
      "medication": "Paracetamol 500mg",
      "dosage": "1 tableta cada 8 horas",
      "quantity": 20,
      "duration": "5 días"
    }
  ]
}
```

---

### GET /prescriptions
Listar prescripciones del doctor autenticado.

**Roles permitidos:** `doctor`

**Query Parameters:**
- `mine` (opcional): `true` para ver solo las propias (default: true)
- `status` (opcional): `pending` | `consumed`
- `from` (opcional): Fecha inicial ISO
- `to` (opcional): Fecha final ISO
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Request:**
```
GET /prescriptions?status=pending&page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "cm2xzy6e60005u2k6xyz",
      "code": "RX-AB12CD34EF",
      "diagnosis": "Gripe común",
      "status": "pending",
      "createdAt": "2025-10-31T12:00:00.000Z",
      "patient": {
        "id": "cm2xzy6e40003u2k6xyz",
        "user": {
          "name": "María García",
          "email": "patient@test.com"
        }
      },
      "author": {
        "id": "cm2xzy6e30002u2k6xyz",
        "user": {
          "name": "Dr. Juan Pérez"
        }
      },
      "items": [
        {
          "medication": "Paracetamol 500mg",
          "dosage": "1 tableta cada 8 horas",
          "quantity": 20
        }
      ]
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /prescriptions/:id
Ver detalle de una prescripción específica.

**Roles permitidos:** `doctor`

**Request:**
```
GET /prescriptions/cm2xzy6e60005u2k6xyz
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "cm2xzy6e60005u2k6xyz",
  "code": "RX-AB12CD34EF",
  "patientId": "cm2xzy6e40003u2k6xyz",
  "authorId": "cm2xzy6e30002u2k6xyz",
  "diagnosis": "Gripe común",
  "notes": "Tomar abundante líquido y reposo",
  "status": "pending",
  "createdAt": "2025-10-31T12:00:00.000Z",
  "consumedAt": null,
  "patient": {
    "id": "cm2xzy6e40003u2k6xyz",
    "user": {
      "name": "María García",
      "email": "patient@test.com"
    },
    "birthDate": "1990-05-15T00:00:00.000Z"
  },
  "author": {
    "id": "cm2xzy6e30002u2k6xyz",
    "user": {
      "name": "Dr. Juan Pérez",
      "email": "dr@test.com"
    },
    "specialty": "Medicina General"
  },
  "items": [
    {
      "id": "cm2xzy6e70006u2k6xyz",
      "medication": "Paracetamol 500mg",
      "dosage": "1 tableta cada 8 horas",
      "quantity": 20,
      "duration": "5 días"
    }
  ]
}
```

---

### GET /prescriptions/me/prescriptions
Ver mis prescripciones como paciente.

**Roles permitidos:** `patient`

**Query Parameters:**
- `status` (opcional): `pending` | `consumed`
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Request:**
```
GET /prescriptions/me/prescriptions?status=pending
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "cm2xzy6e60005u2k6xyz",
      "code": "RX-AB12CD34EF",
      "diagnosis": "Gripe común",
      "notes": "Tomar abundante líquido y reposo",
      "status": "pending",
      "createdAt": "2025-10-31T12:00:00.000Z",
      "consumedAt": null,
      "author": {
        "user": {
          "name": "Dr. Juan Pérez"
        },
        "specialty": "Medicina General"
      },
      "items": [
        {
          "medication": "Paracetamol 500mg",
          "dosage": "1 tableta cada 8 horas",
          "quantity": 20,
          "duration": "5 días"
        }
      ]
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### PUT /prescriptions/:id/consume
Marcar una prescripción como consumida (solo Paciente).

**Roles permitidos:** `patient`

**Request:**
```
PUT /prescriptions/cm2xzy6e60005u2k6xyz/consume
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "id": "cm2xzy6e60005u2k6xyz",
  "code": "RX-AB12CD34EF",
  "status": "consumed",
  "consumedAt": "2025-10-31T14:30:00.000Z",
  "diagnosis": "Gripe común",
  "createdAt": "2025-10-31T12:00:00.000Z"
}
```

---

### GET /prescriptions/:id/pdf
Descargar prescripción en formato PDF.

**Roles permitidos:** `patient`

**Request:**
```
GET /prescriptions/cm2xzy6e60005u2k6xyz/pdf
Authorization: Bearer {accessToken}
```

**Response 200:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Prescripcion-RX-AB12CD34EF.pdf"`
- Body: PDF file (binary)

**Nota para el frontend:**
```javascript
// Ejemplo de descarga en JavaScript
const response = await fetch(`${API_URL}/prescriptions/${id}/pdf`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `Prescripcion-${code}.pdf`;
a.click();
```

---

### GET /prescriptions/admin/prescriptions
Ver todas las prescripciones del sistema (Admin).

**Roles permitidos:** `admin`

**Query Parameters:**
- `status` (opcional): `pending` | `consumed`
- `doctorId` (opcional): ID del doctor autor
- `patientId` (opcional): ID del paciente
- `from` (opcional): Fecha inicial ISO
- `to` (opcional): Fecha final ISO
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Request:**
```
GET /prescriptions/admin/prescriptions?status=pending&from=2025-10-01
Authorization: Bearer {accessToken}
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "cm2xzy6e60005u2k6xyz",
      "code": "RX-AB12CD34EF",
      "diagnosis": "Gripe común",
      "status": "pending",
      "createdAt": "2025-10-31T12:00:00.000Z",
      "patient": {
        "user": {
          "name": "María García",
          "email": "patient@test.com"
        }
      },
      "author": {
        "user": {
          "name": "Dr. Juan Pérez",
          "email": "dr@test.com"
        },
        "specialty": "Medicina General"
      },
      "items": [
        {
          "medication": "Paracetamol 500mg",
          "dosage": "1 tableta cada 8 horas"
        }
      ]
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## ❌ Códigos de Error Comunes

### 400 Bad Request
```json
{
  "message": [
    "email must be an email",
    "password should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "message": "Prescripción no encontrada",
  "error": "Not Found",
  "statusCode": 404
}
```

### 500 Internal Server Error
```json
{
  "message": "Error interno del servidor",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

---

## 🔒 Control de Acceso por Rol

| Endpoint | Admin | Doctor | Patient |
|----------|-------|--------|---------|
| POST /auth/login | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ |
| GET /auth/profile | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ |
| GET /users | ✅ | ❌ | ❌ |
| GET /admin/metrics | ✅ | ❌ | ❌ |
| GET /patients | ✅ | ✅ | ❌ |
| GET /doctors | ✅ | ❌ | ❌ |
| POST /prescriptions | ❌ | ✅ | ❌ |
| GET /prescriptions | ❌ | ✅ | ❌ |
| GET /prescriptions/:id | ❌ | ✅ | ❌ |
| GET /prescriptions/admin/prescriptions | ✅ | ❌ | ❌ |
| GET /prescriptions/me/prescriptions | ❌ | ❌ | ✅ |
| PUT /prescriptions/:id/consume | ❌ | ❌ | ✅ |
| GET /prescriptions/:id/pdf | ❌ | ❌ | ✅ |

---

## 💡 Notas Importantes para el Frontend

### 1. Gestión de Tokens
- Guarda el `accessToken` (localStorage/sessionStorage)
- Guarda el `refreshToken` de forma segura
- El `accessToken` expira en **15 minutos**
- El `refreshToken` expira en **7 días**
- Implementa refresh automático antes de que expire el access token

### 2. Interceptores HTTP
Recomendamos usar interceptores para:
- Agregar automáticamente el Bearer token a todas las requests
- Detectar errores 401 y ejecutar refresh token automáticamente
- Manejar errores 403 y redirigir al login

### 3. Logout
Al hacer logout:
- Llama al endpoint `POST /auth/logout`
- Elimina los tokens del localStorage
- Redirige al login

### 4. Descarga de PDFs
Para descargar PDFs usa `fetch` con `blob()` o `axios` con `responseType: 'blob'`

### 5. Paginación
Todos los endpoints con listados soportan paginación:
- `page`: número de página (comienza en 1)
- `limit`: cantidad de elementos por página
- Respuesta incluye `meta` con información de paginación

### 6. Filtros de Fecha
Los filtros de fecha deben estar en formato ISO:
- Ejemplo: `2025-10-31`
- Ejemplo completo: `2025-10-31T14:30:00.000Z`

### 7. CORS
El backend está configurado con CORS habilitado para desarrollo.

---

## 🧪 Usuarios de Prueba

### Admin
```
Email: admin@test.com
Password: admin123
```

### Doctor
```
Email: dr@test.com
Password: dr123
```

### Patient
```
Email: patient@test.com
Password: patient123
```

---

## 🚀 Ejemplo Completo de Flujo

### 1. Login
```javascript
const loginResponse = await fetch('http://localhost:4001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dr@test.com',
    password: 'dr123'
  })
});

const { accessToken, user } = await loginResponse.json();
localStorage.setItem('accessToken', accessToken);
```

### 2. Crear Prescripción (Doctor)
```javascript
const prescription = await fetch('http://localhost:4001/prescriptions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  },
  body: JSON.stringify({
    patientId: 'cm2xzy6e40003u2k6xyz',
    diagnosis: 'Gripe común',
    items: [
      {
        medication: 'Paracetamol 500mg',
        dosage: '1 tableta cada 8 horas',
        quantity: 20,
        duration: '5 días'
      }
    ]
  })
});
```

### 3. Ver Mis Prescripciones (Patient)
```javascript
const myPrescriptions = await fetch(
  'http://localhost:4001/prescriptions/me/prescriptions?status=pending',
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  }
);

const { data, meta } = await myPrescriptions.json();
```

### 4. Descargar PDF
```javascript
const response = await fetch(
  `http://localhost:4001/prescriptions/${prescriptionId}/pdf`,
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `Prescripcion-${code}.pdf`;
a.click();
```

---

## 📞 Soporte

Para más información o dudas sobre la API, consulta los archivos de documentación en el repositorio:
- `AUTH_TESTING.md` - Testing de autenticación
- `ADMIN_ENDPOINTS.md` - Endpoints de admin
- `PRESCRIPTIONS_ENDPOINTS.md` - Endpoints de prescripciones
- `ADMIN_METRICS.md` - Métricas del sistema

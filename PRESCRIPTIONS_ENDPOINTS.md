# 💊 Endpoints de Prescripciones (Solo Doctor)

## 🔐 Requisitos
Todos los endpoints de prescripciones requieren:
- **Rol:** `doctor` únicamente
- **Header:** `Authorization: Bearer {accessToken}`

---

## 📍 Endpoints

### 1️⃣ Crear Prescripción

```http
POST /prescriptions
```

**Descripción:** Crear una nueva prescripción médica con sus items.

**Acceso:** Solo `doctor`

**Headers:**
```
Authorization: Bearer {doctor-token}
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": "clxxx",
  "notes": "Tratamiento para infección respiratoria",
  "items": [
    {
      "name": "Amoxicilina 500mg",
      "dosage": "1 c/8h",
      "quantity": 15,
      "instructions": "Después de comer"
    },
    {
      "name": "Ibuprofeno 400mg",
      "dosage": "1 c/12h",
      "quantity": 10,
      "instructions": "En caso de dolor"
    }
  ]
}
```

**Validaciones:**
- `patientId` - Requerido, debe existir en la base de datos
- `notes` - Opcional
- `items` - Requerido, array con al menos 1 item
  - `name` - Requerido
  - `dosage` - Opcional
  - `quantity` - Opcional
  - `instructions` - Opcional

**Respuesta exitosa (201):**
```json
{
  "id": "clxxx",
  "code": "RX-A1B2C3D4E5",
  "status": "pending",
  "notes": "Tratamiento para infección respiratoria",
  "createdAt": "2025-10-31T09:00:00.000Z",
  "consumedAt": null,
  "patientId": "clyyy",
  "authorId": "clzzz",
  "items": [
    {
      "id": "clwww",
      "name": "Amoxicilina 500mg",
      "dosage": "1 c/8h",
      "quantity": 15,
      "instructions": "Después de comer",
      "prescriptionId": "clxxx"
    },
    {
      "id": "clvvv",
      "name": "Ibuprofeno 400mg",
      "dosage": "1 c/12h",
      "quantity": 10,
      "instructions": "En caso de dolor",
      "prescriptionId": "clxxx"
    }
  ],
  "patient": {
    "id": "clyyy",
    "user": {
      "name": "María García",
      "email": "patient@test.com"
    }
  },
  "author": {
    "id": "clzzz",
    "specialty": "Medicina General",
    "user": {
      "name": "Dr. Juan Pérez",
      "email": "dr@test.com"
    }
  }
}
```

**Errores posibles:**
- `400 Bad Request` - Datos inválidos en el body
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No tienes rol de doctor
- `404 Not Found` - Paciente no encontrado
- `500 Internal Server Error` - Error del servidor

---

### 2️⃣ Obtener Prescripciones con Filtros

```http
GET /prescriptions?mine=true&status=pending&from=2025-01-01&to=2025-12-31&page=1&limit=10&order=desc
```

**Descripción:** Obtener lista de prescripciones con filtros opcionales.

**Acceso:** Solo `doctor`

**Query Parameters (opcionales):**
- `mine` - Filtrar solo mis prescripciones (`true` o `false`)
- `status` - Filtrar por estado: `pending` o `consumed`
- `from` - Fecha desde (ISO 8601: `2025-01-01`)
- `to` - Fecha hasta (ISO 8601: `2025-12-31`)
- `page` - Número de página (default: 1)
- `limit` - Cantidad de resultados por página (default: 10)
- `order` - Orden por fecha: `asc` o `desc` (default: `desc`)

**Headers:**
```
Authorization: Bearer {doctor-token}
```

**Ejemplos de uso:**

#### Ver todas las prescripciones
```http
GET /prescriptions
```

#### Ver solo mis prescripciones
```http
GET /prescriptions?mine=true
```

#### Filtrar por estado
```http
GET /prescriptions?mine=true&status=pending
```

#### Filtrar por rango de fechas
```http
GET /prescriptions?from=2025-10-01&to=2025-10-31
```

#### Combinación de filtros
```http
GET /prescriptions?mine=true&status=consumed&page=1&limit=5&order=asc
```

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "clxxx",
      "code": "RX-A1B2C3D4E5",
      "status": "pending",
      "notes": "Tratamiento para infección respiratoria",
      "createdAt": "2025-10-31T09:00:00.000Z",
      "consumedAt": null,
      "patientId": "clyyy",
      "authorId": "clzzz",
      "items": [
        {
          "id": "clwww",
          "name": "Amoxicilina 500mg",
          "dosage": "1 c/8h",
          "quantity": 15,
          "instructions": "Después de comer",
          "prescriptionId": "clxxx"
        }
      ],
      "patient": {
        "id": "clyyy",
        "user": {
          "name": "María García",
          "email": "patient@test.com"
        }
      },
      "author": {
        "id": "clzzz",
        "specialty": "Medicina General",
        "user": {
          "name": "Dr. Juan Pérez",
          "email": "dr@test.com"
        }
      }
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No tienes rol de doctor
- `500 Internal Server Error` - Error del servidor

---

### 3️⃣ Obtener Prescripción por ID

```http
GET /prescriptions/:id
```

**Descripción:** Obtener detalles completos de una prescripción específica.

**Acceso:** Solo `doctor`

**Headers:**
```
Authorization: Bearer {doctor-token}
```

**Ejemplo:**
```http
GET /prescriptions/clxxx
Authorization: Bearer {doctor-token}
```

**Respuesta exitosa (200):**
```json
{
  "id": "clxxx",
  "code": "RX-A1B2C3D4E5",
  "status": "pending",
  "notes": "Tratamiento para infección respiratoria",
  "createdAt": "2025-10-31T09:00:00.000Z",
  "consumedAt": null,
  "patientId": "clyyy",
  "authorId": "clzzz",
  "items": [
    {
      "id": "clwww",
      "name": "Amoxicilina 500mg",
      "dosage": "1 c/8h",
      "quantity": 15,
      "instructions": "Después de comer",
      "prescriptionId": "clxxx"
    },
    {
      "id": "clvvv",
      "name": "Ibuprofeno 400mg",
      "dosage": "1 c/12h",
      "quantity": 10,
      "instructions": "En caso de dolor",
      "prescriptionId": "clxxx"
    }
  ],
  "patient": {
    "id": "clyyy",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "user": {
      "name": "María García",
      "email": "patient@test.com"
    }
  },
  "author": {
    "id": "clzzz",
    "specialty": "Medicina General",
    "user": {
      "name": "Dr. Juan Pérez",
      "email": "dr@test.com"
    }
  }
}
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No tienes rol de doctor
- `404 Not Found` - Prescripción no encontrada
- `500 Internal Server Error` - Error del servidor

---

## 🧪 Ejemplos de Testing Completo

### Flujo 1: Crear y Consultar Prescripción

#### Paso 1: Login como Doctor
```bash
POST http://localhost:4001/auth/login
Content-Type: application/json

{
  "email": "dr@test.com",
  "password": "dr123"
}
```

#### Paso 2: Crear Prescripción
```bash
POST http://localhost:4001/prescriptions
Authorization: Bearer {doctor-token}
Content-Type: application/json

{
  "patientId": "clxxx",
  "notes": "Tratamiento para gripe",
  "items": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "1 c/6h",
      "quantity": 20,
      "instructions": "Tomar con agua"
    }
  ]
}
```

#### Paso 3: Ver Mis Prescripciones
```bash
GET http://localhost:4001/prescriptions?mine=true
Authorization: Bearer {doctor-token}
```

#### Paso 4: Ver Detalles de una Prescripción
```bash
GET http://localhost:4001/prescriptions/{id}
Authorization: Bearer {doctor-token}
```

---

### Flujo 2: Filtrar Prescripciones Pendientes

```bash
# Ver solo prescripciones pendientes que yo creé
GET http://localhost:4001/prescriptions?mine=true&status=pending
Authorization: Bearer {doctor-token}

# Ver prescripciones del mes actual
GET http://localhost:4001/prescriptions?from=2025-10-01&to=2025-10-31
Authorization: Bearer {doctor-token}

# Ver prescripciones más antiguas primero
GET http://localhost:4001/prescriptions?mine=true&order=asc
Authorization: Bearer {doctor-token}
```

---

## 🔒 Control de Acceso

| Endpoint | Admin | Doctor | Patient |
|----------|-------|--------|---------|
| POST /prescriptions | ❌ | ✅ | ❌ |
| GET /prescriptions | ❌ | ✅ | ❌ |
| GET /prescriptions/:id | ❌ | ✅ | ❌ |

### Notas de Seguridad:
- **Solo doctores** pueden crear y ver prescripciones
- El sistema genera automáticamente un **código único** (formato: `RX-XXXXXXXXXX`)
- El `authorId` se obtiene automáticamente del token JWT del doctor
- Se valida que el paciente exista antes de crear la prescripción
- Todas las rutas requieren autenticación JWT válida

---

## 📊 Estructura de Datos

### Prescription:
```typescript
{
  id: string;           // ID único generado
  code: string;         // Código único (RX-XXXXXXXXXX)
  status: 'pending' | 'consumed';
  notes?: string;       // Notas opcionales del doctor
  createdAt: Date;
  consumedAt?: Date;    // Fecha cuando se consumió
  patientId: string;
  authorId: string;
  items: PrescriptionItem[];
  patient: {...};
  author: {...};
}
```

### PrescriptionItem:
```typescript
{
  id: string;
  name: string;         // Nombre del medicamento
  dosage?: string;      // Ej: "1 c/8h"
  quantity?: number;    // Unidades
  instructions?: string; // Instrucciones adicionales
  prescriptionId: string;
}
```

---

## 💡 Tips de Uso

### Para el Frontend:
1. **Código único:** El campo `code` es ideal para mostrar al paciente o generar QR
2. **Filtro mine=true:** Usa esto para que cada doctor vea solo sus prescripciones
3. **Estado pending:** Las prescripciones nuevas siempre inician en `pending`
4. **Paginación:** Implementa scroll infinito o botones de página usando `meta`

### Validaciones:
- ✅ El `patientId` debe ser un ID válido de un paciente existente
- ✅ El array `items` debe tener al menos 1 medicamento
- ✅ Solo doctores autenticados pueden crear prescripciones
- ✅ El doctor se asigna automáticamente como autor

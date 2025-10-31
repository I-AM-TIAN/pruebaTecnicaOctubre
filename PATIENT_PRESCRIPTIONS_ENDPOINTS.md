# 👤 Endpoints de Prescripciones para Paciente

## 🔐 Requisitos
Todos los endpoints de paciente requieren:
- **Rol:** `patient` únicamente
- **Header:** `Authorization: Bearer {accessToken}`

---

## 📍 Endpoints

### 1️⃣ Ver Mis Prescripciones

```http
GET /prescriptions/me/prescriptions?status=pending&page=1&limit=10
```

**Descripción:** Obtener todas las prescripciones asignadas al paciente autenticado.

**Acceso:** Solo `patient`

**Query Parameters (opcionales):**
- `status` - Filtrar por estado: `pending` o `consumed`
- `page` - Número de página (default: 1)
- `limit` - Cantidad de resultados por página (default: 10)

**Headers:**
```
Authorization: Bearer {patient-token}
```

**Ejemplos de uso:**

#### Ver todas mis prescripciones
```http
GET /prescriptions/me/prescriptions
Authorization: Bearer {patient-token}
```

#### Ver solo prescripciones pendientes
```http
GET /prescriptions/me/prescriptions?status=pending
Authorization: Bearer {patient-token}
```

#### Ver prescripciones consumidas
```http
GET /prescriptions/me/prescriptions?status=consumed
Authorization: Bearer {patient-token}
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
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No tienes rol de paciente
- `500 Internal Server Error` - Error del servidor

---

### 2️⃣ Marcar Prescripción como Consumida

```http
PUT /prescriptions/:id/consume
```

**Descripción:** Marcar una prescripción como consumida (solo si pertenece al paciente).

**Acceso:** Solo `patient` y debe ser el dueño de la prescripción

**Headers:**
```
Authorization: Bearer {patient-token}
```

**Ejemplo:**
```http
PUT /prescriptions/clxxx/consume
Authorization: Bearer {patient-token}
```

**Sin body necesario**

**Respuesta exitosa (200):**
```json
{
  "id": "clxxx",
  "code": "RX-A1B2C3D4E5",
  "status": "consumed",
  "notes": "Tratamiento para infección respiratoria",
  "createdAt": "2025-10-31T09:00:00.000Z",
  "consumedAt": "2025-10-31T10:30:00.000Z",
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
- `403 Forbidden` - No es tu prescripción o ya fue consumida
- `404 Not Found` - Prescripción no encontrada
- `500 Internal Server Error` - Error del servidor

---

### 3️⃣ Obtener Prescripción para PDF

```http
GET /prescriptions/:id/pdf
```

**Descripción:** Obtener detalles completos de una prescripción para generar PDF (solo si pertenece al paciente).

**Acceso:** Solo `patient` y debe ser el dueño de la prescripción

**Headers:**
```
Authorization: Bearer {patient-token}
```

**Ejemplo:**
```http
GET /prescriptions/clxxx/pdf
Authorization: Bearer {patient-token}
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

**Nota:** Este endpoint devuelve información completa incluyendo datos del paciente para ser usada en la generación del PDF en el frontend.

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No es tu prescripción
- `404 Not Found` - Prescripción no encontrada
- `500 Internal Server Error` - Error del servidor

---

## 🧪 Ejemplos de Testing Completo

### Flujo 1: Login y Ver Prescripciones

#### Paso 1: Login como Paciente
```bash
POST http://localhost:4001/auth/login
Content-Type: application/json

{
  "email": "patient@test.com",
  "password": "patient123"
}
```

#### Paso 2: Ver Mis Prescripciones
```bash
GET http://localhost:4001/prescriptions/me/prescriptions
Authorization: Bearer {patient-token}
```

#### Paso 3: Filtrar Solo Pendientes
```bash
GET http://localhost:4001/prescriptions/me/prescriptions?status=pending
Authorization: Bearer {patient-token}
```

---

### Flujo 2: Consumir una Prescripción

#### Paso 1: Ver Prescripciones Pendientes
```bash
GET http://localhost:4001/prescriptions/me/prescriptions?status=pending
Authorization: Bearer {patient-token}
```

#### Paso 2: Marcar como Consumida
```bash
PUT http://localhost:4001/prescriptions/{id}/consume
Authorization: Bearer {patient-token}
```

#### Paso 3: Verificar que ya está Consumida
```bash
GET http://localhost:4001/prescriptions/me/prescriptions?status=consumed
Authorization: Bearer {patient-token}
```

---

### Flujo 3: Descargar PDF de Prescripción

#### Paso 1: Ver Mis Prescripciones
```bash
GET http://localhost:4001/prescriptions/me/prescriptions
Authorization: Bearer {patient-token}
```

#### Paso 2: Obtener Detalles para PDF
```bash
GET http://localhost:4001/prescriptions/{id}/pdf
Authorization: Bearer {patient-token}
```

**Frontend:** Con los datos recibidos, puedes generar un PDF usando librerías como:
- `jsPDF`
- `pdfmake`
- `react-pdf`

---

## 🔒 Control de Acceso y Seguridad

### Validaciones Implementadas:

1. **Ver prescripciones:**
   - ✅ Solo el paciente autenticado puede ver sus propias prescripciones
   - ✅ No puede ver prescripciones de otros pacientes

2. **Consumir prescripción:**
   - ✅ Solo el dueño de la prescripción puede marcarla como consumida
   - ✅ No se puede consumir una prescripción ya consumida
   - ✅ No se puede consumir una prescripción de otro paciente

3. **Ver PDF:**
   - ✅ Solo el dueño puede ver los detalles para PDF
   - ✅ Incluye toda la información necesaria para generar el documento

### Tabla de Permisos:

| Endpoint | Admin | Doctor | Patient |
|----------|-------|--------|---------|
| GET /prescriptions/me/prescriptions | ❌ | ❌ | ✅ |
| PUT /prescriptions/:id/consume | ❌ | ❌ | ✅ (solo suya) |
| GET /prescriptions/:id/pdf | ❌ | ❌ | ✅ (solo suya) |

---

## 📊 Estados de Prescripción

### Pending (Pendiente)
- Estado inicial cuando el doctor crea la prescripción
- El paciente puede consumirla
- `consumedAt` es `null`

### Consumed (Consumida)
- Estado después de que el paciente marca como consumida
- No se puede volver a consumir
- `consumedAt` tiene la fecha de consumo

---

## 💡 Tips de Implementación

### Para el Frontend:

1. **Listar prescripciones:**
   - Muestra badge con el estado (pending/consumed)
   - Usa colores: verde para pending, gris para consumed
   - Muestra la fecha de creación y consumo

2. **Botón "Consumir":**
   - Solo visible si `status === 'pending'`
   - Confirmación antes de consumir: "¿Seguro que quieres marcar como consumida?"
   - Actualiza la lista después de consumir

3. **Generar PDF:**
   - Botón "Descargar PDF" disponible para todas las prescripciones
   - Incluye código QR del campo `code`
   - Diseño profesional con logo, datos del doctor y paciente
   - Lista de medicamentos con instrucciones

4. **Paginación:**
   - Usa `meta.totalPages` para mostrar navegación
   - Implementa scroll infinito o botones de página

### Ejemplo de UI:

```
┌─────────────────────────────────────────┐
│ Mis Prescripciones                      │
├─────────────────────────────────────────┤
│ 📋 RX-A1B2C3D4E5         [PENDIENTE]   │
│ Dr. Juan Pérez                          │
│ 31/10/2025                              │
│ • Amoxicilina 500mg (1 c/8h)           │
│ • Ibuprofeno 400mg (1 c/12h)           │
│ [Ver PDF] [Marcar Consumida]           │
├─────────────────────────────────────────┤
│ 📋 RX-B2C3D4E5F6         [CONSUMIDA]   │
│ Dra. Ana López                          │
│ 25/10/2025 - Consumida: 28/10/2025     │
│ • Paracetamol 500mg (1 c/8h)           │
│ [Ver PDF]                               │
└─────────────────────────────────────────┘
```

---

## 🔄 Diferencias entre Rutas de Doctor y Paciente

| Funcionalidad | Doctor | Paciente |
|---------------|--------|----------|
| Crear prescripción | ✅ POST /prescriptions | ❌ |
| Ver todas las prescripciones | ✅ GET /prescriptions | ❌ |
| Ver solo mis prescripciones | ✅ GET /prescriptions?mine=true | ✅ GET /prescriptions/me/prescriptions |
| Ver por ID | ✅ GET /prescriptions/:id | ❌ |
| Consumir prescripción | ❌ | ✅ PUT /prescriptions/:id/consume |
| Ver para PDF | ❌ | ✅ GET /prescriptions/:id/pdf |

---

## 📝 Notas Adicionales

- El paciente **solo puede ver y consumir sus propias prescripciones**
- Una prescripción consumida **no puede volver a estado pending**
- El endpoint `/pdf` es para que el frontend genere el PDF, no devuelve un archivo PDF
- Todas las respuestas incluyen información del doctor que creó la prescripción

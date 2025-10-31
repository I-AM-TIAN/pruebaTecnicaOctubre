# 👥 Endpoints de Pacientes y Doctores

## 📋 Tabla de Contenidos
- [Pacientes](#-pacientes)
- [Doctores](#-doctores)

---

## 🏥 Pacientes

### GET /patients

**Descripción:** Obtener lista de pacientes con paginación y búsqueda.

**Acceso:** `Admin` y `Doctor`

**Query Parameters (opcionales):**
- `page` - Número de página (default: 1)
- `limit` - Cantidad de resultados por página (default: 10)
- `search` - Buscar por nombre o email (case-insensitive)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Ejemplo de Request:**
```http
GET /patients?page=1&limit=10&search=maria
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "clxxx",
      "email": "patient@test.com",
      "name": "María García",
      "createdAt": "2025-10-31T00:00:00.000Z",
      "patient": {
        "id": "clyyy",
        "birthDate": "1990-05-15T00:00:00.000Z",
        "_count": {
          "prescriptions": 5
        }
      }
    },
    {
      "id": "clzzz",
      "email": "patient2@test.com",
      "name": "Juan Martínez",
      "createdAt": "2025-10-30T00:00:00.000Z",
      "patient": {
        "id": "clwww",
        "birthDate": "1985-08-20T00:00:00.000Z",
        "_count": {
          "prescriptions": 3
        }
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No tienes rol de admin o doctor
- `500 Internal Server Error` - Error del servidor

---

## 🩺 Doctores

### GET /doctors

**Descripción:** Obtener lista de doctores con paginación, búsqueda y filtro por especialidad.

**Acceso:** `Admin` únicamente

**Query Parameters (opcionales):**
- `page` - Número de página (default: 1)
- `limit` - Cantidad de resultados por página (default: 10)
- `search` - Buscar por nombre o email (case-insensitive)
- `specialty` - Filtrar por especialidad (case-insensitive)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Ejemplo de Request:**
```http
GET /doctors?page=1&limit=10&search=juan&specialty=cardiologia
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "clxxx",
      "email": "dr@test.com",
      "name": "Dr. Juan Pérez",
      "createdAt": "2025-10-31T00:00:00.000Z",
      "doctor": {
        "id": "clyyy",
        "specialty": "Cardiología",
        "_count": {
          "prescriptions": 12
        }
      }
    },
    {
      "id": "clzzz",
      "email": "dr2@test.com",
      "name": "Dra. Ana López",
      "createdAt": "2025-10-30T00:00:00.000Z",
      "doctor": {
        "id": "clwww",
        "specialty": "Medicina General",
        "_count": {
          "prescriptions": 8
        }
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Errores posibles:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No tienes rol de admin
- `500 Internal Server Error` - Error del servidor

---

## 🧪 Ejemplos de Testing

### Testing Pacientes

#### 1. Obtener todos los pacientes (como Admin)
```bash
GET http://localhost:4001/patients
Authorization: Bearer {admin-token}
```

#### 2. Obtener todos los pacientes (como Doctor)
```bash
GET http://localhost:4001/patients
Authorization: Bearer {doctor-token}
```

#### 3. Buscar paciente por nombre
```bash
GET http://localhost:4001/patients?search=maria
Authorization: Bearer {admin-token}
```

#### 4. Paginación de pacientes
```bash
GET http://localhost:4001/patients?page=1&limit=5
Authorization: Bearer {doctor-token}
```

---

### Testing Doctores

#### 1. Obtener todos los doctores
```bash
GET http://localhost:4001/doctors
Authorization: Bearer {admin-token}
```

#### 2. Buscar doctor por nombre
```bash
GET http://localhost:4001/doctors?search=juan
Authorization: Bearer {admin-token}
```

#### 3. Filtrar por especialidad
```bash
GET http://localhost:4001/doctors?specialty=cardiologia
Authorization: Bearer {admin-token}
```

#### 4. Combinación de filtros
```bash
GET http://localhost:4001/doctors?search=dr&specialty=medicina&page=1&limit=5
Authorization: Bearer {admin-token}
```

---

## 🔒 Control de Acceso

| Endpoint | Admin | Doctor | Patient |
|----------|-------|--------|---------|
| GET /patients | ✅ | ✅ | ❌ |
| GET /doctors | ✅ | ❌ | ❌ |

### Notas de Seguridad:
- **Pacientes:** Los doctores pueden ver la lista de pacientes para asignarles recetas
- **Doctores:** Solo los admins pueden ver la lista de doctores
- Todos los endpoints requieren autenticación JWT válida
- Se valida que la sesión no esté en blacklist (logout)

---

## 📊 Datos Incluidos

### Paciente:
- ✅ Información básica del usuario (id, email, name, createdAt)
- ✅ Fecha de nacimiento
- ✅ Contador de prescripciones asignadas

### Doctor:
- ✅ Información básica del usuario (id, email, name, createdAt)
- ✅ Especialidad médica
- ✅ Contador de prescripciones creadas

---

## 💡 Tips de Uso

### Para Pacientes:
1. **Búsqueda rápida:** Usa el parámetro `search` para encontrar pacientes por nombre o email
2. **Paginación:** Ideal para manejar grandes cantidades de pacientes
3. **Contador de recetas:** El `_count.prescriptions` te indica cuántas recetas tiene cada paciente

### Para Doctores:
1. **Filtro por especialidad:** Útil para encontrar doctores específicos
2. **Búsqueda combinada:** Puedes combinar `search` y `specialty` para resultados más precisos
3. **Estadísticas:** El `_count.prescriptions` muestra la productividad de cada doctor

---

## 🔄 Próximos Pasos

Ahora que tienes los endpoints de usuarios, pacientes y doctores, podrías necesitar:
1. **Endpoints de Prescriptions** - CRUD completo de recetas médicas
2. **Endpoints específicos de Doctor** - Ver solo mis recetas
3. **Endpoints específicos de Paciente** - Ver solo mis recetas

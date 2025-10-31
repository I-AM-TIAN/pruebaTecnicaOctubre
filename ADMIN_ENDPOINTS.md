# 📋 Endpoints de Administración de Usuarios

## 🔐 Requisitos
Todos los endpoints de admin requieren:
- **Rol:** `admin`
- **Header:** `Authorization: Bearer {accessToken}`

---

## 📍 Endpoints

### 1️⃣ Obtener Usuarios (con filtros y paginación)

```http
GET /users?role=doctor&page=1&limit=10
```

**Query Parameters (opcionales):**
- `role` - Filtrar por rol: `admin`, `doctor`, o `patient`
- `page` - Número de página (default: 1)
- `limit` - Cantidad de resultados por página (default: 10)

**Headers:**
```
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
      "role": "doctor",
      "createdAt": "2025-10-31T00:00:00.000Z",
      "doctor": {
        "id": "clyyy",
        "specialty": "Medicina General"
      },
      "patient": null
    },
    {
      "id": "clzzz",
      "email": "patient@test.com",
      "name": "María García",
      "role": "patient",
      "createdAt": "2025-10-31T00:00:00.000Z",
      "doctor": null,
      "patient": {
        "id": "clwww",
        "birthDate": "1990-05-15T00:00:00.000Z"
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
- `403 Forbidden` - No tienes rol de admin
- `500 Internal Server Error` - Error del servidor

---

## 🧪 Ejemplos de Testing

### Ejemplo 1: Obtener todos los usuarios
```bash
GET http://localhost:4001/users
Authorization: Bearer {admin-token}
```

### Ejemplo 2: Filtrar solo doctores
```bash
GET http://localhost:4001/users?role=doctor
Authorization: Bearer {admin-token}
```

### Ejemplo 3: Filtrar solo pacientes con paginación
```bash
GET http://localhost:4001/users?role=patient&page=1&limit=5
Authorization: Bearer {admin-token}
```

### Ejemplo 4: Segunda página de resultados
```bash
GET http://localhost:4001/users?page=2&limit=3
Authorization: Bearer {admin-token}
```

---

## 📝 Notas

### Estructura de Usuario según Rol:

**Admin:**
```json
{
  "id": "xxx",
  "email": "admin@test.com",
  "name": "Admin",
  "role": "admin",
  "createdAt": "2025-10-31T00:00:00.000Z",
  "doctor": null,
  "patient": null
}
```

**Doctor:**
```json
{
  "id": "xxx",
  "email": "doctor@test.com",
  "name": "Dr. Juan",
  "role": "doctor",
  "createdAt": "2025-10-31T00:00:00.000Z",
  "doctor": {
    "id": "yyy",
    "specialty": "Cardiología"
  },
  "patient": null
}
```

**Patient:**
```json
{
  "id": "xxx",
  "email": "patient@test.com",
  "name": "María",
  "role": "patient",
  "createdAt": "2025-10-31T00:00:00.000Z",
  "doctor": null,
  "patient": {
    "id": "yyy",
    "birthDate": "1990-05-15T00:00:00.000Z"
  }
}
```

---

## 🔒 Seguridad

- ✅ Solo usuarios con rol `admin` pueden acceder
- ✅ Se valida el JWT en cada request
- ✅ Se verifica que la sesión no esté en blacklist
- ✅ No se expone la contraseña en las respuestas

---

## 💡 Tips

1. **Paginación:** Usa `page` y `limit` para manejar grandes cantidades de datos
2. **Filtrado:** Usa `role` para obtener solo el tipo de usuario que necesitas
3. **Metadata:** El objeto `meta` te da información útil para implementar paginación en el frontend

# Admin Metrics Endpoint

## Endpoint de Métricas del Sistema

Este documento describe el endpoint de métricas disponible para el rol de **Admin**.

---

## 📊 GET /admin/metrics

Obtiene estadísticas y métricas del sistema, incluyendo:
- **Totales**: Cantidad de doctores, pacientes y prescripciones
- **Por Estado**: Prescripciones pendientes vs consumidas
- **Por Día**: Tendencia de creación de prescripciones por fecha
- **Top Doctores**: Doctores con más prescripciones creadas

### Autenticación
- **Requerida**: Sí (Bearer Token)
- **Rol permitido**: `admin`

### Query Parameters

| Parámetro | Tipo     | Requerido | Descripción                                    |
|-----------|----------|-----------|------------------------------------------------|
| `from`    | `string` | No        | Fecha inicial en formato ISO (ej: 2025-01-01) |
| `to`      | `string` | No        | Fecha final en formato ISO (ej: 2025-01-31)   |

**Nota**: Si no se proporcionan fechas, se incluyen todas las prescripciones históricas.

### Respuesta Exitosa (200)

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
    },
    {
      "date": "2025-10-20",
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

## 🔧 Ejemplos de Uso

### 1. Obtener Todas las Métricas (Sin Filtro)

```bash
curl -X GET http://localhost:4001/admin/metrics \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Respuesta**: Incluye todos los doctores, pacientes y prescripciones del sistema.

---

### 2. Filtrar Métricas por Rango de Fechas

```bash
curl -X GET "http://localhost:4001/admin/metrics?from=2025-10-01&to=2025-10-31" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Respuesta**: Solo incluye prescripciones creadas entre el 1 y el 31 de octubre de 2025.

---

### 3. Filtrar Solo desde una Fecha

```bash
curl -X GET "http://localhost:4001/admin/metrics?from=2025-10-15" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Respuesta**: Incluye prescripciones desde el 15 de octubre de 2025 en adelante.

---

### 4. Filtrar Solo hasta una Fecha

```bash
curl -X GET "http://localhost:4001/admin/metrics?to=2025-10-15" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Respuesta**: Incluye prescripciones hasta el 15 de octubre de 2025.

---

## 📋 Estructura de la Respuesta

### `totals`
Contadores generales del sistema:
- `doctors`: Total de doctores registrados
- `patients`: Total de pacientes registrados
- `prescriptions`: Total de prescripciones (filtrado por fechas si aplica)

### `byStatus`
Distribución de prescripciones por estado:
- `pending`: Prescripciones aún no consumidas
- `consumed`: Prescripciones ya consumidas

### `byDay`
Array con la cantidad de prescripciones creadas por día:
- `date`: Fecha en formato YYYY-MM-DD
- `count`: Cantidad de prescripciones creadas ese día

**Nota**: Los días sin prescripciones no aparecen en el array.

### `topDoctors`
Array con los 10 doctores que más prescripciones han creado:
- `doctorId`: ID del doctor
- `doctorName`: Nombre completo del doctor
- `specialty`: Especialidad médica
- `count`: Cantidad de prescripciones creadas

**Orden**: Descendente por cantidad de prescripciones.

---

## ❌ Errores Posibles

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```
**Causa**: Token no proporcionado o inválido.

### 403 Forbidden
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```
**Causa**: El usuario no tiene rol de `admin`.

### 500 Internal Server Error
```json
{
  "message": "Error al obtener métricas",
  "error": "Internal Server Error",
  "statusCode": 500
}
```
**Causa**: Error en el servidor (ver logs para más detalles).

---

## 🧪 Testing con Postman/Thunder Client

### Paso 1: Login como Admin
```http
POST http://localhost:4001/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

Guarda el `accessToken` de la respuesta.

### Paso 2: Obtener Métricas
```http
GET http://localhost:4001/admin/metrics
Authorization: Bearer {accessToken}
```

o con filtros:

```http
GET http://localhost:4001/admin/metrics?from=2025-10-01&to=2025-10-31
Authorization: Bearer {accessToken}
```

---

## 💡 Casos de Uso

1. **Dashboard de Administración**
   - Mostrar estadísticas generales del sistema
   - Visualizar tendencias de uso

2. **Análisis de Desempeño**
   - Identificar doctores más activos
   - Analizar patrones de uso por periodo

3. **Reportes Mensuales**
   - Filtrar por mes específico
   - Generar reportes de actividad

4. **Monitoreo en Tiempo Real**
   - Consultar métricas sin filtros para ver estado actual
   - Detectar anomalías en la creación de prescripciones

---

## 🔐 Seguridad

- Solo accesible con token JWT válido
- Solo usuarios con rol `admin` pueden acceder
- Los filtros de fecha son opcionales pero validados por Prisma
- No se exponen datos sensibles de pacientes en las métricas

---

## 📝 Notas Técnicas

- El conteo de doctores y pacientes NO se ve afectado por los filtros de fecha
- Solo el conteo de prescripciones y sus agrupaciones respetan el rango de fechas
- Los días en `byDay` están ordenados de forma ascendente (más antiguo → más reciente)
- Los `topDoctors` están ordenados de forma descendente (más prescripciones → menos)
- El límite de top doctors es 10 (configurable en el código)
- Las fechas en `byDay` están normalizadas (sin hora, solo YYYY-MM-DD)

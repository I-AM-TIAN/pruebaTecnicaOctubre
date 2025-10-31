# Auth Module - Testing Endpoints

## Base URL
```
http://localhost:4001
```

## 1. Login
**POST** `/auth/login`

```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@test.com",
    "name": "Administrador Principal",
    "role": "admin",
    "createdAt": "...",
    "doctor": null,
    "patient": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 2. Refresh Token
**POST** `/auth/refresh`

Headers:
```
Authorization: Bearer <accessToken>
```

Body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 3. Get Profile (Protected Route)
**GET** `/auth/profile`

Headers:
```
Authorization: Bearer <accessToken>
```

## 4. Validate Token
**GET** `/auth/validate`

Headers:
```
Authorization: Bearer <accessToken>
```

## 5. Logout (Cerrar Sesión)
**POST** `/auth/logout`

Headers:
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "message": "Sesión cerrada exitosamente",
  "success": true
}
```

**Nota:** Después del logout, el cliente debe eliminar los tokens del almacenamiento local.

---

## Test Users

### Admin
- Email: `admin@test.com`
- Password: `admin123`

### Doctor
- Email: `dr@test.com`
- Password: `dr123`

### Patient
- Email: `patient@test.com`
- Password: `patient123`

---

## Using RBAC Guards in Controllers

### Example: Only Admin can access
```typescript
@Get('admin-only')
@Auth(Role.admin)
getAdminData(@GetUser() user: any) {
  return { message: 'Admin data', user };
}
```

### Example: Admin or Doctor can access
```typescript
@Get('medical-staff')
@Auth(Role.admin, Role.doctor)
getMedicalData(@GetUser() user: any) {
  return { message: 'Medical staff data', user };
}
```

### Example: Any authenticated user
```typescript
@Get('protected')
@UseGuards(AuthGuard('jwt'))
getProtectedData(@GetUser() user: any) {
  return { message: 'Protected data', user };
}
```

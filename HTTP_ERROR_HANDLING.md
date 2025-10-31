# 🔥 Manejo de Errores HTTP

## Estructura de Respuestas

### ✅ Respuesta Exitosa (200-299)
```json
{
  "statusCode": 200,
  "timestamp": "2024-10-31T12:00:00.000Z",
  "path": "/auth/login",
  "method": "POST",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### ❌ Respuesta de Error
```json
{
  "statusCode": 401,
  "timestamp": "2024-10-31T12:00:00.000Z",
  "path": "/auth/login",
  "method": "POST",
  "error": "Unauthorized",
  "message": "Credenciales inválidas"
}
```

---

## Códigos HTTP Implementados

### 🟢 2xx - Éxito

#### 200 OK
- **Uso:** Respuestas exitosas generales
- **Ejemplo:** Login exitoso, obtener perfil
```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

#### 201 Created
- **Uso:** Recurso creado exitosamente
- **Ejemplo:** Crear usuario, crear prescripción
```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() createDto: CreateDto) {
  return this.service.create(createDto);
}
```

---

### 🟡 4xx - Errores del Cliente

#### 400 Bad Request
- **Uso:** Datos inválidos o mal formateados
- **Cuándo:** Validación de datos falla
```typescript
throw new BadRequestException('Email y contraseña son requeridos');
```

**Ejemplos de uso:**
- ❌ Campos requeridos faltantes
- ❌ Formato de email inválido
- ❌ Tipo de dato incorrecto

#### 401 Unauthorized
- **Uso:** Autenticación fallida o token inválido
- **Cuándo:** Credenciales incorrectas o token expirado
```typescript
throw new UnauthorizedException('Credenciales inválidas');
```

**Ejemplos de uso:**
- ❌ Email o contraseña incorrectos
- ❌ Token JWT expirado
- ❌ Token JWT inválido
- ❌ Usuario no encontrado

#### 403 Forbidden
- **Uso:** Usuario autenticado pero sin permisos
- **Cuándo:** RBAC rechaza el acceso
```typescript
throw new ForbiddenException('No tienes permisos para acceder a este recurso');
```

**Ejemplos de uso:**
- ❌ Paciente intenta acceder a ruta de admin
- ❌ Doctor intenta eliminar prescripción de otro doctor
- ❌ Usuario sin el rol requerido

#### 404 Not Found
- **Uso:** Recurso no encontrado
- **Cuándo:** ID no existe en la base de datos
```typescript
throw new NotFoundException('Prescripción no encontrada');
```

**Ejemplos de uso:**
- ❌ Buscar prescripción con ID inexistente
- ❌ Buscar usuario que no existe
- ❌ Ruta API no existe

#### 409 Conflict
- **Uso:** Conflicto con el estado actual del recurso
- **Cuándo:** Duplicados o estado inválido
```typescript
throw new ConflictException('El email ya está registrado');
```

**Ejemplos de uso:**
- ❌ Email duplicado al crear usuario
- ❌ Código de prescripción duplicado
- ❌ Actualización de recurso con estado inválido

---

### 🔴 5xx - Errores del Servidor

#### 500 Internal Server Error
- **Uso:** Error inesperado del servidor
- **Cuándo:** Excepción no controlada
```typescript
throw new InternalServerErrorException('Error al procesar la solicitud');
```

**Ejemplos de uso:**
- ❌ Error de conexión a base de datos
- ❌ Error al generar tokens
- ❌ Excepción no capturada

---

## Implementación en Auth Service

### Ejemplo de Try-Catch con Códigos HTTP

```typescript
async login(loginDto: LoginDto) {
  try {
    const { email, password } = loginDto;

    // Validación básica
    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son requeridos');
    }

    // Buscar usuario
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // 401 - Credenciales inválidas
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // 401 - Contraseña incorrecta
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 200 - Login exitoso
    return { user, tokens };

  } catch (error) {
    // Si es una excepción HTTP, la re-lanzamos
    if (error instanceof HttpException) {
      throw error;
    }

    // 500 - Error inesperado
    this.logger.error(`Error inesperado: ${error.message}`, error.stack);
    throw new InternalServerErrorException('Error al procesar la solicitud');
  }
}
```

---

## Mejores Prácticas

### ✅ DO - Hacer

1. **Usar códigos HTTP apropiados**
```typescript
// ✅ Correcto
throw new NotFoundException('Usuario no encontrado');

// ❌ Incorrecto
throw new Error('Usuario no encontrado');
```

2. **Mensajes claros y descriptivos**
```typescript
// ✅ Correcto
throw new BadRequestException('El email debe tener un formato válido');

// ❌ Incorrecto
throw new BadRequestException('Error');
```

3. **Logging apropiado**
```typescript
// ✅ Correcto
this.logger.error(`Error al crear usuario: ${error.message}`, error.stack);
this.logger.warn(`Intento de login fallido para: ${email}`);
this.logger.log(`Usuario ${email} inició sesión exitosamente`);
```

4. **Re-lanzar excepciones HTTP**
```typescript
// ✅ Correcto
if (error instanceof UnauthorizedException) {
  throw error; // Mantiene el código HTTP original
}
```

### ❌ DON'T - No hacer

1. **No exponer detalles técnicos al cliente**
```typescript
// ❌ Incorrecto
throw new InternalServerErrorException(error.stack);

// ✅ Correcto
throw new InternalServerErrorException('Error al procesar la solicitud');
```

2. **No usar códigos genéricos para todo**
```typescript
// ❌ Incorrecto
throw new InternalServerErrorException('Usuario no encontrado');

// ✅ Correcto
throw new NotFoundException('Usuario no encontrado');
```

---

## Testing de Errores

### Con Postman/Thunder Client

#### 400 Bad Request
```json
POST /auth/login
{
  "email": "invalid-email",
  "password": "123"
}
```

#### 401 Unauthorized
```json
POST /auth/login
{
  "email": "admin@test.com",
  "password": "wrong-password"
}
```

#### 403 Forbidden
```http
GET /examples/admin-only
Authorization: Bearer <doctor-token>
```

#### 404 Not Found
```http
GET /users/non-existent-id
Authorization: Bearer <valid-token>
```

---

## Resumen de Excepciones NestJS

```typescript
import {
  BadRequestException,      // 400
  UnauthorizedException,    // 401
  ForbiddenException,       // 403
  NotFoundException,        // 404
  ConflictException,        // 409
  InternalServerErrorException, // 500
} from '@nestjs/common';
```

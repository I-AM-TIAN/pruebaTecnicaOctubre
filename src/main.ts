import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function normalizeOrigins(input?: string) {
  if (!input) return [];
  // Soporta una o varias origins separadas por comas, y quita slash final
  return input
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  const allowedOrigins = normalizeOrigins(process.env.CORS_ORIGIN);
  if (allowedOrigins.length) {
    app.enableCors({
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Disposition'],
    });
  } else {
    console.warn('CORS no habilitado: variable CORS_ORIGIN no configurada');
  }

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Prescripciones Médicas')
    .setDescription('API REST para gestión de prescripciones médicas con autenticación JWT y control de acceso basado en roles (RBAC)')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header', description: 'Ingrese el token JWT' },
      'access-token',
    )
    .addTag('Auth', 'Endpoints de autenticación y gestión de sesiones')
    .addTag('Admin', 'Endpoints exclusivos para administradores')
    .addTag('Patients', 'Gestión de pacientes')
    .addTag('Doctors', 'Gestión de doctores')
    .addTag('Prescriptions', 'Gestión de prescripciones médicas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document, {
    customSiteTitle: 'API Docs - Prescripciones',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = Number(process.env.PORT) || 4001;
  await app.listen(port, '0.0.0.0');

  // Logs sin "localhost" (dentro de Railway no aplica)
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
  console.log(`📚 Swagger en /api/docs`);
}
bootstrap();

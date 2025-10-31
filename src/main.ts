import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Prescripciones Médicas')
    .setDescription('API REST para gestión de prescripciones médicas con autenticación JWT y control de acceso basado en roles (RBAC)')
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
    .addTag('Auth', 'Endpoints de autenticación y gestión de sesiones')
    .addTag('Admin', 'Endpoints exclusivos para administradores')
    .addTag('Patients', 'Gestión de pacientes')
    .addTag('Doctors', 'Gestión de doctores')
    .addTag('Prescriptions', 'Gestión de prescripciones médicas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Docs - Prescripciones',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(process.env.PORT ?? 4001);
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 4001}`);
  console.log(`📚 Documentación Swagger disponible en http://localhost:${process.env.PORT ?? 4001}/api/docs`);
}
bootstrap();

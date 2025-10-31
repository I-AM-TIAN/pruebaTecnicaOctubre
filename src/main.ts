import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

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

  await app.listen(process.env.PORT ?? 4001);
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 4001}`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors(appConfig.cors);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  await app.listen(appConfig.port);
  console.log(`🚀 Backend running on http://localhost:${appConfig.port}`);
}
bootstrap();

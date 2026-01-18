import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module';
import { ApiConfigService } from './shared/services/api-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ApiConfigService);
  const reflector = app.get(Reflector);

  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // CORS configuration
  app.enableCors({
    origin: configService.isDevelopment
      ? '*'
      : process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  const port = configService.getNumber('PORT') || 8080;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

void bootstrap();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // The website proxies /api through Next.js, so trust the local proxy's X-Forwarded-For
  // header. This keeps per-visitor rate limits working.
  app.set('trust proxy', process.env.TRUST_PROXY ?? 'loopback');
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({ origin: origins, credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = Number(process.env.PORT ?? 4000);
  // In production HOST=127.0.0.1 keeps the API private behind Next.js and Nginx.
  await app.listen(port, process.env.HOST ?? '0.0.0.0');
  Logger.log(`Pentacore API running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();

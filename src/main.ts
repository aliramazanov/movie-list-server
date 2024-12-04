import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL');

  const origins = frontendUrl
    ? frontendUrl.split(',').map((origin) => origin.trim())
    : '*';

  app.enableCors({
    origin: origins === '*' ? true : origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = '0.0.0.0';

  await app.listen(port, host);
  logger.log(`Application is running on: http://${host}:${port}`);
  logger.log(
    `CORS enabled for origins: ${origins === '*' ? 'All Origins' : origins.join(', ')}`,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

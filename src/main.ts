import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './common/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  await app.listen(envs.port);
  logger.log(`Orders ms running on port ${envs.port}`);
}
bootstrap();

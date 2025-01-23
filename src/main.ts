import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './common/config';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { port: envs.port },
    },
  );
  await app.listen();
  logger.log(`Orders ms running on port ${envs.port}`);
}
bootstrap();

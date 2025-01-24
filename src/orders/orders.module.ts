import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersRepository } from './orders.repository';
import { NatsModule } from '../transports/nats.module';

@Module({
  imports: [PrismaModule, NatsModule],
  controllers: [OrdersController],
  providers: [OrdersRepository, OrdersService],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersRepository } from './orders.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Services } from '../common/constants';
import { envs } from '../common/config';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: Services.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.productsMsHost,
          port: envs.productsMsPort,
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersRepository, OrdersService],
})
export class OrdersModule {}

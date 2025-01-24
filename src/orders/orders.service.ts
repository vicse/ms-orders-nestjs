import { Injectable } from '@nestjs/common';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  OrderPaginationDto,
} from './dto';
import { OrdersRepository } from './orders.repository';
import { Order } from '@prisma/client';
import { PaginationResponse } from '../common/interfaces';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersRepository.createOrder({ data: createOrderDto });
  }

  findAll(
    orderPaginationDto: OrderPaginationDto,
  ): Promise<PaginationResponse<Order>> {
    return this.ordersRepository.findAllOrders(orderPaginationDto);
  }

  findOne(id: string): Promise<Order> {
    return this.ordersRepository.findOneOrder(id);
  }

  changeStatus(changeOrderStatusDto: ChangeOrderStatusDto): Promise<Order> {
    return this.ordersRepository.changeStatus(changeOrderStatusDto);
  }
}

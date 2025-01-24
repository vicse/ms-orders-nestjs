import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  OrderPaginationDto,
} from './dto';
import { OrdersRepository } from './orders.repository';
import { Order } from '@prisma/client';
import { PaginationResponse } from '../common/interfaces';
import { Services } from '../common/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Product } from '../common/interfaces/product';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(Services.NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds = createOrderDto.items.map((item) => item.productId);
      const products: Product[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_product' }, productIds),
      );

      const productsMap = new Map<number, Product>(
        products.map((product) => [product.id, product]),
      );

      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = productsMap.get(orderItem.productId).price;
        return price * orderItem.quantity + acc;
      }, 0);

      const totalItems = createOrderDto.items.reduce(
        (acc, { quantity }) => acc + quantity,
        0,
      );

      const order = await this.ordersRepository.createOrder({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: productsMap.get(orderItem.productId).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              })),
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: productsMap.get(orderItem.productId).name,
        })),
      };

      // return { createOrderDto };
      // return this.ordersRepository.createOrder({ data: createOrderDto });
    } catch (err) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }

  findAll(
    orderPaginationDto: OrderPaginationDto,
  ): Promise<PaginationResponse<Order>> {
    return this.ordersRepository.findAllOrders(orderPaginationDto);
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOneOrder(id);
    const productIds = order.OrderItem.map((item) => item.productId);
    const products: Product[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_product' }, productIds),
    );
    const productsMap = new Map<number, Product>(
      products.map((product) => [product.id, product]),
    );
    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: productsMap.get(orderItem.productId).name,
      })),
    };
  }

  changeStatus(changeOrderStatusDto: ChangeOrderStatusDto): Promise<Order> {
    return this.ordersRepository.changeStatus(changeOrderStatusDto);
  }
}

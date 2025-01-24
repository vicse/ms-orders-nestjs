import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Order } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { PaginationResponse } from '../common/interfaces';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(params: { data: Prisma.OrderCreateInput }): Promise<Order> {
    const { data } = params;
    return this.prisma.order.create({ data });
  }

  async findAllOrders({
    page,
    limit,
    status,
  }: OrderPaginationDto): Promise<PaginationResponse<Order>> {
    const totalOrders = await this.prisma.order.count({
      where: { status },
    });
    const lastPage = Math.ceil(totalOrders / limit);
    return {
      data: await this.prisma.order.findMany({
        where: { status },
        take: limit,
        skip: (page - 1) * limit,
      }),
      meta: {
        total: totalOrders,
        page,
        lastPage,
      },
    };
  }

  async findOneOrder(id: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({ where: { id } });
    if (!order)
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    return order;
  }

  async changeStatus({ id, status }: ChangeOrderStatusDto): Promise<Order> {
    const order = await this.findOneOrder(id);
    if (order.status === status) return order;
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private readonly repo: Repository<Order>) {}

  async create(dto: CreateOrderDto) {
    const order = await this.repo.save(this.repo.create(dto));
    return { id: order.id, status: order.status, createdAt: order.createdAt };
  }

  findAll(status?: OrderStatus) {
    return this.repo.find({ where: status ? { status } : {}, order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.repo.save(order);
  }

  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Order not found');
    if (dto.status !== undefined) order.status = dto.status;
    if (dto.notes !== undefined) order.notes = dto.notes;
    return this.repo.save(order);
  }

  async remove(id: string) {
    const result = await this.repo.delete({ id });
    if (!result.affected) throw new NotFoundException('Order not found');
    return { deleted: true };
  }

  async stats() {
    const rows = await this.repo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('o.status')
      .getRawMany<{ status: OrderStatus; count: number }>();
    const total = rows.reduce((sum, r) => sum + r.count, 0);
    return { total, byStatus: rows };
  }
}

import { IsEnum } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

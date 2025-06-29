import { IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  orderId: string;

  @IsNumber()
  grossAmount: number;
}

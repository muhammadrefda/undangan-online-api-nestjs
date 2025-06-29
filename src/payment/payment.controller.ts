import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('transaction')
  createTransaction(@Body() dto: CreateTransactionDto) {
    return this.paymentService.createTransaction({
      order_id: dto.orderId,
      gross_amount: dto.grossAmount,
    });
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create')
  async createSnap(
    @Body()
    body: {
      orderId: string;
      amount: number;
      name: string;
      email: string;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.paymentService.createTransaction(
      body.orderId,
      body.amount,
      body.name,
      body.email,
    );
  }
}

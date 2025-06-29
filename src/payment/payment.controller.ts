import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  initiate(@Body('amount') amount: number) {
    return this.paymentService.createPayment(Number(amount));
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.paymentService.handleWebhook(body);
  }
}

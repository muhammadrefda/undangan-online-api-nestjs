import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private snap: midtransClient.Snap;

  constructor(private configService: ConfigService) {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: this.configService.get('SERVER_KEY'),
      clientKey: this.configService.get('CLIENT_KEY'),
    });
  }

  async createTransaction(
    orderId: string,
    grossAmount: number,
    name: string,
    email: string,
  ) {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
      credit_card: {
        secure: true,
      },
    };

    return await this.snap.createTransaction(parameter);
  }
}

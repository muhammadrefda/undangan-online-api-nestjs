import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly apiUrl: string;
  private readonly serverKey: string;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    this.apiUrl = isProd
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1';
  }

  async createTransaction(params: {
    order_id: string;
    gross_amount: number;
  }): Promise<any> {
    const body = {
      transaction_details: params,
      credit_card: { secure: true },
    };
    const auth = Buffer.from(this.serverKey + ':').toString('base64');
    const res = await fetch(`${this.apiUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midtrans error: ${res.status} ${text}`);
    }

    return res.json();
  }
}

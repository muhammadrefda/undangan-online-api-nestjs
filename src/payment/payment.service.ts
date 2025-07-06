import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import * as midtransClient from 'midtrans-client';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { InjectRepository } from '@nestjs/typeorm';

//TODO: soon need to create new file for midtrans notification payload
export interface MidtransNotificationPayload {
  order_id: string;
  transaction_status: string;
  payment_type: string;
  gross_amount: string;
  fraud_status: string;
  signature_key: string;
  status_code: string;
  settlement_time?: string;
}

export interface PaymentResponse {
  paymentType: string;
  status: string;
}

@Injectable()
export class PaymentService {
  private snap: midtransClient.Snap;

  constructor(
    private configService: ConfigService,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {
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

  async handleMidtransNotification(payload: MidtransNotificationPayload) {
    const {
      order_id,
      transaction_status,
      payment_type,
      gross_amount,
      fraud_status,
      signature_key,
      status_code,
      settlement_time,
    } = payload;

    // STEP 1: Validasi Signature
    const serverKey: string | undefined = this.configService.get('SERVER_KEY');
    const input: string = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(input)
      .digest('hex');

    const isValid = expectedSignature === signature_key;
    if (!isValid) {
      throw new Error('Invalid signature from Midtrans');
    }

    // STEP 2: Cari record payment berdasarkan order_id
    const payment: Payment | null = await this.paymentRepo.findOne({
      where: { orderId: order_id },
    });
    if (!payment) {
      throw new Error(`Payment with order_id ${order_id} not found`);
    }

    // STEP 3: Update payment status berdasarkan notifikasi Midtrans
    if (transaction_status === 'settlement' && fraud_status === 'accept') {
      payment.status = 'success';
      payment.settlementTime = settlement_time
        ? new Date(settlement_time)
        : new Date();
    } else if (transaction_status === 'expire') {
      payment.status = 'expired';
    } else if (['deny', 'cancel'].includes(transaction_status)) {
      payment.status = 'failure';
    } else {
      payment.status = transaction_status;
    }

    payment.paymentType = payment_type;
    payment.fraudStatus = fraud_status;

    await this.paymentRepo.save(payment);

    return { orderId: order_id, updatedStatus: payment.status };
  }
}

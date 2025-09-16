import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { Snap } from 'midtrans-client';
import { ConfigService } from '@nestjs/config';
import { DeepPartial, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MidtransNotificationPayload,
  PaymentStatus,
} from './types/payment.type';

@Injectable()
export class PaymentService {
  private snap: Snap;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {
    this.snap = new Snap({
      isProduction: false,
      serverKey: this.configService.get('SERVER_KEY')!,
      clientKey: this.configService.get('CLIENT_KEY')!,
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

    const transaction = await this.snap.createTransaction(parameter);

    const payment = this.paymentRepo.create({
      orderId,
      amount: grossAmount,
      name,
      email,
      paymentMethod: 'midtrans',
      status: PaymentStatus.PENDING,
      paymentType: null,
      fraudStatus: null,
    } as DeepPartial<Payment>);
    await this.paymentRepo.save(payment);

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    };
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

    // ✅ Kalau order_id dari test notif Midtrans, jangan paksa cek DB
    if (order_id.startsWith('payment_notif_test')) {
      console.log('📩 Received Midtrans TEST notification:', payload);
      return {
        orderId: order_id,
        status: transaction_status,
        note: 'Test notification',
      };
    }

    const serverKey: string = this.configService.get('SERVER_KEY')!;
    const input: string = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(input)
      .digest('hex');

    const isValid = expectedSignature === signature_key;
    if (!isValid) {
      // 👉 Tambahin ini biar test notif dari Midtrans gak bikin error 500
      console.warn(
        '⚠️ Signature tidak valid (mungkin test notification dari Midtrans)',
      );
      return { orderId: order_id, status: 'signature_invalid_test_mode' };
    }

    const payment = await this.paymentRepo.findOne({
      where: { orderId: order_id },
    });
    if (!payment) {
      throw new Error(`Payment with order_id ${order_id} not found`);
    }

    if (transaction_status === 'settlement' && fraud_status === 'accept') {
      payment.status = PaymentStatus.SUCCESS;
      payment.settlementTime = settlement_time
        ? new Date(settlement_time)
        : new Date();
    } else if (transaction_status === 'expire') {
      payment.status = PaymentStatus.EXPIRED;
    } else if (['deny', 'cancel'].includes(transaction_status)) {
      payment.status = PaymentStatus.FAILURE;
    } else if (transaction_status === 'pending') {
      payment.status = PaymentStatus.PENDING;
    } else {
      payment.status = transaction_status;
    }

    payment.paymentType = payment_type;
    payment.fraudStatus = fraud_status;

    await this.paymentRepo.save(payment);

    return { orderId: order_id, updatedStatus: payment.status };
  }
}

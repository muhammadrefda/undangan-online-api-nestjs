import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private ethers: any | null = null;

  constructor() {
    try {
      this.ethers = require('ethers');
    } catch (err) {
      this.logger.warn('Ethers library not installed, falling back to random address generation');
    }
  }

  createPayment(amount: number) {
    let address: string;
    if (this.ethers) {
      address = this.ethers.Wallet.createRandom().address;
    } else {
      address = '0x' + randomBytes(20).toString('hex');
    }
    return { address, amount };
  }

  handleWebhook(payload: any) {
    this.logger.log('Received webhook: ' + JSON.stringify(payload));
    return { received: true };
  }
}

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

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILURE = 'failure',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

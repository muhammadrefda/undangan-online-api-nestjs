// File ini memberitahu TypeScript tentang bentuk dari library 'midtrans-client'
// untuk menghilangkan error TS7016 dan error ESLint terkait 'any'.

declare module 'midtrans-client' {
  // Opsi yang diterima oleh constructor Snap
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  // Parameter yang diterima oleh metode createTransaction
  interface TransactionParameters {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: {
      id: string;
      price: number;
      quantity: number;
      name: string;
    }[];
    credit_card?: {
      secure: boolean;
    };
    // Tambahkan properti lain jika Anda menggunakannya
  }

  // Respons yang dikembalikan oleh createTransaction
  interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapOptions);

    createTransaction(
      parameter: TransactionParameters,
    ): Promise<TransactionResponse>;

    transaction: {
      notification(payload: Record<string, any>): Promise<Record<string, any>>;
      status(orderId: string): Promise<Record<string, any>>;
    };
  }
}

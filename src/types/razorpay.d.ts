declare module "razorpay" {
  interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  interface OrderCreateOptions {
    amount: number | string;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  interface Order {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status: string;
  }

  export default class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(options: OrderCreateOptions): Promise<Order>;
      fetch(orderId: string): Promise<Order>;
    };
  }
}

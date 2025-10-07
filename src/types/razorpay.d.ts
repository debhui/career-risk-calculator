// src/types/razorpay.d.ts

// Minimal definition for the Razorpay Checkout Options
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
  // Include other options your implementation might use
  // For example: notes, callback_url, etc.
  [key: string]: any;
}

// Define the global Razorpay object itself
interface Razorpay {
  new (options: RazorpayOptions): RazorpayInstance;
  open(): void;
  on(event: string, callback: (response: any) => void): void;
}

// Define the Razorpay instance methods
interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, callback: (response: any) => void): void;
}

// Extend the global Window object to include Razorpay
declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}

import Razorpay from "razorpay";

/**
 * Server-side Razorpay instance.
 * Must only be used in API routes or Server Actions.
 * Lazily initialized to avoid build-time initialization errors when keys are not configured.
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const client = getRazorpayClient();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

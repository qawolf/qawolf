import { loadStripe, Stripe, StripeError } from "@stripe/stripe-js";

export class StripeClient {
  _stripePromise: Promise<Stripe | null> = null;

  constructor() {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      this._stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
    }
  }

  async redirectToCheckout(
    sessionId: string
  ): Promise<{ error: StripeError } | null> {
    const stripe = await this._stripePromise;
    const error = await stripe?.redirectToCheckout({ sessionId });

    return error || null;
  }
}

export const stripe = new StripeClient();

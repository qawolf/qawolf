import { loadStripe, Stripe as StripeType } from "@stripe/stripe-js";

class Stripe {
  private stripe: StripeType | null = null;

  constructor() {
    this.load();
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) await this.load();

    this.stripe.redirectToCheckout({ sessionId });
  }

  private async load(): Promise<void> {
    this.stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);
  }
}

export const stripe = new Stripe();

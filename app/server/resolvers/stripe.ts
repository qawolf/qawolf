import Stripe from "stripe";

import environment from "../environment";
import { Context } from "../types";
import { ensureUser } from "./utils";

const stripe = new Stripe(environment.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});

export const createStripeCheckoutSessionResolver = async (
  _: Record<string, unknown>,
  __: Record<string, unknown>,
  { logger, user }: Context
): Promise<string> => {
  const log = logger.prefix("createStripeCheckoutSessionResolver");
  log.debug("user", user?.id);

  ensureUser({ logger, user });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      { price: "price_1IbEIUHdke113nSPZkw50opR", quantity: 1 },
      { price: "price_1IbEIUHdke113nSPxyJ4KVy6" },
    ],
    // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
    // the actual Session ID is returned in the query parameter when your customer
    // is redirected to the success page.
    success_url:
      "https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: new URL("/pricing", environment.APP_URL).href,
  });
  console.log("SESSION", session);
  log.debug("created session", session.id);

  return session.id;
};

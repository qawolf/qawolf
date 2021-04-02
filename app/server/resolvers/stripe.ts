import Stripe from "stripe";

import environment from "../environment";
import { Context, CreateStripeCheckoutSessionMutation } from "../types";
import { ensureTeamAccess, ensureUser } from "./utils";

const stripe = new Stripe(environment.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});

export const createStripeCheckoutSessionResolver = async (
  _: Record<string, unknown>,
  { cancel_uri, team_id }: CreateStripeCheckoutSessionMutation,
  { logger, teams, user: contextUser }: Context
): Promise<string> => {
  const log = logger.prefix("createStripeCheckoutSessionResolver");
  log.debug("team", team_id);

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id, teams });

  const session = await stripe.checkout.sessions.create({
    cancel_url: new URL(cancel_uri, environment.APP_URL).href,
    customer_email: user.email,
    line_items: [
      { price: environment.STRIPE_BASE_PRICE_ID, quantity: 1 },
      { price: environment.STRIPE_METERED_PRICE_ID },
    ],
    mode: "subscription",
    payment_method_types: ["card"],
    // {CHECKOUT_SESSION_ID} is a string literal - do not change it
    // the actual Session ID is returned in the query parameter when the customer
    // is redirected to the success page
    subscription_data: { metadata: { plan: "business", team_id } },
    success_url: new URL(
      "/checkout-success?session_id={CHECKOUT_SESSION_ID}",
      environment.APP_URL
    ).href,
  });

  return session.id;
};

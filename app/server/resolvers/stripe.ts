import Stripe from "stripe";

import environment from "../environment";
import { ClientError } from "../errors";
import {
  Context,
  CreateStripeCheckoutSessionMutation,
  CreateStripePortalSessionMutation,
} from "../types";
import { ensureTeamAccess, ensureUser } from "./utils";

const stripe = new Stripe(environment.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});

export const createStripeCheckoutSessionResolver = async (
  _: Record<string, unknown>,
  { app_url, cancel_uri, team_id }: CreateStripeCheckoutSessionMutation,
  { logger, teams, user: contextUser }: Context
): Promise<string> => {
  const log = logger.prefix("createStripeCheckoutSessionResolver");
  log.debug("team", team_id);

  const user = ensureUser({ logger, user: contextUser });
  ensureTeamAccess({ logger, team_id, teams });

  const { id } = await stripe.checkout.sessions.create({
    cancel_url: new URL(cancel_uri, app_url).href,
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
      app_url
    ).href,
  });
  log.debug("created", id);

  return id;
};

export const createStripePortalSessionResolver = async (
  _: Record<string, unknown>,
  { app_url, return_uri, team_id }: CreateStripePortalSessionMutation,
  { logger, teams }: Context
): Promise<string> => {
  const log = logger.prefix("createStripePortalSessionResolver");
  log.debug("team", team_id);

  const team = ensureTeamAccess({ logger, team_id, teams });

  if (!team.stripe_customer_id) {
    log.error("no stripe customer id for team", team.id);
    throw new ClientError("No Stripe subscription to manage");
  }

  const { url } = await stripe.billingPortal.sessions.create({
    customer: team.stripe_customer_id,
    return_url: new URL(return_uri, app_url).href,
  });
  log.debug("created", url);

  return url;
};

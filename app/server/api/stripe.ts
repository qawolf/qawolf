import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { minutesFromNow } from "../../shared/utils";
import environment from "../environment";
import { findTeam, updateTeam } from "../models/team";
import { postMessageToSlack } from "../services/alert/slack";
import { ModelOptions, Team, TeamPlan } from "../types";

const stripe = new Stripe(environment.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});

type SubscriptionMetadata = {
  ignore_webhook: boolean;
  plan: TeamPlan;
  team_id: string;
};

const buildTeamFieldsForPayment = (): Partial<Team> => {
  return {
    limit_reached_at: null,
    renewed_at: minutesFromNow(),
  };
};

export const shouldIgnoreInvoicePaidEvent = (
  invoice: Stripe.Invoice,
  { logger }: ModelOptions
): boolean => {
  const log = logger.prefix("shouldIgnoreInvoicePaidEvent");

  const firstInvoice = invoice.billing_reason === "subscription_create";
  // first invoice is already handled by the checkout.session.completed event
  if (firstInvoice) {
    log.debug("true, first invoice for", invoice.subscription);
    return true;
  }

  log.debug("false");
  return false;
};

export const findMetadataForSubscription = async (
  subscription: string,
  { logger }: ModelOptions
): Promise<SubscriptionMetadata> => {
  const log = logger.prefix("findMetadataForSubscription");
  log.debug("find subscription", subscription);

  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription as string
  );

  const { ignore_webhook, plan, team_id } = stripeSubscription.metadata;
  log.debug("team", team_id, "plan", plan);

  return {
    ignore_webhook: ignore_webhook === "true",
    plan: plan as TeamPlan,
    team_id,
  };
};

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleCheckoutCompleted");

  const { customer, customer_email, subscription } = session;
  log.debug("customer", customer);

  const { plan, team_id } = await findMetadataForSubscription(
    subscription as string,
    options
  );

  await updateTeam(
    {
      ...buildTeamFieldsForPayment(),
      id: team_id,
      plan,
      stripe_customer_id: customer as string,
      stripe_subscription_id: subscription as string,
    },
    options
  );

  if (environment.SLACK_UPDATES_WEBHOOK) {
    await postMessageToSlack({
      message: {
        text: `🎉 ${customer_email} just signed up for the ${plan} plan!`,
      },
      webhook_url: environment.SLACK_UPDATES_WEBHOOK,
    });
  }
};

export const handleInvoicePaid = async (
  invoice: Stripe.Invoice,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleInvoicePaid");
  if (shouldIgnoreInvoicePaidEvent(invoice, options)) return;

  const { customer, subscription } = invoice;
  log.debug("subscription", subscription);

  const { ignore_webhook, plan, team_id } = await findMetadataForSubscription(
    subscription as string,
    options
  );

  if (ignore_webhook) {
    log.debug("ignore webhook for subscription", subscription);
    return;
  }

  await updateTeam(
    {
      ...buildTeamFieldsForPayment(),
      id: team_id,
      plan,
      stripe_customer_id: customer as string,
      stripe_subscription_id: subscription as string,
    },
    options
  );
};

export const handleInvoicePaymentFailed = async (
  invoice: Stripe.Invoice,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleInvoicePaymentFailed");

  const { customer_email, subscription } = invoice;
  log.debug("subscription", subscription);

  const { team_id } = await findMetadataForSubscription(
    subscription as string,
    options
  );

  if (environment.SLACK_UPDATES_WEBHOOK) {
    const team = await findTeam(team_id, options);

    await postMessageToSlack({
      message: {
        text: `🧾 invoice payment failed for ${customer_email} at ${team.name} (${team.id})`,
      },
      webhook_url: environment.SLACK_UPDATES_WEBHOOK,
    });
  }
};

// https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe
export const handleStripeRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleStripeRequest");

  try {
    const buf = await buffer(req);
    const signature = req.headers["stripe-signature"];

    const event = stripe.webhooks.constructEvent(
      buf.toString(),
      signature,
      environment.STRIPE_WEBHOOK_SECRET
    );
    log.debug("event", event.type, event.id);

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        options
      );
    } else if (event.type === "invoice.paid") {
      await handleInvoicePaid(event.data.object as Stripe.Invoice, options);
    } else if (event.type === "invoice.payment_failed") {
      await handleInvoicePaymentFailed(
        event.data.object as Stripe.Invoice,
        options
      );
    } else {
      log.debug("ignore  event", event.type);
    }

    log.debug("completed");
    res.status(200).end();
  } catch (error) {
    log.alert("stripe error", error.message);
    res.status(500).send(error.message);
  }
};

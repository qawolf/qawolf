import Stripe from "stripe";

import environment from "../environment";
import { Logger } from "../Logger";
import { Team } from "../types";

const stripe = new Stripe(environment.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
  typescript: true,
});

const basePlanRuns = 1000;

type UpdateStripeUsage = {
  logger: Logger;
  runCount: number;
  team: Team;
};

const buildFormattedTimestamp = (): number => {
  // Stripe uses seconds not milliseconds
  return Math.ceil(Date.now() / 1000);
};

export const findMeteredSubscriptionItemId = async (
  subscriptionId: string,
  logger: Logger
): Promise<string> => {
  const log = logger.prefix("findMeteredSubscriptionItem");

  const {
    items: { data },
  } = await stripe.subscriptions.retrieve(subscriptionId);

  const meteredItem = data.find((item) => item.plan.usage_type === "metered");

  if (!meteredItem) {
    const message = `metered item not found for subscription ${subscriptionId}`;

    log.alert(message);
    throw new Error(message);
  }

  return meteredItem.id;
};

export const updateStripeUsage = async ({
  logger,
  runCount,
  team,
}: UpdateStripeUsage): Promise<void> => {
  const log = logger.prefix("updateStripeUsage");
  log.debug("team", team.id);

  if (!team.stripe_subscription_id) {
    const message = `No subscription for team ${team.id}`;

    log.alert(message);
    throw new Error(message);
  }

  const extraRuns = runCount - basePlanRuns;
  if (extraRuns <= 0) {
    log.debug("skip, run count", runCount);
    return;
  }

  const meteredSubscriptionItemId = await findMeteredSubscriptionItemId(
    team.stripe_subscription_id,
    logger
  );

  await stripe.subscriptionItems.createUsageRecord(meteredSubscriptionItemId, {
    action: "set",
    quantity: extraRuns,
    timestamp: buildFormattedTimestamp(),
  });
  log.debug("done");
};

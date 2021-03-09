import { Context } from "@apollo/client";

import { createSubscriber } from "../models/subscriber";
import { CreateSubscriberMutation } from "../types";

export const createSubscriberResolver = async (
  _: Record<string, unknown>,
  { email }: CreateSubscriberMutation,
  { db, logger }: Context
): Promise<boolean> => {
  const log = logger.prefix("createSubscriberResolver");
  log.debug("email", email);

  await createSubscriber(email, { db, logger });

  return true;
};

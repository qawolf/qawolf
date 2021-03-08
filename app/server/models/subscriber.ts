import * as EmailValidator from "email-validator";

import { ModelOptions, Subscriber } from "../types";
import { cuid } from "../utils";

export const createSubscriber = async (
  email: string,
  { db, logger }: ModelOptions
): Promise<Subscriber | null> => {
  const log = logger.prefix("createSubscriber");
  log.debug("email", email);

  if (!EmailValidator.validate(email)) {
    log.debug("skip, invalid");
    return null;
  }

  const existingSubscriber = await db("subscribers").where({ email }).first();
  if (existingSubscriber) {
    log.debug("skip, already subscribed");
    return null;
  }

  const subscriber = { email, id: cuid() };

  await db("subscribers").insert(subscriber);
  log.debug("created", subscriber.id);

  return subscriber;
};

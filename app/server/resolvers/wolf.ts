import { findUser } from "../models/user";
import { Context, Wolf, WolfQuery } from "../types";

export const wolfResolver = async (
  _: Record<string, unknown>,
  { user_id }: WolfQuery,
  { db, logger }: Context
): Promise<Wolf> => {
  const log = logger.prefix("wolfResolver");
  log.debug("user", user_id);

  const user = await findUser({ id: user_id }, { db, logger });
  if (!user) {
    log.error("user", user_id, "not fuond");
    throw new Error("not found");
  }

  return {
    name: user.wolf_name,
    number: user.wolf_number,
    variant: user.wolf_variant,
  };
};

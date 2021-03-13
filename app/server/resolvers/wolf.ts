import capitalize from "lodash/capitalize";

import { ClientError } from "../errors";
import { findUser, updateUser } from "../models/user";
import { Context, UpdateWolfMutation, User, Wolf, WolfQuery } from "../types";

const buildWolf = (user: User): Wolf => {
  return {
    name: user.wolf_name,
    number: user.wolf_number,
    variant: user.wolf_variant,
  };
};

export const updateWolfResolver = async (
  _: Record<string, unknown>,
  { name, user_id }: UpdateWolfMutation,
  { db, logger }: Context
): Promise<Wolf> => {
  const log = logger.prefix("updateWolfResolver");
  log.debug("user", user_id);

  const user = await updateUser(
    { id: user_id, wolf_name: capitalize(name) },
    { db, logger }
  );

  return buildWolf(user);
};

export const wolfResolver = async (
  _: Record<string, unknown>,
  { user_id }: WolfQuery,
  { db, logger }: Context
): Promise<Wolf> => {
  const log = logger.prefix("wolfResolver");
  log.debug("user", user_id);

  const user = await findUser({ id: user_id }, { db, logger });
  if (!user) {
    log.error("user", user_id, "not found");
    throw new ClientError("wolf not found");
  }

  return buildWolf(user);
};

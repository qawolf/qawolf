import { db } from "../db";
import { Environment, ModelOptions } from "../types";

export const findEnvrionment = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<Environment> => {
  const log = logger.prefix("findEnvironment");

  const environment = await (trx || db)("environments")
    .select("*")
    .where({ id })
    .first();

  if (!environment) {
    log.error("not found", id);
    throw new Error("Environment not found");
  }

  return environment;
};

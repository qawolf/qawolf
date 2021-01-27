import { db } from "../db";
import { Environment, ModelOptions } from "../types";

type UpdateEnvironment = {
  id: string;
  name: string;
};

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

export const findEnvironmentsForTeam = async (
  team_id: string,
  { logger, trx }: ModelOptions
): Promise<Environment[]> => {
  const log = logger.prefix("findEnvironmentsForTeam");

  const environments = await (trx || db)("environments")
    .where({ team_id })
    .orderBy("name", "asc");

  log.debug(`found ${environments.length} environments`);

  return environments;
};

export const updateEnvironment = async (
  { id, name }: UpdateEnvironment,
  { logger, trx }: ModelOptions
): Promise<Environment> => {
  const log = logger.prefix("updateEnvironment");

  if (!name) {
    log.error("name not provided", id);
    throw new Error("Must provide name");
  }

  const existingEnvironment = await findEnvrionment(id, { logger, trx });

  const updates = { name, updated_at: new Date().toISOString() };
  await (trx || db)("environments").where({ id }).update(updates);

  log.debug("updated environment", id, updates);

  return { ...existingEnvironment, ...updates };
};

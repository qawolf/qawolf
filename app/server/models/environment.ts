import { ClientError } from "../errors";
import { Environment, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateEnvironment = {
  name: string;
  team_id: string;
};

type UpdateEnvironment = {
  id: string;
  name: string;
};

export const createEnvironment = async (
  { name, team_id }: CreateEnvironment,
  { db, logger }: ModelOptions
): Promise<Environment> => {
  const log = logger.prefix("createEnvironment");

  if (!name) {
    log.error("name not provided");
    throw new Error("Must provide name");
  }

  const environment = {
    id: cuid(),
    name,
    team_id,
  };

  try {
    await db("environments").insert(environment);
  } catch (error) {
    if (error.message.includes("environments_name_team_id_unique")) {
      throw new ClientError("environment name must be unique");
    }

    throw error;
  }

  log.debug("created", environment.id);

  return environment;
};

export const deleteEnvironment = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Environment> => {
  const log = logger.prefix("deleteEnvironment");

  const environment = await findEnvironment(id, { db, logger });
  await db("environments").where({ id }).del();

  log.debug("deleted", id);

  return environment;
};

export const findEnvironment = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Environment> => {
  const log = logger.prefix("findEnvironment");

  const environment = await db("environments")
    .select("*")
    .where({ id })
    .first();

  if (!environment) {
    log.error("not found", id);
    throw new Error("Environment not found");
  }

  return environment;
};

export const findEnvironmentIdForRun = async (
  run_id: string,
  { db, logger }: ModelOptions
): Promise<string | null> => {
  const log = logger.prefix("findEnvironmentIdForRun");
  log.debug("run", run_id);

  const row = await db
    .select("triggers.environment_id" as "*")
    .from("triggers")
    .innerJoin("suites", "triggers.id", "suites.trigger_id")
    .innerJoin("runs", "runs.suite_id", "suites.id")
    .where({ "runs.id": run_id })
    .first();

  log.debug(row ? `found ${row.environment_id}` : "not found");

  return row?.environment_id || null;
};

export const findEnvironmentOrNull = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Environment | null> => {
  const log = logger.prefix("findEnvironmentOrNull");
  log.debug("envrionment", id);

  const environment = await db("environments")
    .select("*")
    .where({ id })
    .first();

  log.debug(environment ? "found" : "not found");

  return environment || null;
};

export const findEnvironmentsForTeam = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<Environment[]> => {
  const log = logger.prefix("findEnvironmentsForTeam");

  const environments = await db("environments")
    .where({ team_id })
    .orderBy("name", "asc");

  log.debug(`found ${environments.length} environments`);

  return environments;
};

export const updateEnvironment = async (
  { id, name }: UpdateEnvironment,
  { db, logger }: ModelOptions
): Promise<Environment> => {
  const log = logger.prefix("updateEnvironment");

  if (!name) {
    log.error("name not provided", id);
    throw new Error("Must provide name");
  }

  const existingEnvironment = await findEnvironment(id, { db, logger });

  const updates = { name, updated_at: new Date().toISOString() };

  try {
    await db("environments").where({ id }).update(updates);
  } catch (error) {
    if (error.message.includes("environments_name_team_id_unique")) {
      throw new ClientError("environment name must be unique");
    }

    throw error;
  }

  log.debug("updated environment", id, updates);

  return { ...existingEnvironment, ...updates };
};

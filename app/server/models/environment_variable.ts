import { db } from "../db";
import { ClientError } from "../errors";
import {
  EnvironmentVariable,
  FormattedVariables,
  ModelOptions,
} from "../types";
import { cuid, minutesFromNow } from "../utils";
import { decrypt, encrypt } from "./encrypt";
import { findDefaultGroupForTeam } from "./group";

type BuildEnvironmentVariablesForGroup = {
  custom_variables?: FormattedVariables;
  group_id: string;
  group_variables?: EnvironmentVariable[];
  team_id: string;
};

type CreateEnvironmentVariable = {
  group_id: string;
  name: string;
  team_id: string;
  value: string;
};

export const createEnvironmentVariable = async (
  { group_id, name, team_id, value }: CreateEnvironmentVariable,
  { logger, trx }: ModelOptions
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("createEnvironmentVariable");
  log.debug("name", name, "team", team_id);

  const timestamp = minutesFromNow();

  const environmentVariable = {
    created_at: timestamp,
    id: cuid(),
    is_system: false,
    group_id,
    name: name.replace(/\s+/g, "_").toUpperCase(),
    team_id,
    updated_at: timestamp,
    value: encrypt(value),
  };

  try {
    await (trx || db)("environment_variables").insert(environmentVariable);
  } catch (error) {
    if (error.message.includes("environment_variables_group_id_name_unique")) {
      throw new ClientError("variable name must be unique");
    }

    throw error;
  }

  log.debug("created", environmentVariable.id);

  return environmentVariable;
};

export const deleteEnvironmentVariable = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("deleteEnvironmentVariable");
  log.debug(id);

  const deleteCount = await (trx || db)("environment_variables")
    .where({ id })
    .del();
  log.debug(`deleted ${deleteCount} environment variables`);

  return id;
};

export const findEnvironmentVariable = async (
  id: string,
  { logger, trx }: ModelOptions
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("findEnvironmentVariable");
  log.debug("id");

  const environmentVariable = await (trx || db)("environment_variables")
    .select("*")
    .where({ id })
    .first();

  if (!environmentVariable) {
    log.error("not found", id);
    throw new Error("environment variable not found");
  }

  log.debug("found", id);
  return environmentVariable;
};

export const findEnvironmentVariablesForGroup = async (
  group_id: string,
  { trx }: ModelOptions
): Promise<EnvironmentVariable[]> => {
  const environmentVariables = await (trx || db)("environment_variables")
    .select("*")
    .where({ group_id })
    .orderBy("name", "asc");

  return environmentVariables;
};

/**
 * @summary Look up env variable team defaults, merge with group and custom
 *   variables, and decrypt all values.
 * @returns JSON object with key:value env variables, with decrypted values.
 */
export const buildEnvironmentVariablesForGroup = async (
  {
    custom_variables,
    group_id,
    group_variables,
    team_id,
  }: BuildEnvironmentVariablesForGroup,
  { logger, trx }: ModelOptions
): Promise<string> => {
  const variables =
    group_variables ||
    (await findEnvironmentVariablesForGroup(group_id, {
      logger,
      trx,
    }));

  const defaultGroup = await findDefaultGroupForTeam(team_id, { logger, trx });
  let defaultVariables: EnvironmentVariable[] = [];

  if (defaultGroup.id !== group_id) {
    defaultVariables = await findEnvironmentVariablesForGroup(defaultGroup.id, {
      logger,
      trx,
    });
  }

  const formattedVariables: FormattedVariables = {};

  [...defaultVariables, ...variables].forEach((variable) => {
    formattedVariables[variable.name] = decrypt(variable.value);
  });

  return JSON.stringify({ ...formattedVariables, ...(custom_variables || {}) });
};

export const findSystemEnvironmentVariable = async (
  name: string
): Promise<EnvironmentVariable> => {
  const environmentVariable = await db("environment_variables")
    .select("*")
    .where({ is_system: true, name })
    .first();

  if (!environmentVariable) {
    throw new Error("environment variable not found");
  }

  return environmentVariable;
};

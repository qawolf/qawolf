import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import { ClientError } from "../errors";
import {
  EnvironmentVariable,
  FormattedVariables,
  ModelOptions,
} from "../types";
import { cuid } from "../utils";
import { decrypt, encrypt } from "./encrypt";

type BuildEnvironmentVariables = {
  custom_variables?: FormattedVariables;
  environment_id: string | null;
};

type CreateEnvironmentVariable = {
  environment_id: string;
  name: string;
  team_id: string;
  value: string;
};

export const createEnvironmentVariable = async (
  { environment_id, name, team_id, value }: CreateEnvironmentVariable,
  { logger, trx }: ModelOptions
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("createEnvironmentVariable");
  log.debug("name", name, "team", team_id);

  const timestamp = minutesFromNow();

  const environmentVariable = {
    created_at: timestamp,
    environment_id,
    id: cuid(),
    is_system: false,
    name: name.replace(/\s+/g, "_").toUpperCase(),
    team_id,
    updated_at: timestamp,
    value: encrypt(value),
  };

  try {
    await (trx || db)("environment_variables").insert(environmentVariable);
  } catch (error) {
    if (
      error.message.includes("environment_variables_environment_id_name_unique")
    ) {
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

export const findEnvironmentVariablesForEnvironment = async (
  environment_id: string,
  { trx }: ModelOptions
): Promise<EnvironmentVariable[]> => {
  const environmentVariables = await (trx || db)("environment_variables")
    .select("*")
    .where({ environment_id })
    .orderBy("name", "asc");

  return environmentVariables;
};

/**
 * @summary Look up env variables for environment, merge with custom variables,
 *   and decrypt all values.
 * @returns JSON object with key:value env variables, with decrypted values.
 */
export const buildEnvironmentVariables = async (
  { custom_variables, environment_id }: BuildEnvironmentVariables,
  { logger, trx }: ModelOptions
): Promise<{ env: string; variables: EnvironmentVariable[] }> => {
  const variables = environment_id
    ? await findEnvironmentVariablesForEnvironment(environment_id, {
        logger,
        trx,
      })
    : [];

  const formattedVariables: FormattedVariables = {};

  variables.forEach((variable) => {
    formattedVariables[variable.name] = decrypt(variable.value);
  });

  return {
    env: JSON.stringify({ ...formattedVariables, ...(custom_variables || {}) }),
    variables,
  };
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

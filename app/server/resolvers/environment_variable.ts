import { db } from "../db";
import {
  buildEnvironmentVariablesForGroup,
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  findEnvironmentVariable,
  findEnvironmentVariablesForGroup,
} from "../models/environment_variable";
import {
  Context,
  CreateEnvironmentVariableMutation,
  EnvironmentVariable,
  GroupIdQuery,
  IdQuery,
} from "../types";
import { ensureGroupAccess } from "./utils";

/**
 * @returns New environment variable record
 */
export const createEnvironmentVariableResolver = async (
  _: Record<string, unknown>,
  { group_id, name, value }: CreateEnvironmentVariableMutation,
  { logger, teams }: Context
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("createEnvironmentVariableResolver");
  log.debug("group", group_id);

  const team = await ensureGroupAccess({ group_id, logger, teams });

  return createEnvironmentVariable(
    { group_id, name, team_id: team.id, value },
    { logger }
  );
};

/**
 * @returns Deleted environment variable record
 */
export const deleteEnvironmentVariableResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("deleteEnvironmentVariableResolver");
  log.debug(id);

  return db.transaction(async (trx) => {
    const environmentVariable = await findEnvironmentVariable(id, {
      logger,
      trx,
    });

    await ensureGroupAccess({
      group_id: environmentVariable.group_id,
      logger,
      teams,
    });

    await deleteEnvironmentVariable(id, { logger, trx });

    return environmentVariable;
  });
};

export const environmentVariablesResolver = async (
  _: Record<string, unknown>,
  { group_id }: GroupIdQuery,
  { logger, teams }: Context
): Promise<{ env: string; variables: EnvironmentVariable[] }> => {
  const log = logger.prefix("environmentVariablesResolver");
  log.debug("group", group_id);

  return db.transaction(async (trx) => {
    const team = await ensureGroupAccess({ group_id, logger, teams, trx });

    // Get all env variable records for this group sorted by name ascending
    const variables = await findEnvironmentVariablesForGroup(group_id, {
      logger,
      trx,
    });

    // Look up env variable team defaults, merge with group variables,
    // and decrypt all values. `env` is a key:value JSON object (as string).
    const env = await buildEnvironmentVariablesForGroup(
      { group_id, group_variables: variables, team_id: team.id },
      { logger, trx }
    );

    return { env, variables };
  });
};

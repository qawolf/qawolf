import { db } from "../db";
import {
  buildEnvironmentVariables,
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  findEnvironmentVariable,
} from "../models/environment_variable";
import {
  Context,
  CreateEnvironmentVariableMutation,
  EnvironmentIdQuery,
  EnvironmentVariable,
  IdQuery,
} from "../types";
import { ensureEnvironmentAccess, ensureGroupAccess } from "./utils";

/**
 * @returns New environment variable record
 */
export const createEnvironmentVariableResolver = async (
  _: Record<string, unknown>,
  { environment_id, name, value }: CreateEnvironmentVariableMutation,
  { logger, teams }: Context
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("createEnvironmentVariableResolver");
  log.debug("environment", environment_id);

  const team = await ensureEnvironmentAccess({ environment_id, logger, teams });

  return createEnvironmentVariable(
    { environment_id, name, team_id: team.id, value },
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

    await ensureEnvironmentAccess({
      environment_id: environmentVariable.environment_id,
      logger,
      teams,
    });

    await deleteEnvironmentVariable(id, { logger, trx });

    return environmentVariable;
  });
};

export const environmentVariablesResolver = async (
  _: Record<string, unknown>,
  { environment_id }: EnvironmentIdQuery,
  { logger, teams }: Context
): Promise<{ env: string; variables: EnvironmentVariable[] }> => {
  const log = logger.prefix("environmentVariablesResolver");
  log.debug("environment", environment_id);

  return db.transaction(async (trx) => {
    await ensureEnvironmentAccess({ environment_id, logger, teams, trx });

    return buildEnvironmentVariables({ environment_id }, { logger, trx });
  });
};

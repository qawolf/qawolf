import {
  buildEnvironmentVariables,
  createEnvironmentVariable,
  deleteEnvironmentVariable,
  findEnvironmentVariable,
  updateEnvironmentVariable,
} from "../models/environment_variable";
import {
  Context,
  CreateEnvironmentVariableMutation,
  EnvironmentIdQuery,
  EnvironmentVariable,
  IdQuery,
  UpdateEnvironmentVariableMutation,
} from "../types";
import {
  ensureEnvironmentAccess,
  ensureEnvironmentVariableAccess,
} from "./utils";

/**
 * @returns New environment variable record
 */
export const createEnvironmentVariableResolver = async (
  _: Record<string, unknown>,
  { environment_id, name, value }: CreateEnvironmentVariableMutation,
  { db, logger, teams }: Context
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("createEnvironmentVariableResolver");
  log.debug("environment", environment_id);

  const team = await ensureEnvironmentAccess(
    { environment_id, teams },
    { db, logger }
  );

  return createEnvironmentVariable(
    { environment_id, name, team_id: team.id, value },
    { db, logger }
  );
};

/**
 * @returns Deleted environment variable record
 */
export const deleteEnvironmentVariableResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("deleteEnvironmentVariableResolver");
  log.debug(id);

  return db.transaction(async (trx) => {
    const environmentVariable = await findEnvironmentVariable(id, {
      db: trx,
      logger,
    });

    await ensureEnvironmentAccess(
      {
        environment_id: environmentVariable.environment_id,
        teams,
      },
      { db, logger }
    );

    await deleteEnvironmentVariable(id, { db, logger });

    return environmentVariable;
  });
};

export const environmentVariablesResolver = async (
  _: Record<string, unknown>,
  { environment_id }: EnvironmentIdQuery,
  { db, logger, teams }: Context
): Promise<{ env: string; variables: EnvironmentVariable[] }> => {
  const log = logger.prefix("environmentVariablesResolver");
  log.debug("environment", environment_id);

  await ensureEnvironmentAccess({ environment_id, teams }, { db, logger });

  return buildEnvironmentVariables({ environment_id }, { db, logger });
};

export const updateEnvironmentVariableResolver = async (
  _: Record<string, unknown>,
  args: UpdateEnvironmentVariableMutation,
  { db, logger, teams }: Context
): Promise<EnvironmentVariable> => {
  const log = logger.prefix("updateEnvironmentVariableResolver");
  log.debug("variable", args.id);

  await ensureEnvironmentVariableAccess(
    { environment_variable_id: args.id, teams },
    { db, logger }
  );

  return updateEnvironmentVariable(args, { db, logger });
};

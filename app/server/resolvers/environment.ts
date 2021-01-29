import { db } from "../db";
import {
  createEnvironment,
  deleteEnvironment,
  findEnvironmentsForTeam,
  updateEnvironment,
} from "../models/environment";
import {
  Context,
  CreateEnvironmentMutation,
  Environment,
  IdQuery,
  TeamIdQuery,
  UpdateEnvironmentMutation,
} from "../types";
import { ensureEnvironmentAccess, ensureTeamAccess } from "./utils";

export const createEnvironmentResolver = async (
  _: Record<string, unknown>,
  { name, team_id }: CreateEnvironmentMutation,
  { logger, teams }: Context
): Promise<Environment> => {
  const log = logger.prefix("updateEnvironmentResolver");
  log.debug("create for team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return createEnvironment({ name, team_id }, { logger });
};

export const deleteEnvironmentResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<Environment> => {
  const log = logger.prefix("deleteEnvironmentResolver");
  log.debug("delete", id);

  await ensureEnvironmentAccess({ environment_id: id, logger, teams });

  return db.transaction(async (trx) => {
    return deleteEnvironment(id, { logger, trx });
  });
};

export const environmentsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { logger, teams }: Context
): Promise<Environment[]> => {
  const log = logger.prefix("environmentsResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return findEnvironmentsForTeam(team_id, { logger });
};

export const updateEnvironmentResolver = async (
  _: Record<string, unknown>,
  { id, name }: UpdateEnvironmentMutation,
  { logger, teams }: Context
): Promise<Environment> => {
  const log = logger.prefix("updateEnvironmentResolver");
  log.debug("environment", id);

  await ensureEnvironmentAccess({ environment_id: id, logger, teams });

  return db.transaction(async (trx) => {
    return updateEnvironment({ id, name }, { logger, trx });
  });
};

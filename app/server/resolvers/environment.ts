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
  { db, logger, teams }: Context
): Promise<Environment> => {
  const log = logger.prefix("createEnvironmentResolver");
  log.debug("create for team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return createEnvironment({ name, team_id }, { db, logger });
};

export const deleteEnvironmentResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Environment> => {
  const log = logger.prefix("deleteEnvironmentResolver");
  log.debug("delete", id);

  await ensureEnvironmentAccess({ environment_id: id, teams }, { db, logger });

  return deleteEnvironment(id, { db, logger });
};

export const environmentsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Environment[]> => {
  const log = logger.prefix("environmentsResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return findEnvironmentsForTeam(team_id, { db, logger });
};

export const updateEnvironmentResolver = async (
  _: Record<string, unknown>,
  { id, name }: UpdateEnvironmentMutation,
  { db, logger, teams }: Context
): Promise<Environment> => {
  const log = logger.prefix("updateEnvironmentResolver");
  log.debug("environment", id);

  await ensureEnvironmentAccess({ environment_id: id, teams }, { db, logger });

  return updateEnvironment({ id, name }, { db, logger });
};

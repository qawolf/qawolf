import { update } from "lodash";
import {
  findEnvironmentsForTeam,
  updateEnvironment,
} from "../models/environment";
import {
  Context,
  Environment,
  TeamIdQuery,
  UpdateEnvironmentMutation,
} from "../types";
import { ensureEnvironmentAccess, ensureTeamAccess } from "./utils";

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

  ensureEnvironmentAccess({ environment_id: id, logger, teams });

  return updateEnvironment({ id, name }, { logger });
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Transaction } from "knex";

import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { findEnvironment } from "../models/environment";
import { findEnvironmentVariable } from "../models/environment_variable";
import { findGroup } from "../models/group";
import { findSuite } from "../models/suite";
import { findTest } from "../models/test";
import { Team, Test, User } from "../types";

type EnsureEnvironmentAccess = {
  environment_id: string;
  logger: Logger;
  teams: Team[] | null;
  trx?: Transaction;
};

type EnsureEnvironmentVariableAccess = {
  environment_variable_id: string;
  logger: Logger;
  teams: Team[] | null;
  trx?: Transaction;
};

type EnsureGroupAccess = {
  group_id: string;
  logger: Logger;
  teams: Team[] | null;
  trx?: Transaction;
};

type EnsureSuiteAccess = {
  logger: Logger;
  suite_id: string;
  teams: Team[] | null;
};

type EnsureTeams = {
  logger: Logger;
  teams: Team[] | null;
};

type EnsureTeamAccess = {
  logger: Logger;
  team_id: string;
  teams: Team[] | null;
};

type EnsureTestAccess = {
  logger: Logger;
  teams: Team[] | null;
  test?: Test;
  test_id?: string;
};

type EnsureUser = {
  logger: Logger;
  user: User | null;
};

/**
 * @summary Throws if `teams` is falsy
 * @returns `teams`
 */
export const ensureTeams = ({ logger, teams }: EnsureTeams): Team[] => {
  const log = logger.prefix("ensureTeams");

  if (!teams) {
    log.error("teams not provided");
    throw new AuthenticationError("no teams");
  }

  return teams;
};

export const ensureEnvironmentAccess = async ({
  environment_id,
  logger,
  teams,
  trx,
}: EnsureEnvironmentAccess): Promise<Team> => {
  const log = logger.prefix("ensureEnvironmentAccess");

  const teamIds = ensureTeams({ teams, logger }).map((team) => team.id);
  log.debug("ensure teams", teamIds, "can access environment", environment_id);

  const environment = await findEnvironment(environment_id, { logger, trx });
  const selectedTeam = teams!.find((team) => environment.team_id === team.id);

  if (!selectedTeam) {
    log.error("teams", teamIds, "cannot access environment", environment_id);
    throw new AuthenticationError("cannot access environment");
  }

  return selectedTeam;
};

export const ensureEnvironmentVariableAccess = async ({
  environment_variable_id,
  logger,
  teams,
  trx,
}: EnsureEnvironmentVariableAccess): Promise<Team> => {
  const log = logger.prefix("ensureEnvironmentVariableAccess");

  const teamIds = ensureTeams({ teams, logger }).map((team) => team.id);
  log.debug(
    "ensure teams",
    teamIds,
    "can access environment variable",
    environment_variable_id
  );

  const variable = await findEnvironmentVariable(environment_variable_id, {
    logger,
    trx,
  });
  const selectedTeam = teams!.find((team) => variable.team_id === team.id);

  if (!selectedTeam) {
    log.error(
      "teams",
      teamIds,
      "cannot access environment variable",
      environment_variable_id
    );
    throw new AuthenticationError("cannot access environment variable");
  }

  return selectedTeam;
};

export const ensureGroupAccess = async ({
  group_id,
  logger,
  teams,
  trx,
}: EnsureGroupAccess): Promise<Team> => {
  const log = logger.prefix("ensureGroupAccess");

  const teamIds = ensureTeams({ teams, logger }).map((team) => team.id);
  log.debug("ensure teams", teamIds, "can access group", group_id);

  const group = await findGroup(group_id, { logger, trx });
  const selectedTeam = teams!.find((team) => group.team_id === team.id);

  if (!selectedTeam) {
    log.error("teams", teamIds, "cannot access group", group_id);
    throw new AuthenticationError("cannot access group");
  }

  return selectedTeam;
};

/**
 * @summary Throws if `teams` is falsy or doesn't include `suite.team_id`. Can also
 *   throw if `suite_id` doesn't match any suite.
 * @returns The team from `teams` that matches `suite.team_id`, if we didn't throw.
 */
export const ensureSuiteAccess = async ({
  logger,
  teams,
  suite_id,
}: EnsureSuiteAccess): Promise<void> => {
  const log = logger.prefix("ensureSuiteAccess");

  const teamIds = ensureTeams({ logger, teams }).map((team) => team.id);

  log.debug("ensure teams", teamIds, "can access suite", suite_id);

  const suite = await findSuite(suite_id, { logger });

  if (!teamIds.includes(suite.team_id)) {
    log.error("teams", teamIds, "cannot access suite", suite_id);
    throw new Error("Teams cannot access suite");
  }
};

/**
 * @summary Throws if `teams` is falsy or doesn't include `team_id`
 * @returns The team from `teams` that matches `team_id`, if we didn't throw.
 */
export const ensureTeamAccess = ({
  logger,
  team_id,
  teams,
}: EnsureTeamAccess): Team => {
  const log = logger.prefix("ensureTeamAccess");

  const teamIds = ensureTeams({ logger, teams }).map((team) => team.id);

  const selectedTeam = teams!.find((team) => team.id === team_id);
  if (!selectedTeam) {
    log.error("teams", teamIds, "cannot access team", team_id);
    throw new AuthenticationError("cannot access team");
  }

  log.debug("ensured teams", teamIds, "can access team", team_id);

  return selectedTeam;
};

/**
 * @summary Throws if `teams` is falsy or doesn't include `test.team_id`. Can also
 *   throw if `test_id` doesn't match any test.
 * @returns The team from `teams` that matches `test.team_id`, if we didn't throw.
 */
export const ensureTestAccess = async ({
  logger,
  teams,
  test,
  test_id,
}: EnsureTestAccess): Promise<Team> => {
  const log = logger.prefix("ensureTestAccess");

  const finalTeams = ensureTeams({ logger, teams });
  const teamIds = finalTeams.map((t) => t.id);

  log.debug("ensure teams", teamIds, "can access test", test?.id || test_id);

  const finalTest = test || (await findTest(test_id, { logger }));
  const team = finalTeams.find((t) => finalTest.team_id === t.id);

  if (!team) {
    log.error("teams", teamIds, "cannot access test", test?.id || test_id);
    throw new AuthenticationError("cannot access test");
  }

  return team;
};

/**
 * @summary Throws if `user` is falsy
 * @returns `user` if we didn't throw
 */
export const ensureUser = ({ logger, user }: EnsureUser): User => {
  const log = logger.prefix("ensureUser");

  if (!user) {
    log.error("user not provided");
    throw new AuthenticationError("no user");
  }

  return user;
};

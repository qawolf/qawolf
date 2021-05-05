/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { findEnvironment } from "../models/environment";
import { findEnvironmentVariable } from "../models/environment_variable";
import { findSuite } from "../models/suite";
import { findGroup } from "../models/tag";
import { findTest } from "../models/test";
import { findTrigger } from "../models/trigger";
import { ModelOptions, Team, Test, User } from "../types";

type EnsureEnvironmentAccess = {
  environment_id: string;
  teams: Team[] | null;
};

type EnsureEnvironmentVariableAccess = {
  environment_variable_id: string;
  teams: Team[] | null;
};

type EnsureGroupAccess = {
  group_id: string;
  teams: Team[] | null;
};

type EnsureSuiteAccess = {
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
  teams: Team[] | null;
  test?: Test;
  test_id?: string;
};

type EnsureTriggerAccess = {
  teams: Team[] | null;
  trigger_id: string;
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

export const ensureEnvironmentAccess = async (
  { environment_id, teams }: EnsureEnvironmentAccess,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("ensureEnvironmentAccess");

  const teamIds = ensureTeams({ teams, logger }).map((team) => team.id);
  log.debug("ensure teams", teamIds, "can access environment", environment_id);

  const environment = await findEnvironment(environment_id, { db, logger });
  const teamForEnvironment = teams!.find(
    (team) => environment.team_id === team.id
  );

  if (!teamForEnvironment) {
    log.error("teams", teamIds, "cannot access environment", environment_id);
    throw new AuthenticationError("cannot access environment");
  }

  return teamForEnvironment;
};

export const ensureEnvironmentVariableAccess = async (
  { environment_variable_id, teams }: EnsureEnvironmentVariableAccess,
  options: ModelOptions
): Promise<Team> => {
  const log = options.logger.prefix("ensureEnvironmentVariableAccess");

  const teamIds = ensureTeams({ teams, logger: log }).map((team) => team.id);
  log.debug(
    "ensure teams",
    teamIds,
    "can access environment variable",
    environment_variable_id
  );

  const variable = await findEnvironmentVariable(
    environment_variable_id,
    options
  );
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

export const ensureGroupAccess = async (
  { group_id, teams }: EnsureGroupAccess,
  options: ModelOptions
): Promise<Team> => {
  const log = options.logger.prefix("ensureGroupAccess");

  const teamIds = ensureTeams({ teams, logger: log }).map((team) => team.id);
  log.debug("ensure teams", teamIds, "can access group", group_id);

  const group = await findGroup(group_id, options);
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
export const ensureSuiteAccess = async (
  { suite_id, teams }: EnsureSuiteAccess,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("ensureSuiteAccess");

  const teamIds = ensureTeams({ logger: options.logger, teams }).map(
    (team) => team.id
  );

  log.debug("ensure teams", teamIds, "can access suite", suite_id);

  const suite = await findSuite(suite_id, options);

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
export const ensureTestAccess = async (
  { teams, test, test_id }: EnsureTestAccess,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("ensureTestAccess");

  const finalTeams = ensureTeams({ logger, teams });
  const teamIds = finalTeams.map((t) => t.id);

  log.debug("ensure teams", teamIds, "can access test", test?.id || test_id);

  const finalTest = test || (await findTest(test_id, { db, logger }));
  const team = finalTeams.find((t) => finalTest.team_id === t.id);

  if (!team) {
    log.error("teams", teamIds, "cannot access test", test?.id || test_id);
    throw new AuthenticationError("cannot access test");
  }

  return team;
};

export const ensureTriggerAccess = async (
  { teams, trigger_id }: EnsureTriggerAccess,
  { db, logger }: ModelOptions
): Promise<Team> => {
  const log = logger.prefix("ensureTriggerAccess");

  const teamIds = ensureTeams({ teams, logger }).map((team) => team.id);
  log.debug("ensure teams", teamIds, "can access trigger", trigger_id);

  const trigger = await findTrigger(trigger_id, { db, logger });
  const selectedTeam = teams!.find((team) => trigger.team_id === team.id);

  if (!selectedTeam) {
    log.error("teams", teamIds, "cannot access trigger", trigger_id);
    throw new AuthenticationError("cannot access trigger");
  }

  return selectedTeam;
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

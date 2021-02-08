import { db } from "../db";
import { ClientError } from "../errors";
import {
  createSuiteForTests,
  findSuite,
  findSuitesForGroup,
} from "../models/suite";
import { findEnabledTestsForGroup } from "../models/test";
import { findGroup } from "../models/trigger";
import {
  Context,
  CreateSuiteMutation,
  GroupIdQuery,
  IdQuery,
  Suite,
} from "../types";
import { ensureGroupAccess, ensureSuiteAccess, ensureUser } from "./utils";

const SUITES_LIMIT = 50;

/**
 * @returns The created suite ID
 */
export const createSuiteResolver = async (
  _: Record<string, unknown>,
  { group_id, test_ids }: CreateSuiteMutation,
  { logger, teams, user: contextUser }: Context
): Promise<string> => {
  const log = logger.prefix("createSuiteResolver");
  const user = ensureUser({ logger, user: contextUser });

  log.debug(`creator ${user.id} and group ${group_id}`);

  const team = await ensureGroupAccess({
    group_id,
    logger,
    teams,
  });

  if (!team.is_enabled) {
    log.error("team disabled", team.id);
    throw new ClientError("team disabled, please contact support");
  }

  const suite = await db.transaction(async (trx) => {
    const tests = await findEnabledTestsForGroup(
      { group_id, test_ids },
      { logger, trx }
    );
    if (!tests.length) {
      log.error("no tests for group", group_id);
      throw new ClientError("no tests to run");
    }

    const { suite } = await createSuiteForTests(
      {
        creator_id: user.id,
        group_id,
        team_id: team.id,
        tests,
      },
      { logger, trx }
    );

    return suite;
  });

  log.debug("created", suite.id);

  return suite.id;
};

export const suiteResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<Suite> => {
  const log = logger.prefix("suiteResolver");

  log.debug("suite", id);
  await ensureSuiteAccess({ logger, suite_id: id, teams });

  return db.transaction(async (trx) => {
    const suite = await findSuite(id, { logger });
    // throws an error if group deleted
    await findGroup(suite.group_id, { logger, trx });

    return suite;
  });
};

/**
 * @returns All suites for a single group, up to SUITES_LIMIT, most recent first.
 */
export const suitesResolver = async (
  { group_id }: GroupIdQuery,
  _: Record<string, unknown>,
  { logger, teams }: Context
): Promise<Suite[]> => {
  const log = logger.prefix("suitesResolver");

  log.debug("group", group_id);

  await ensureGroupAccess({ logger, group_id, teams });

  return findSuitesForGroup(
    {
      group_id,
      limit: SUITES_LIMIT,
    },
    logger
  );
};

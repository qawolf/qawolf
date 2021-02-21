import { ClientError } from "../errors";
import { decrypt } from "../models/encrypt";
import {
  createSuiteForTests,
  findSuite,
  findSuitesForTrigger,
} from "../models/suite";
import { findEnabledTestsForTrigger } from "../models/test";
import { findTrigger } from "../models/trigger";
import {
  Context,
  CreateSuiteMutation,
  IdQuery,
  Suite,
  SuiteResult,
  TriggerIdQuery,
} from "../types";
import { ensureSuiteAccess, ensureTriggerAccess, ensureUser } from "./utils";

const SUITES_LIMIT = 50;

/**
 * @returns The created suite ID
 */
export const createSuiteResolver = async (
  _: Record<string, unknown>,
  { test_ids, trigger_id }: CreateSuiteMutation,
  { db, logger, teams, user: contextUser }: Context
): Promise<string> => {
  const log = logger.prefix("createSuiteResolver");
  const user = ensureUser({ logger, user: contextUser });

  log.debug(`creator ${user.id} and trigger ${trigger_id}`);

  const team = await ensureTriggerAccess({ teams, trigger_id }, { db, logger });

  if (!team.is_enabled) {
    log.error("team disabled", team.id);
    throw new ClientError("team disabled, please contact support");
  }

  const suite = await db.transaction(async (trx) => {
    const tests = await findEnabledTestsForTrigger(
      { test_ids, trigger_id },
      { db: trx, logger }
    );
    if (!tests.length) {
      log.error("no tests for trigger", trigger_id);
      throw new ClientError("no tests to run");
    }

    const { suite } = await createSuiteForTests(
      {
        creator_id: user.id,
        team_id: team.id,
        tests,
        trigger_id,
      },
      { db: trx, logger }
    );

    return suite;
  });

  log.debug("created", suite.id);

  return suite.id;
};

export const suiteResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<SuiteResult> => {
  const log = logger.prefix("suiteResolver");

  log.debug("suite", id);
  await ensureSuiteAccess({ suite_id: id, teams }, { db, logger });

  const suite = await findSuite(id, { db, logger });
  // throws an error if trigger deleted
  const trigger = await findTrigger(suite.trigger_id, { db, logger });

  return {
    ...suite,
    environment_id: trigger.environment_id,
    environment_variables: suite.environment_variables
      ? decrypt(suite.environment_variables)
      : null,
    trigger_color: trigger.color,
    trigger_name: trigger.name,
  };
};

/**
 * @returns All suites for a single trigger, up to SUITES_LIMIT, most recent first.
 */
export const suitesResolver = async (
  { trigger_id }: TriggerIdQuery,
  _: Record<string, unknown>,
  { db, logger, teams }: Context
): Promise<Suite[]> => {
  const log = logger.prefix("suitesResolver");

  log.debug("trigger", trigger_id);

  await ensureTriggerAccess({ teams, trigger_id }, { db, logger });

  return findSuitesForTrigger(
    {
      limit: SUITES_LIMIT,
      trigger_id,
    },
    { db, logger }
  );
};

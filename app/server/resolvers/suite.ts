import { ClientError } from "../errors";
import { decrypt } from "../models/encrypt";
import {
  createSuiteForTests,
  findSuite,
  findSuitesForTrigger,
} from "../models/suite";
import { findEnabledTests } from "../models/test";
import { findTrigger } from "../models/trigger";
import {
  Context,
  CreateSuiteMutation,
  IdQuery,
  Suite,
  SuiteResult,
  Trigger,
  TriggerIdQuery,
} from "../types";
import {
  ensureEnvironmentAccess,
  ensureSuiteAccess,
  ensureTestAccess,
  ensureTriggerAccess,
  ensureUser,
} from "./utils";

const SUITES_LIMIT = 50;

/**
 * @returns The created suite ID
 */
export const createSuiteResolver = async (
  _: Record<string, unknown>,
  { environment_id, test_ids }: CreateSuiteMutation,
  { db, logger, teams, user: contextUser }: Context
): Promise<string> => {
  const log = logger.prefix("createSuiteResolver");
  const user = ensureUser({ logger, user: contextUser });

  log.debug(`creator ${user.id} and environment ${environment_id}`);

  if (environment_id) {
    await ensureEnvironmentAccess({ environment_id, teams }, { db, logger });
  }

  const testTeams = await Promise.all(
    test_ids.map((test_id) => {
      return ensureTestAccess({ teams, test_id }, { db, logger });
    })
  );
  const teamIds = testTeams.map((t) => t.id);

  if (Array.from(new Set(teamIds)).length > 1) {
    log.error("cannot create suite for multiple teams", teamIds);
    throw new Error("tests on different teams");
  }

  if (testTeams[0] && !testTeams[0].is_enabled) {
    log.error("team disabled", testTeams.find((t) => !t.is_enabled)?.id);
    throw new ClientError("team disabled, please contact support");
  }

  const suite = await db.transaction(async (trx) => {
    const tests = await findEnabledTests(test_ids, { db: trx, logger });

    if (!tests.length) {
      log.error("no tests for test_ids", test_ids);
      throw new ClientError("no tests to run");
    }

    const { suite } = await createSuiteForTests(
      {
        creator_id: user.id,
        environment_id,
        team_id: testTeams[0].id,
        tests,
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
  let trigger: Trigger | null = null;

  if (suite.trigger_id) {
    // TODO: do not throw error in find trigger if trigger deleted
    try {
      trigger = await findTrigger(suite.trigger_id, { db, logger });
    } catch (e) {
      trigger = null;
    }
  }

  return {
    ...suite,
    environment_variables: suite.environment_variables
      ? decrypt(suite.environment_variables)
      : null,
    trigger_color: trigger?.color || null,
    trigger_name: trigger?.name || null,
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

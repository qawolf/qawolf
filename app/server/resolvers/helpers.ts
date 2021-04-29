import { ClientError } from "../errors";
import { findRun } from "../models/run";
import { findSuite } from "../models/suite";
import { Context, HelpersQuery, ModelOptions, Team } from "../types";
import { ensureTestAccess } from "./utils";

type FindHelpersForRun = {
  run_id: string;
  teams: Team[];
};

type FindHelpersForTest = {
  teams: Team[];
  test_id: string;
};

export const findHelpersForRun = async (
  { run_id, teams }: FindHelpersForRun,
  { db, logger }: ModelOptions
): Promise<string> => {
  const log = logger.prefix("findHelpersForRun");
  log.debug("run", run_id);

  const run = await findRun(run_id, { db, logger });
  if (!run || !run.suite_id) {
    log.error(`run ${run_id} not found (suite ${run?.suite_id})`);
    throw new ClientError("suite not found");
  }

  await ensureTestAccess({ teams, test_id: run.test_id }, { db, logger });
  const suite = await findSuite(run.suite_id, { db, logger });

  return suite.helpers;
};

export const findHelpersForTest = async (
  { teams, test_id }: FindHelpersForTest,
  options: ModelOptions
): Promise<string> => {
  const team = await ensureTestAccess({ teams, test_id }, options);

  return team.helpers;
};

/**
 * @returns A string of the helpers for a run or test.
 */
export const helpersResolver = async (
  _: Record<string, unknown>,
  { run_id, test_id }: HelpersQuery,
  { db, logger, teams }: Context
): Promise<string> => {
  const log = logger.prefix("helpersResolver");
  log.debug("test", test_id, "run", run_id);

  if (!run_id && !test_id) {
    log.error("no run or test id passed");
    throw new ClientError("Must provide test_id or run_id");
  }

  if (run_id) return findHelpersForRun({ run_id, teams }, { db, logger });

  return findHelpersForTest({ teams, test_id }, { db, logger });
};

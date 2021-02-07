import { minutesFromNow } from "../../shared/utils";
import { db } from "../db";
import { AuthenticationError } from "../errors";
import {
  findRun,
  findRunsForSuite,
  findTestHistory,
  UpdateRun,
  updateRun,
} from "../models/run";
import { expireRunner, findRunner } from "../models/runner";
import {
  Context,
  IdQuery,
  ModelOptions,
  Run,
  Suite,
  SuiteRun,
  UpdateRunMutation,
} from "../types";
import { ensureSuiteAccess, ensureTestAccess } from "./utils";

type ValidateApiKey = {
  api_key: string | null;
  run: Run;
};

/**
 * @summary Checks that an API key is valid and allows mutating
 *   the given run.
 */
export const validateApiKey = async (
  { api_key, run }: ValidateApiKey,
  { logger, trx }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("validateApiKey");
  log.debug();

  if (!api_key) {
    log.error("no api key provided");
    throw new AuthenticationError("invalid api key");
  }

  const runner = await findRunner({ run_id: run.id }, { logger, trx });

  if (!runner || api_key !== runner.api_key) {
    log.error("incorrect api key for run", run?.id, "runner", runner?.id);
    throw new AuthenticationError("invalid api key");
  }
};

/**
 * @returns Array of SuiteRuns
 */
export const suiteRunsResolver = async (
  { id }: Suite,
  _: Record<string, unknown>,
  { logger, teams }: Context
): Promise<SuiteRun[]> => {
  logger.debug("suiteRunsResolver");
  await ensureSuiteAccess({ logger, teams, suite_id: id });

  return findRunsForSuite(id, { logger });
};

/**
 * @returns Array of Runs
 */
export const testHistoryResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { logger, teams }: Context
): Promise<Run[]> => {
  const log = logger.prefix("testHistoryResolver");
  log.debug("test", id);

  await ensureTestAccess({ logger, teams, test_id: id });

  return findTestHistory(id, { logger });
};

/**
 * @returns Updated run record
 */
export const updateRunResolver = async (
  _: Record<string, unknown>,
  { current_line, id, status }: UpdateRunMutation,
  { api_key, logger }: Context
): Promise<Run> => {
  const log = logger.prefix("updateRunResolver");
  log.debug(id);

  const updatedRun = await db.transaction(async (trx) => {
    const run = await findRun(id, { logger, trx });

    await validateApiKey({ api_key, run }, { logger, trx });

    const updates: UpdateRun = { id };

    if (status === "created") {
      updates.started_at = minutesFromNow();
    } else {
      updates.current_line = current_line;
      updates.status = status;
    }

    if (["fail", "pass"].includes(status)) {
      await expireRunner({ run_id: id }, { logger, trx });
    }

    return updateRun(updates, { logger });
  });

  return updatedRun;
};

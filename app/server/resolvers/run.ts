import { RunStatus } from "../../lib/types";
import { minutesFromNow } from "../../shared/utils";
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

type ShouldRetry = {
  error?: string;
  retries?: number;
  status: RunStatus;
};

type ValidateApiKey = {
  api_key: string | null;
  run: Run;
};

export const RETRY_ERRORS = ["page.goto: net::ERR_CONNECTION_REFUSED"];

export const shouldRetry = ({
  error,
  retries,
  status,
}: ShouldRetry): boolean => {
  return (
    status === "fail" &&
    !retries &&
    !!RETRY_ERRORS.find((e) => error?.trim().startsWith(e))
  );
};

/**
 * @summary Checks that an API key is valid and allows mutating
 *   the given run.
 */
export const validateApiKey = async (
  { api_key, run }: ValidateApiKey,
  { db, logger }: ModelOptions
): Promise<void> => {
  const log = logger.prefix("validateApiKey");
  log.debug();

  if (!api_key) {
    log.error("no api key provided");
    throw new AuthenticationError("invalid api key");
  }

  const runner = await findRunner({ run_id: run.id }, { db, logger });

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
  { db, logger, teams }: Context
): Promise<SuiteRun[]> => {
  logger.debug("suiteRunsResolver");
  await ensureSuiteAccess({ suite_id: id, teams }, { db, logger });

  return findRunsForSuite(id, { db, logger });
};

/**
 * @returns Array of Runs
 */
export const testHistoryResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Run[]> => {
  const log = logger.prefix("testHistoryResolver");
  log.debug("test", id);

  await ensureTestAccess({ teams, test_id: id }, { db, logger });

  return findTestHistory(id, { db, logger });
};

/**
 * @returns Updated run record
 */
export const updateRunResolver = async (
  _: Record<string, unknown>,
  { current_line, error, id, status }: UpdateRunMutation,
  { api_key, db, logger }: Context
): Promise<Run> => {
  const log = logger.prefix("updateRunResolver");
  log.debug(id);

  const updatedRun = await db.transaction(async (trx) => {
    const run = await findRun(id, { db: trx, logger });

    await validateApiKey({ api_key, run }, { db: trx, logger });

    const updates: UpdateRun = { error, id };

    if (shouldRetry({ error, retries: run.retries, status })) {
      updates.retries = (run.retries || 0) + 1;
      updates.started_at = null;
      updates.status = "created";
      log.alert("retry error", error.substring(0, 100));
    } else if (status === "created") {
      updates.started_at = minutesFromNow();
    } else {
      updates.current_line = current_line;
      updates.error = error || null;
      updates.status = status;
    }

    // update the run before expiring the runner
    // to avoid the run from being marked as expired
    const updatedRun = await updateRun(updates, { db: trx, logger });

    if (["fail", "pass"].includes(status)) {
      await expireRunner({ run_id: id }, { db: trx, logger });
    }

    return updatedRun;
  });

  return updatedRun;
};

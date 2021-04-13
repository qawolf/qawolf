import { RunStatus } from "../../lib/types";
import { minutesFromNow } from "../../shared/utils";
import { AuthenticationError } from "../errors";
import {
  countRunsForTeam,
  findRun,
  findRunsForSuite,
  findStatusCountsForSuite,
  findTestHistory,
  UpdateRun,
  updateRun,
} from "../models/run";
import { findRunner, resetRunner } from "../models/runner";
import {
  Context,
  IdQuery,
  ModelOptions,
  Run,
  StatusCounts,
  Suite,
  SuiteRun,
  TeamIdQuery,
  UpdateRunMutation,
} from "../types";
import { ensureTeamAccess, ensureTestAccess } from "./utils";

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
 * @returns Count of runs since team was renewed
 */
export const runCountResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<number> => {
  const log = logger.prefix("runCountResolver");
  log.debug("team", team_id);

  const team = ensureTeamAccess({ logger, team_id, teams });

  return countRunsForTeam(team, { db, logger });
};

/**
 * @returns StatusCounts for a suite
 */
export const statusCountsResolver = async (
  { id }: Suite,
  _: Record<string, unknown>,
  { db, logger }: Context
): Promise<StatusCounts> => {
  logger.debug("statusCountsResolver: suite", id);
  // access check not needed since done in the parent query

  return findStatusCountsForSuite(id, { db, logger });
};

/**
 * @returns Array of SuiteRuns
 */
export const suiteRunsResolver = async (
  { id }: Suite,
  _: Record<string, unknown>,
  { db, logger }: Context
): Promise<SuiteRun[]> => {
  logger.debug("suiteRunsResolver: suite", id);
  // access check not needed since done in the parent query

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
    if (!run) throw new Error("run not found");

    await validateApiKey({ api_key, run }, { db: trx, logger });

    const updates: UpdateRun = { id };
    if (shouldRetry({ error, retries: run.retries, status })) {
      updates.retry_error = error;
    } else if (status === "created") {
      updates.started_at = minutesFromNow();
    } else {
      updates.current_line = current_line;
      updates.error = status === "pass" ? null : error || null;
      updates.status = status;
    }

    // update the run before resetRunner
    // otherwise the run will be marked as expired
    const updatedRun = await updateRun(updates, { db: trx, logger });

    if (["fail", "pass"].includes(status)) {
      await resetRunner({ run_id: id, type: "expire" }, { db: trx, logger });
    }

    return updatedRun;
  });

  return updatedRun;
};

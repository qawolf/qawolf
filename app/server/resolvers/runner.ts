import axios from "axios";

import { minutesFromNow } from "../../shared/utils";
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { findRun, findSuiteRunForRunner } from "../models/run";
import {
  assignRunner,
  findPendingTestOrRunId,
  findRunner,
  requestRunnerForTest,
  UpdateRunner,
  updateRunner,
} from "../models/runner";
import { findTest } from "../models/test";
import {
  Context,
  RunnerResult,
  RunnerRun,
  UpdateRunnerMutation,
} from "../types";
import { buildRunnerStatusUrl, buildRunnerWsUrl, RunnerUrl } from "../utils";
import { ensureTeams, ensureTestAccess, ensureUser } from "./utils";

type AuthenticateRunner = RunnerUrl & {
  api_key: string;
};

type RunnerQuery = {
  request_test_runner?: boolean;
  run_id?: string;
  test_id?: string;
};

export const authenticateRunner = async (
  options: AuthenticateRunner,
  logger: Logger
): Promise<void> => {
  const log = logger.prefix("authenticateRunner");

  try {
    const statusUrl = buildRunnerStatusUrl(options);
    await axios.get(statusUrl, {
      headers: { authorization: options.api_key },
    });
  } catch (error) {
    log.error("invalid api key", error.response);
    throw new AuthenticationError("invalid api key");
  }
};

export const runnerResolver = async (
  _: Record<string, unknown>,
  { request_test_runner, run_id, test_id }: RunnerQuery,
  { db, ip, logger, user: contextUser, teams }: Context
): Promise<RunnerResult | null> => {
  const log = logger.prefix("runnerResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeams({ logger, teams });
  log.debug(user.id);

  const run = run_id ? await findRun(run_id, { db, logger }) : null;
  const testId = run?.test_id || test_id;
  if (!testId) throw new Error(`test not found ${testId}`);

  return db.transaction(async (trx) => {
    const test = await findTest(testId, { db: trx, logger });
    await ensureTestAccess({ teams, test }, { db: trx, logger });

    let runner = await findRunner(
      run_id && !request_test_runner ? { run_id } : { test_id: testId },
      { db: trx, logger }
    );

    // extend the session
    if (runner && request_test_runner) {
      await updateRunner(
        { id: runner.id, session_expires_at: minutesFromNow(10) },
        { db: trx, logger }
      );
    }

    // if there is no runner, request one for the test
    if (!runner && request_test_runner) {
      runner = await requestRunnerForTest({ ip, test }, { db: trx, logger });
    }

    if (runner) {
      return {
        api_key: runner.api_key,
        ws_url: buildRunnerWsUrl(runner),
      };
    }

    return null;
  });
};

/**
 * @returns The assigned RunnerRun.
 */
export const updateRunnerResolver = async (
  _: Record<string, unknown>,
  options: UpdateRunnerMutation,
  { api_key, db, logger }: Context
): Promise<RunnerRun | null> => {
  const log = logger.prefix("updateRunnerResolver");
  log.debug(options);

  const { id, is_healthy, is_ready } = options;

  const timestamp = minutesFromNow();

  const runner = await findRunner(
    { id, include_deleted: true },
    { db, logger }
  );
  if (!runner) throw new Error("Runner not found");

  if (runner.deleted_at) {
    logger.debug("skip update: runner is deleted", id, runner.deleted_at);
    return null;
  }

  let runnerUpdates: UpdateRunner;

  if (is_ready) {
    if (!api_key) throw new Error("must provide api_key");

    await authenticateRunner(
      { api_key, id, location: runner.location },
      logger
    );

    runnerUpdates = {
      api_key,
      health_checked_at: timestamp,
      id,
      ready_at: timestamp,
    };
  } else if (is_healthy) {
    if (api_key !== runner.api_key) {
      log.error("invalid api key for runner", id);
      throw new AuthenticationError("invalid api key");
    }

    if (!runner.ready_at) {
      // avoid an issue where a runner could be restarting but issues a health check
      log.debug("skip health check: runner is not ready");
      return null;
    }

    runnerUpdates = { health_checked_at: timestamp, id };
  } else {
    throw new Error("Must provide a status update");
  }

  try {
    await updateRunner(runnerUpdates, { db, logger });
  } catch (error) {
    // the runner could be deleted, handle that gracefully
    if (error.message.includes("runner not found")) return null;

    throw error;
  }

  let runId = runner.run_id;

  // assign the runner if its session has not been
  if (!runner.session_expires_at) {
    const pending = await findPendingTestOrRunId(runner.location, {
      db,
      logger,
    });

    if (pending?.test_id) {
      await assignRunner({ runner, test_id: pending.test_id }, { db, logger });
    } else if (pending?.run_id) {
      const updatedRunner = await assignRunner(
        { run_id: pending.run_id, runner },
        { db, logger }
      );
      if (updatedRunner?.run_id) runId = updatedRunner?.run_id;
    }
  }

  if (runId) {
    return findSuiteRunForRunner(runId, { db, logger });
  }

  return null;
};

import axios from "axios";

import { db } from "../db";
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { findRun, findSuiteRunForRunner } from "../models/run";
import {
  assignRunner,
  findPendingTestOrRunId,
  findRunner,
  requestRunnerForTest,
  updateRunner,
} from "../models/runner";
import { findTest } from "../models/test";
import {
  Context,
  Runner,
  RunnerResult,
  RunnerRun,
  UpdateRunnerMutation,
} from "../types";
import {
  buildRunnerStatusUrl,
  buildRunnerWsUrl,
  minutesFromNow,
  RunnerUrl,
} from "../utils";
import { ensureTeams, ensureTestAccess, ensureUser } from "./utils";

type AuthenticateRunner = RunnerUrl & {
  api_key: string;
};

type RunnerQuery = {
  run_id?: string;
  should_request_runner?: boolean;
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
  { run_id, should_request_runner, test_id }: RunnerQuery,
  { ip, logger, user: contextUser, teams }: Context
): Promise<RunnerResult | null> => {
  const log = logger.prefix("runnerResolver");

  const user = ensureUser({ logger, user: contextUser });
  ensureTeams({ logger, teams });
  log.debug(user.id);

  const run = run_id ? await findRun(run_id, { logger }) : null;

  const testId = run?.test_id || test_id;
  if (!testId) throw new Error(`test not found ${testId}`);

  return db.transaction(async (trx) => {
    const test = await findTest(testId, { logger, trx });
    await ensureTestAccess({ logger, teams, test });

    let runner: Runner;

    // find the runner for the run
    if (run) {
      runner = await findRunner({ run_id: run.id }, { logger, trx });
    }

    // otherwise find the runner for the test
    if (!runner) {
      runner = await findRunner({ test_id: test.id }, { logger, trx });
    }

    // fallback to requesting a runner for the test
    if (!runner && should_request_runner) {
      runner = await requestRunnerForTest({ ip, test }, { logger, trx });
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
  { api_key, logger }: Context
): Promise<RunnerRun | null> => {
  const log = logger.prefix("updateRunnerResolver");
  log.debug(options);

  const { id, is_healthy, is_ready } = options;

  const timestamp = minutesFromNow();

  const runner = await findRunner({ id, include_deleted: true }, { logger });
  if (!runner) throw new Error("Runner not found");

  if (runner.deleted_at) {
    logger.debug("skip update: runner is deleted", id, runner.deleted_at);
    return null;
  }

  if (is_ready) {
    if (!api_key) throw new Error("must provide api_key");

    await authenticateRunner(
      { api_key, id, location: runner.location },
      logger
    );

    await updateRunner(
      {
        api_key,
        health_checked_at: timestamp,
        id,
        ready_at: timestamp,
      },
      { logger }
    );
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

    await updateRunner({ health_checked_at: timestamp, id }, { logger });
  } else {
    throw new Error("Must provide a status update");
  }

  let runId = runner.run_id;

  // assign the runner if there is a pending test or run
  if (!runner.run_id && !runner.test_id) {
    const pending = await findPendingTestOrRunId(runner.location, { logger });

    if (pending?.test_id) {
      await assignRunner({ runner, test_id: pending.test_id }, { logger });
    } else if (pending?.run_id) {
      const updatedRunner = await assignRunner(
        { run_id: pending.run_id, runner },
        { logger }
      );
      if (updatedRunner?.run_id) runId = updatedRunner?.run_id;
    }
  }

  if (runId) {
    return findSuiteRunForRunner(runId, { logger });
  }

  return null;
};

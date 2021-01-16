import { db } from "../db";
import environment from "../environment";
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { findRun, findRunsForSuite, UpdateRun, updateRun } from "../models/run";
import { expireRunner, findRunner } from "../models/runner";
import { postMessageToSlack } from "../services/alert/slack";
import {
  Context,
  InstrumentTestRunMutation,
  ModelOptions,
  Run,
  Suite,
  SuiteRun,
  UpdateRunMutation,
} from "../types";
import { minutesFromNow } from "../utils";
import { ensureSuiteAccess, ensureTestAccess, ensureUser } from "./utils";

type ValidateApiKey = {
  api_key: string | null;
  run: Run;
};

const postRunFailedMessageToSlack = async (
  run: Run,
  logger: Logger
): Promise<void> => {
  const log = logger.prefix("postRunFailedMessageToSlack");

  if (!environment.SLACK_UPDATES_WEBHOOK || run.status !== "fail") return;

  try {
    await postMessageToSlack({
      message: {
        text: `🚨 Run failure: run ${run.id} failed (test ${run.test_id})!`,
      },
      webhook_url: environment.SLACK_UPDATES_WEBHOOK,
    });

    log.debug("sent");
  } catch (error) {
    log.alert("could not send slack message", error.message);
  }
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
 * @summary Logs the run status and notifies us if a run fails
 */
export const instrumentTestRunResolver = async (
  _: Record<string, unknown>,
  { status, test_id }: InstrumentTestRunMutation,
  { logger, teams, user: contextUser }: Context
): Promise<boolean> => {
  const log = logger.prefix("instrumentTestRun");

  try {
    const user = ensureUser({ logger, user: contextUser });
    await ensureTestAccess({ logger, teams, test_id });

    if (status === "pass") {
      log.debug(`pass (test ${test_id})`);
    } else if (status === "fail") {
      log.debug(`fail (test ${test_id})`);
      if (!environment.SLACK_UPDATES_WEBHOOK) return true;

      await postMessageToSlack({
        message: {
          text: `🕵️‍♀️ Preview failure: ${user.email} (test ${test_id}, user ${user.id})!`,
        },
        webhook_url: environment.SLACK_UPDATES_WEBHOOK,
      });
    }

    return true;
  } catch (error) {
    log.alert(error.message);

    return false;
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
 * @returns Updated run record
 */
export const updateRunResolver = async (
  _: Record<string, unknown>,
  { current_line, id, status }: UpdateRunMutation,
  { api_key, logger }: Context
): Promise<Run> => {
  const log = logger.prefix("updateRunResolver");
  log.debug(id);

  return db.transaction(async (trx) => {
    const run = await findRun(id, { logger, trx });
    await validateApiKey({ api_key, run }, { logger, trx });

    // wait up to 100ms for message to post
    await Promise.race([
      postRunFailedMessageToSlack(run, logger),
      new Promise((resolve) => setTimeout(resolve, 100)),
    ]);

    const updates: UpdateRun = { id };

    if (status === "created") {
      updates.started_at = minutesFromNow();
    } else {
      updates.current_line = current_line;
      updates.status = status;
    }

    if (status === "pass") {
      await expireRunner({ run_id: id }, { logger, trx });
    }

    return updateRun(updates, { logger });
  });
};

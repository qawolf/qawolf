import { db } from "../db";
import environment from "../environment";
import { AuthenticationError } from "../errors";
import { Logger } from "../Logger";
import { findRun, findRunsForSuite, UpdateRun, updateRun } from "../models/run";
import { expireRunner, findRunner } from "../models/runner";
import { postMessageToSlack } from "../services/alert/slack";
import {
  Context,
  ModelOptions,
  Run,
  Suite,
  SuiteRun,
  UpdateRunMutation,
} from "../types";
import { minutesFromNow } from "../utils";
import { ensureSuiteAccess } from "./utils";

type ValidateApiKey = {
  api_key: string | null;
  run: Run;
};

const postRunFailedMessageToSlack = async (
  run: Run,
  logger: Logger
): Promise<void> => {
  if (!environment.SLACK_UPDATES_WEBHOOK) return;

  const log = logger.prefix("postRunFailedMessageToSlack");

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

  let postMessagePromise: Promise<unknown> = Promise.resolve();

  const updatedRun = await db.transaction(async (trx) => {
    const run = await findRun(id, { logger, trx });

    await validateApiKey({ api_key, run }, { logger, trx });

    if (status === "fail") {
      // wait up to 100ms for message to post
      postMessagePromise = Promise.race([
        postRunFailedMessageToSlack(run, logger),
        new Promise((resolve) => setTimeout(resolve, 100)),
      ]);
    }

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

  await postMessagePromise;

  return updatedRun;
};

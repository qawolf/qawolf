import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { db } from "../db";
import environment from "../environment";
import { Logger } from "../Logger";
import { createSuiteForTests } from "../models/suite";
import { validateApiKeyForTeam } from "../models/team";
import { findEnabledTestsForTrigger } from "../models/test";
import { findTrigger } from "../models/trigger";
import { Trigger } from "../types";

class AuthenticationError extends Error {
  code: number;

  constructor({ code, message }: { code: number; message: string }) {
    super(message);
    this.code = code;
  }
}

// errors example: https://stripe.com/docs/api/errors
const ensureTriggerAccess = async (
  req: NextApiRequest,
  logger: Logger
): Promise<Trigger> => {
  const log = logger.prefix("ensureTriggerAccess");

  const api_key = req.headers.authorization;
  const { trigger_id } = req.body;

  if (!api_key) {
    log.error("no api key provided");
    throw new AuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  if (!trigger_id) {
    log.error("no trigger id provided");
    throw new AuthenticationError({
      code: 400,
      message: "No trigger id provided",
    });
  }

  try {
    const trigger = await db.transaction(async (trx) => {
      const trigger = await findTrigger(trigger_id, { logger, trx });
      await validateApiKeyForTeam(
        { api_key, team_id: trigger.team_id },
        { logger, trx }
      );

      return trigger;
    });

    log.debug("no errors for trigger", trigger.id);
    return trigger;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("trigger not found");
      throw new AuthenticationError({
        code: 404,
        message: "Invalid trigger id",
      });
    }

    log.error("invalid api key");
    throw new AuthenticationError({
      code: 403,
      message: "API key cannot create suite",
    });
  }
};

export const handleSuitesRequest: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const logger = new Logger({ prefix: "handleSuitesRequest" });
  logger.debug("body", req.body);

  try {
    const { id: trigger_id, team_id } = await ensureTriggerAccess(req, logger);

    const body = await db.transaction(async (trx) => {
      const tests = await findEnabledTestsForTrigger(
        { trigger_id },
        { logger, trx }
      );
      if (!tests.length) {
        logger.error("no tests for trigger", trigger_id);
        throw new Error("No tests in trigger");
      }

      const { suite } = await createSuiteForTests(
        {
          environment_variables: req.body.env,
          team_id,
          trigger_id,
          tests,
        },
        { logger, trx }
      );

      const url = `${environment.APP_URL}/tests/${suite.id}`;
      return { url };
    });

    logger.debug("completed");
    res.status(200).send(body);
  } catch (error) {
    logger.alert("create suite error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};

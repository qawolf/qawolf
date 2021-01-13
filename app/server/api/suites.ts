import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { db } from "../db";
import environment from "../environment";
import { Logger } from "../Logger";
import { validateToken } from "../models/api_key";
import { findGroup } from "../models/group";
import { createSuiteForTests } from "../models/suite";
import { findEnabledTestsForGroup } from "../models/test";
import { Group } from "../types";

class AuthenticationError extends Error {
  code: number;

  constructor({ code, message }: { code: number; message: string }) {
    super(message);
    this.code = code;
  }
}

// errors example: https://stripe.com/docs/api/errors
const ensureGroupAccess = async (
  req: NextApiRequest,
  logger: Logger
): Promise<Group> => {
  const log = logger.prefix("ensureGroupAccess");

  const token = req.headers.authorization;
  const { group_id } = req.body;

  if (!token) {
    log.error("no token provided");
    throw new AuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  if (!group_id) {
    log.error("no group id provided");
    throw new AuthenticationError({
      code: 400,
      message: "No group id provided",
    });
  }

  try {
    const group = await db.transaction(async (trx) => {
      const group = await findGroup(group_id, { logger, trx });
      await validateToken({ team_id: group.team_id, token }, { logger, trx });

      return group;
    });

    log.debug("no errors for group", group.id);
    return group;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("group not found");
      throw new AuthenticationError({
        code: 404,
        message: "Invalid group id",
      });
    }

    log.error("invalid api key for team");
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
    const { id: group_id, team_id } = await ensureGroupAccess(req, logger);

    const body = await db.transaction(async (trx) => {
      const tests = await findEnabledTestsForGroup(
        { group_id },
        { logger, trx }
      );
      if (!tests.length) {
        logger.error("no tests for group", group_id);
        throw new Error("No tests in group");
      }

      const { suite } = await createSuiteForTests(
        {
          environment_variables: req.body.env,
          group_id,
          team_id,
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

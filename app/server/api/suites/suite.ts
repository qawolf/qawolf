import pick from "lodash/pick";
import { NextApiRequest, NextApiResponse } from "next";

import { findRunsForSuite } from "../../models/run";
import { findSuite } from "../../models/suite";
import { validateApiKeyForTeam } from "../../models/team";
import { ModelOptions, RunStatus,Suite, SuiteRun } from "../../types";

class AuthenticationError extends Error {
  code: number;

  constructor({ code, message }: { code: number; message: string }) {
    super(message);
    this.code = code;
  }
}

// errors example: https://stripe.com/docs/api/errors
const ensureSuiteAccess = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<Suite> => {
  const log = options.logger.prefix("ensureTriggerAccess");

  const api_key = req.headers.authorization;
  const suite_id = req.query.suite_id as string;

  if (!api_key) {
    log.error("no api key provided");
    throw new AuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  if (!suite_id) {
    log.error("no suite id provided");
    throw new AuthenticationError({
      code: 400,
      message: "No suite id provided",
    });
  }

  try {
    const suite = await findSuite(suite_id, options);

    await validateApiKeyForTeam({ api_key, team_id: suite.team_id }, options);

    log.debug("no errors for suite", suite.id);

    return suite;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("suite not found");
      throw new AuthenticationError({
        code: 404,
        message: "Invalid suite id",
      });
    }

    log.error("invalid api key");
    throw new AuthenticationError({
      code: 403,
      message: "API key cannot get suite",
    });
  }
};

export const getStatusForSuite = (runs: SuiteRun[]): RunStatus => {
  if (runs.some((r) => r.status === "created")) return "created";
  if (runs.some((r) => r.status === "fail")) return "fail";

  return "pass";
};

export const handleSuiteRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleSuiteRequest");

  try {
    log.debug("query", req.query);

    const { id } = await ensureSuiteAccess(req, options);

    const runs = await findRunsForSuite(id, options);
    const formattedRuns = runs.map((r) =>
      pick(r, ["id", "status", "test_name"])
    );

    const is_complete = !runs.some((r) => r.status === "created");
    const status = getStatusForSuite(runs);

    res.status(200).send({ id, is_complete, runs: formattedRuns, status });

    log.debug("completed");
  } catch (error) {
    log.alert("get suite error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};

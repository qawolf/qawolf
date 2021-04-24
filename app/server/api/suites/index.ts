import { NextApiRequest, NextApiResponse } from "next";

import environment from "../../environment";
import { ApiAuthenticationError } from "../../errors";
import { createSuiteForTrigger } from "../../models/suite";
import {
  ensureTeamCanCreateSuite,
  findTeam,
  validateApiKeyForTeam,
} from "../../models/team";
import { findTrigger } from "../../models/trigger";
import { ModelOptions, Trigger } from "../../types";
import { parseVariables } from "../../utils";

// errors example: https://stripe.com/docs/api/errors
const ensureTriggerAccess = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<Trigger> => {
  const log = options.logger.prefix("ensureTriggerAccess");

  const api_key = req.headers.authorization;
  const { trigger_id } = req.body;

  if (!api_key) {
    log.error("no api key provided");
    throw new ApiAuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  if (!trigger_id) {
    log.error("no trigger id provided");
    throw new ApiAuthenticationError({
      code: 400,
      message: "No trigger id provided",
    });
  }

  try {
    const trigger = await findTrigger(trigger_id, options);
    await validateApiKeyForTeam({ api_key, team_id: trigger.team_id }, options);

    const team = await findTeam(trigger.team_id, options);
    ensureTeamCanCreateSuite(team, options.logger);

    log.debug("no errors for trigger", trigger.id);

    return trigger;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("trigger not found");
      throw new ApiAuthenticationError({
        code: 404,
        message: "Invalid trigger id",
      });
    }

    if (error.message.includes("limit reached")) {
      log.error("limit reached");
      throw new ApiAuthenticationError({
        code: 403,
        message: "Plan limit reached",
      });
    }

    log.error("invalid api key");
    throw new ApiAuthenticationError({
      code: 403,
      message: "API key cannot create suite",
    });
  }
};

export const handleSuitesRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleSuitesRequest");

  try {
    log.debug("body", req.body);
    const { id, team_id } = await ensureTriggerAccess(req, options);

    const environment_variables = req.body.env
      ? parseVariables(req.body.env)
      : null;

    const result = await createSuiteForTrigger(
      { environment_variables, team_id, trigger_id: id },
      options
    );

    if (!result) {
      log.error("no tests for trigger", id);
      throw new Error("No tests for trigger");
    }

    const suiteId = result.suite.id;
    const url = `${environment.APP_URL}/suites/${suiteId}`;

    res.status(200).send({ id: suiteId, url });

    log.debug("completed");
  } catch (error) {
    log.alert("create suite error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};

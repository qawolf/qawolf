import { NextApiRequest, NextApiResponse } from "next";

import { createSuiteForTrigger } from "../../models/suite";
import { findTeamForApiKey } from "../../models/team";
import { findTriggersForNetlifyIntegration } from "../../models/trigger";
import { ModelOptions, Team } from "../../types";

class AuthenticationError extends Error {
  code: number;

  constructor({ code, message }: { code: number; message: string }) {
    super(message);
    this.code = code;
  }
}

const createSuitesForRequest = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<string[]> => {
  const log = options.logger.prefix("createSuitesForRequest");

  const team = await findTeamForRequest(req, options);
  const { deployment_environment, deployment_url, netlify_event } = req.body;

  if (!["deploy-preview", "production"].includes(deployment_environment)) {
    log.debug("skip: deployment_environment", deployment_environment);
    return [];
  }

  const triggers = await findTriggersForNetlifyIntegration(
    { deployment_environment, netlify_event, team_id: team.id },
    options
  );

  const suites = await Promise.all(
    triggers.map((t) => {
      return createSuiteForTrigger(
        {
          environment_variables: { URL: deployment_url },
          team_id: team.id,
          trigger_id: t.id,
        },
        options
      );
    })
  );

  const suite_ids = suites.filter((s) => s).map((s) => s.suite.id);
  log.debug("created suites", suite_ids);

  return suite_ids;
};

// errors example: https://stripe.com/docs/api/errors
const findTeamForRequest = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<Team> => {
  const log = options.logger.prefix("findTeamForRequest");

  const api_key = req.headers.authorization;

  if (!api_key) {
    log.error("no api key provided");
    throw new AuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  try {
    const team = await findTeamForApiKey(api_key, options);
    if (!team) throw new Error("not found");

    log.debug("found team", team.id);

    return team;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("invalid api key");
      throw new AuthenticationError({
        code: 403,
        message: "Invalid API Key",
      });
    }

    log.error(error.message);
    throw new AuthenticationError({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

export const handleNetlifySuitesRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleNetlifySuitesRequest");

  try {
    log.debug("body", req.body);

    const suite_ids = await createSuitesForRequest(req, options);

    res.status(200).send({ suite_ids });

    log.debug("completed");
  } catch (error) {
    log.alert("create suites error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};

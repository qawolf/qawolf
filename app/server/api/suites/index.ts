import { NextApiRequest, NextApiResponse } from "next";

import environment from "../../environment";
import { ApiAuthenticationError } from "../../errors";
import {
  findDefaultEnvironmentForTeam,
  findEnvironmentForName,
} from "../../models/environment";
import { createSuiteForTests } from "../../models/suite";
import { ensureTeamCanCreateSuite, findTeamForApiKey } from "../../models/team";
import { findEnabledTestsForTags } from "../../models/test";
import { findTriggerOrNull } from "../../models/trigger";
import { CreatedSuite, ModelOptions, Team, Test } from "../../types";
import { parseVariables } from "../../utils";

// errors example: https://stripe.com/docs/api/errors
const ensureTeamForRequest = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<Team> => {
  const log = options.logger.prefix("ensureTeamForRequest");
  const api_key = req.headers.authorization;

  if (!api_key) {
    log.error("no api key provided");
    throw new ApiAuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  try {
    const team = await findTeamForApiKey(api_key, options);
    if (!team) throw new Error("team not found");

    ensureTeamCanCreateSuite(team, options.logger);

    log.debug("no errors for team", team.id);

    return team;
  } catch (error) {
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

const createSuiteForRequest = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<CreatedSuite> => {
  const log = options.logger.prefix("createSuiteForRequest");
  const team = await ensureTeamForRequest(req, options);

  const {
    branch,
    env,
    environment: environmentName,
    tags: tagNames,
    trigger_id,
    variables,
  } = req.body;
  const environment_variables =
    variables || env ? parseVariables(variables || env) : null;

  let environment_id: string | null = null;
  let tests: Test[] = [];

  // trigger_id is deprecated and is here temporarily for backwards compatibility
  // we will remove it after we help companies use it upgrade to tags
  if (trigger_id) {
    const trigger = await findTriggerOrNull(trigger_id, options);
    environment_id = trigger?.environment_id || null;

    tests = await findEnabledTestsForTags(
      { tag_ids: [trigger_id], team_id: team.id },
      options
    );
  } else {
    const environment = environmentName
      ? await findEnvironmentForName(
          { name: environmentName, team_id: team.id },
          options
        )
      : await findDefaultEnvironmentForTeam(team.id, options);
    if (environment) environment_id = environment.id;

    tests = await findEnabledTestsForTags(
      { tag_names: tagNames, team_id: team.id },
      options
    );
  }

  if (!tests.length) {
    log.error("no tests found");
    throw new Error("No tests found");
  }

  return createSuiteForTests(
    {
      branch,
      environment_id,
      environment_variables,
      is_api: true,
      tag_names: tagNames || null,
      team_id: team.id,
      tests,
    },
    options
  );
};

export const handleSuitesRequest = async (
  req: NextApiRequest,
  res: NextApiResponse,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("handleSuitesRequest");

  try {
    log.debug("body", req.body);

    const result = await createSuiteForRequest(req, options);

    const suiteId = result.suite.id;
    const url = `${environment.APP_URL}/suites/${suiteId}`;

    res.status(200).send({ id: suiteId, url });

    log.debug("completed");
  } catch (error) {
    log.alert("create suite error", error.message);
    res.status(error.code || 500).send(error.message);
  }
};

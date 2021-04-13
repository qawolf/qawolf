import { NextApiRequest, NextApiResponse } from "next";

import { ApiAuthenticationError } from "../../errors";
import { createGitHubCommitStatus } from "../../models/github_commit_status";
import { findIntegration } from "../../models/integration";
import { createSuiteForTrigger } from "../../models/suite";
import { ensureTeamCanCreateSuite, findTeamForApiKey } from "../../models/team";
import { findTriggersForNetlifyIntegration } from "../../models/trigger";
import { createCommitStatus } from "../../services/gitHub/app";
import { Integration, ModelOptions, Suite, Team, Trigger } from "../../types";

type CreateCommitStatusForIntegration = {
  integration: Integration | null;
  suite_id: string;
  trigger: Trigger;
};

type CreateSuite = {
  integration_id: string;
  team_id: string;
  trigger: Trigger;
};

const createCommitStatusForIntegration = async (
  req: NextApiRequest,
  { integration, suite_id, trigger }: CreateCommitStatusForIntegration,
  options: ModelOptions
): Promise<void> => {
  const log = options.logger.prefix("createCommitStatusForIntegration");
  const { deployment_url, sha } = req.body;

  if (!integration) {
    log.debug("skip: no integration");
    return;
  }

  const [owner, repo] = integration.github_repo_name.split("/");

  const commitStatus = await createCommitStatus(
    {
      context: `QA Wolf - ${trigger.name}`,
      installationId: integration.github_installation_id,
      owner,
      repo,
      sha,
      suiteId: suite_id,
    },
    options
  );

  await createGitHubCommitStatus(
    {
      context: commitStatus.context,
      deployment_url,
      github_installation_id: integration.github_installation_id,
      owner,
      repo,
      sha,
      suite_id,
      trigger_id: trigger.id,
    },
    options
  );
};

const createSuite = async (
  req: NextApiRequest,
  { integration_id, team_id, trigger }: CreateSuite,
  { db, logger }: ModelOptions
): Promise<Suite | null> => {
  const { deployment_url } = req.body;

  const integration = integration_id
    ? await findIntegration(integration_id, { db, logger })
    : null;

  return db.transaction(async (trx) => {
    const options = { db: trx, logger };

    const result = await createSuiteForTrigger(
      {
        environment_variables: { URL: deployment_url },
        team_id,
        trigger_id: trigger.id,
      },
      options
    );

    if (result) {
      await createCommitStatusForIntegration(
        req,
        { integration, suite_id: result.suite.id, trigger },
        options
      );
    }

    return result ? result.suite : null;
  });
};

const createSuitesForRequest = async (
  req: NextApiRequest,
  options: ModelOptions
): Promise<string[]> => {
  const log = options.logger.prefix("createSuitesForRequest");

  const team = await findTeamForRequest(req, options);
  const { deployment_environment } = req.body;

  if (!shouldCreateSuites(deployment_environment, options)) return [];

  const triggers = await findTriggersForNetlifyIntegration(
    {
      deployment_environment:
        deployment_environment === "deploy-preview"
          ? "preview"
          : deployment_environment,
      team_id: team.id,
    },
    options
  );

  const suites = await Promise.all(
    triggers.map((t) => {
      return createSuite(
        req,
        {
          integration_id: t.deployment_integration_id,
          team_id: team.id,
          trigger: t,
        },
        options
      );
    })
  );

  const suite_ids = suites.filter((s) => s).map((s) => s.id);
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
    throw new ApiAuthenticationError({
      code: 401,
      message: "No API key provided",
    });
  }

  try {
    const team = await findTeamForApiKey(api_key, options);
    if (!team) throw new Error("not found");

    ensureTeamCanCreateSuite(team, options.logger);
    log.debug("found team", team.id);

    return team;
  } catch (error) {
    if (error.message.includes("not found")) {
      log.error("invalid api key");
      throw new ApiAuthenticationError({
        code: 403,
        message: "Invalid API Key",
      });
    }

    if (error.message.includes("limit reached")) {
      log.error("limit reached");
      throw new ApiAuthenticationError({
        code: 403,
        message: "Plan limit reached",
      });
    }

    log.error(error.message);
    throw new ApiAuthenticationError({
      code: 500,
      message: "Internal Server Error",
    });
  }
};

export const shouldCreateSuites = (
  deployment_environment: string,
  { logger }: ModelOptions
): boolean => {
  const log = logger.prefix("shouldCreateSuites");

  if (!["deploy-preview", "production"].includes(deployment_environment)) {
    log.debug("no: context", deployment_environment);
    return false;
  }

  return true;
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
